require('dotenv/config');
const mongoose = require('./db/mongoose'); //we use mongoose CONFIGURATION
const chanel_id = process.env.chanel_id ; 
const express = require('express'); //we use express module
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const {projectModel} = require('./model/projectModel');
const {freelancerModel} = require('./model/freelancerModel');
const projectService = require('./Services/ProjectService');
// const taskManager = require('./Services/ProjectService');
const freelancerService = require('./Services/freelancerService');
var url = require('url'); //Url Module
var fs = require('fs'); // file System

const app = express();
app.use(bodyParser.json());

// const TOKEN = process.env.TELEGRAM_TOKEN || '1174993784:AAF88wKCuFIsEi2ctayhbuwzKsED6AO_csI';
// const TelegramBot = require('node-telegram-bot-api');
const TelegramBot = require('node-telegram-bot-api'); //use telegram API
const TOKEN = process.env.TELEGRAM_TOKEN || '1174993784:AAF88wKCuFIsEi2ctayhbuwzKsED6AO_csI';
/* Remeber */

const options = {
  webHook: {
    port: port
    // port : 2020
  }
};

const urlConfig = process.env.APP_URL || 'https://tranquil-inlet-79772.herokuapp.com/';
// const urlConfig = "https://2614ea314925.ngrok.io";
const bot = new TelegramBot(TOKEN, options);

// This informs the Telegram servers of the new webhook.
// Note: we do not need to pass in the cert, as it already provided
bot.setWebHook(`${urlConfig}/bot${TOKEN}`);

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

bot.on('callback_query', (callbackQuery)=>{
  //check the query data 
  if(callbackQuery.data.startsWith("publish")){//start with publish
    var projectId = callbackQuery.data.split("=")[1];
    //splite publish to get project Id
    projectService.findProject(projectId).then((project)=>{ //send task to channel 
      projectService.SendToChannel(process.env.chanel_id , project)
      bot.answerCallbackQuery(callbackQuery.id, { show_alert : true , text : "پروژه با موفقیت در کانال ارسال شد" });
    })
  }else{//go to switch
    switch(callbackQuery.data){
      case "sample" : 
  
      break; 
    }
  }


})

// webhook API just to ping!
bot.on('message', msg => {
  try {
      var chatId = msg.chat.id; //get chatId
      var message = msg.text; //get Message or Command
      freelancerService.isRegistered(chatId).then((registered)=> { 
        if(registered){//is user registered!?
          freelancerService.hasLastCommand(chatId).then((freelancer)=>{
            if(freelancer.hasLastCommand){//is user has last commamnd?
              //PROCESS THE LAST COMAMND 
              if(message == "/cancell"){ //check is user cancelled!?
                  //set null to last command
                  freelancerService.updateLastCommmand(chatId,null).then((freelacer)=>{
                    bot.sendMessage(chatId, "تمام دستورات لغو شد!")
                  })
              }else{
                switch(freelancer.lastCommand){
                  case "/title":
                    projectService.createProject(message , chatId).then((project)=>{
                      //set lastProjectId to freelancer
                      console.log(project._id.toString())
                      freelancerService.updateLastProjectId(chatId ,  project._id.toString()).then(()=>{
                        //set last command to description
                        freelancerService.updateLastCommmand(chatId,"/description").then(()=>{
                        //send message ok now tell me yomur description
                        bot.sendMessage(chatId , "خیلی عالی! \n  یکم بیشتر در مورد پروژه ای که میخواهی تعریف کن ببینم \n در هر مرحله با دستور /cancell عملیات رو لغو کنید");
                        })
                      }).catch((err)=>{
                        console.log(err);
                      })
                    })
                  break;
                  case "/description":
                    //read last project Id and find project and description field.
                    freelancerService.findFreelancer(chatId).then((freelancer)=>{
                      projectService.updateProjectDescription(freelancer.lastCreatedProject , message).then(()=>{
                      //add exprireDate to lastComamnd
                      freelancerService.updateLastCommmand(chatId,"/expiredate").then(()=>{
                        bot.sendMessage(chatId, "چقدر وقت داری؟ \n بر اساس روز برام بفرست");
                      });
                    });
                  });
                  break;
                  case "/expiredate": 
                    //read last project Id and find project and description field.
                    freelancerService.findFreelancer(chatId).then((freelancer)=>{
                      projectService.updateProjectDuration(freelancer.lastCreatedProject , message).then(()=>{
                      //add exprireDate to lastComamnd
                      freelancerService.updateLastCommmand(chatId,"/link").then(()=>{
                        bot.sendMessage(chatId, "خب حالا لینک مرتبط به پروژه را برای من بفرست");
                      });
                    });
                  });
                  break;
                  case "/link":
                    //read last project Id and find project and description field.
                    freelancerService.findFreelancer(chatId).then((freelancer)=>{
                      projectService.updateProjectLinkInfo(freelancer.lastCreatedProject , message).then(()=>{
                      //add exprireDate to lastComamnd
                      freelancerService.updateLastCommmand(chatId,null).then(()=>{
                        bot.sendMessage(chatId, "تبریک میگم! \n پروژه ات با موفقیت ثبت شد");
                        //send a preview of task with publish button
                        freelancerService.findFreelancer(chatId).then((freelancer)=>{
                          projectService.findProject(freelancer.lastCreatedProject).then((project)=>{
                          let text = projectService.CreateTemplate(project);
                          let option = projectService.createButtonPreview(project._id.toString())
                          bot.sendMessage(chatId, text , option);
                        })
                      })
                      });
                    });
                  });
                  break;
                  case "/finish":
                    freelancerService.updateLastCommmand(chatId,null).then(()=>{
                    });
                  break;
                }
              }
            }else{//user hasn't last command
                processTheMessage(chatId,message);  //MESSAGE IS A COMMAND?
            }
          })
          } else{//user must be register on db      
              let newFreelancer = new freelancerModel({
                  name : msg.chat.first_name , 
                  family : msg.chat.last_name , 
                  chatId : chatId 
              })
              freelancerService.registerFreelancer(newFreelancer).then((isRegistered)=>{ //register user in db
                if(isRegistered){
                  processTheMessage(chatId,message); //process the command 
                  bot.sendMessage(chatId , "شما با موفقیت ثبت نام شدید");
                }
              })       
          } 
      })
  } catch (error) {
      console.log(error)
  }
});

var sendMessage = function(chatId , message){
  bot.sendMessage(chatId , message);
}

var isCommand = function(message){
    if(message.startsWith("/")){
      return true;
    }else{
      return false;
    }
}

var processTheMessage = function(chatId,message){
  if(isCommand(message)){//is message has a command?
    switch(message){
      case "/start":
        if(message.indexOf(" ") == -1){
          bot.sendMessage(chatId , "به ربات مدیریت پروژه خوش آمدید :)")
        }else{
          var taskId = message.split(" ")[1];  //pass taskId to get a task from db
          projectModel.findOne({_id : taskId}).then((task)=>{ //get project selected
            let myPromise = new Promise((resolve , reject) =>{
                var freelancer = freelancerService.findAndUpdateFreelancer(chatId , task); //find and assign task to freelancer
                resolve(freelancer);
            }).then((freelacer)=> {
                sendMessage(chatId , `شما درخواستی شما: ${freelancer.project.title}`);
            });
          });
        }
        break;
      case "/cancell":
        //set null to last command
        freelancerService.updateLastCommmand(chatId,null).then((freelacer)=>{
          bot.sendMessage(chatId, "تمامی دستورات لغو شد!")
        })
        break;
      case "/create":
        freelancerService.updateLastCommmand(chatId,"/title").then(()=>{
          bot.sendMessage(chatId, "لطفا عنوان پروژه رو برام بفرست");
        })
        break
      default:
        bot.sendMessage(chatId , "دستور تعریف نشده!");
    }
  }else{//message not command
    bot.sendMessage(chatId , "دستور تعریف نشده!");
  }
}
