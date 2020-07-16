require('dotenv/config');
const mongoose = require('./db/mongoose'); //we use mongoose CONFIGURATION
const chanel_id = process.env.chanel_id ; 
const review_chanell = process.env.review_channel;
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
const {mailService} = require('./mail/mail.js');

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
    var projectId = callbackQuery.data.split("=")[1];//splite publish to get project Id
    projectService.findProject(projectId).then((project)=>{ //send task to channel 
      let msg = projectService.SendToChannel(chanel_id , project);
      let opt = projectService.createButton(project.linkInfo,project._id, process.env.userBot);
      bot.sendPhoto(msg.chanel_id,"https://educationaldistress.eu/erasmus/media/com_projectfork/projectfork/images/icons/project-placeholder.png" , {caption : msg.text , reply_markup : opt}).then(()=>{
        bot.answerCallbackQuery(callbackQuery.id, { show_alert : true , text : "پروژه با موفقیت در کانال ارسال شد" });
      }).catch((err)=>{
        bot.answerCallbackQuery(callbackQuery.id, { show_alert : true , text : "وادر ارسال پروژه با خطایی مواجعه شدیم" });
        bot.sendMessage(callbackQuery.message.chat.id , err.message);
      })
    })
  }else if(callbackQuery.data.startsWith("accept")){//
    //after coWorker accept project will have been deleted from chanel
    let data = ConvertToObject(callbackQuery.data);
    let projectId = data.projectId; 
    let freelancerId = data.chatId;
    if(data.accept == "true"){
    //send a message to freelancer you can do it 
    projectService.findProject(projectId).then((project)=>{
      project.status = ProjectStatus.DOING; //change status project to doing
      let task = {projectId : projectId , cowokerId : project.cowokerId  , status : ProjectStatus.DOING , point : project.point , title : project.title}
      freelancerService.haveThisProject(callbackQuery.message.chat.id, projectId).then((result)=>{
        if(result){
          bot.sendMessage(callbackQuery.message.chat.id, "این پروژه به این فریلنسر داده شده است",mainMenue())
        }else{ //you have this project
          freelancerService.addProject(freelancerId , task ).then(()=>{//find and assign task to freelancer
            bot.sendMessage(freelancerId , `درخواست شما برای این پروژه با موفقیت قبول شد \n نام پروژه : ${project.title} \n توضیحات : ${project.description}`);
            bot.sendMessage(freelancerId , `شما به مدت ${project.duration} روز زمان دارید.`);
            projectService.updateFreelancerIdAndStatus(projectId , ProjectStatus.DOING , freelancerId).catch((err)=>{
              console.log(err);
            })
          }).catch((err)=>{
            console.log(err);
          });
        }
      });

      });
    }else{
      //send a decline message to freelancer (
      projectService.findProject(projectId).then((project)=>{
        bot.sendMessage(freelancerId , `درخواست شما برای پروژه "${project.title}" توسط کارفرما رد شد.`);
      })
    } 
  }else if(callbackQuery.data.startsWith("projectId")){ //Select project by user
    var projectId = callbackQuery.data.split("=")[1];
    projectService.findOne(projectId).then((project)=>{
      var opts ={
        inline_keyboard: [[{text : "کنسل" , callback_data : "CancellProject="+projectId},{text : "اتمام پروژه" , callback_data : "finishProject="+projectId}],[{text : "پروژه های من " , callback_data : "myProject"}]]    
      };
      let chatIdUpdate = callbackQuery.message.chat.id;
      let messageId = callbackQuery.message.message_id;
      let text = `پروژه: ${project.title} \n توضیحات: ${project.description}`;
      editMessageText(chatIdUpdate, messageId , text , opts );
    })
  }else if(callbackQuery.data == "myProject"){ //show list of projects
      freelancerService.findFreelancer(callbackQuery.from.id).then((freelancer)=>{
        if(freelancer.projects.length > 0){ // if freelancer have a project
          let inline_keyboards = [];
          let keyboard ; 
          freelancer.projects.forEach((project)=>{
            if(project.status == ProjectStatus.DOING){
              keyboard = [{text : project.title , callback_data : "projectId="+project.projectId}]
              inline_keyboards.push(keyboard);
            }
          })
          inline_keyboards.push([]);
        //   var opts ={
        //     reply_markup: {
        //         inline_keyboard: inline_keyboards
        //     }         
        // };

        var opts ={
          inline_keyboard: inline_keyboards   
        };
        let chatIdUpdate = callbackQuery.message.chat.id;
        let messageId = callbackQuery.message.message_id;
        let text = "پروژه های در حال انجام";
        editMessageText(chatIdUpdate , messageId , text , opts)
        }else{ //freelancer has not project
          bot.sendMessage(chatId, "شما هیچ پروژه فعالی ندارید", mainMenue());
        }
      })
  }else if(callbackQuery.data.startsWith("CancellProject")){//cancell project
    var projectId = callbackQuery.data.split("=")[1];
    //change project status to todo
    projectService.updateProjectStatus(projectid,ProjectStatus.TODO).then((project)=>{
      bot.sendMessage(chatid , "پروژه با موفقیت کنسل شد" , mainMenue());

      //delete project from freelancer

    //publish on chnnel
    projectService.findProject(projectId).then((project)=>{ //send task to channel 
      let msg = projectService.SendToChannel(chanel_id , project);

      let opt = projectService.createButton(project.linkInfo,project._id, process.env.userBot);
      bot.sendPhoto(msg.chanel_id,"https://educationaldistress.eu/erasmus/media/com_projectfork/projectfork/images/icons/project-placeholder.png" , {caption : msg.text , reply_markup : opt}).then(()=>{
        bot.answerCallbackQuery(callbackQuery.id, { show_alert : true , text : "پروژه با موفقیت کنسل شد" });
      }).catch((err)=>{
        console.log(err);
      })
    })
    })
  }else if(callbackQuery.data.startsWith("finishProject")){ //when user press on finish button
    var projectId = callbackQuery.data.split("=")[1];
    //add projectId to lastCreated
    freelancerService.updateLastProjectId(callbackQuery.message.chat.id, projectId);
    //send message that send me a Note about project
    freelancerService.updateLastCommmand(callbackQuery.message.chat.id ,"/addNote"); //update last Command
    bot.sendMessage(callbackQuery.message.chat.id , "لطفا درباره پروژه توضیح دهید تا برای بررسی سمت کارفرما ارسال شود." , keyboard);


    // //change project status to review
    // freelancerService.updateProjectStatus(callbackQuery.message.chat.id,projectId,ProjectStatus.REVIEW).then(()=>{
    //   //update project collection
    //   projectService.updateProjectStatus(projectId,ProjectStatus.REVIEW).then((project)=>{
    //     let msg = projectService.SendToChannel(review_chanell , project);
    //     let opt = projectService.createButtonReview(project.linkInfo,project._id, process.env.userBot);
    //     //send post to review channel
    //     bot.sendPhoto(msg.chanel_id,"https://educationaldistress.eu/erasmus/media/com_projectfork/projectfork/images/icons/project-placeholder.png" , {caption : msg.text , reply_markup : opt}).then(()=>{
    //       bot.answerCallbackQuery(callbackQuery.id, { show_alert : true , text : "پروژه برای بررسی ارسال شد" });
    //       //send message to freelancer for review
    //       bot.sendMessage(chatid , "در حال حاضر پروژه برای برررسی به مدیریت ارسال شد لطفا منتظر بمانید" , mainMenue());
    //     }).catch((err)=>{
    //       console.log(err);
    //     })
    //   })
    // })
  }
  else{//go to switch
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
                    let keyboard = mainMenue();
                    bot.sendMessage(chatId, "تمام دستورات لغو شد!", keyboard);
                    //delete project from db

                  })
              }else if(message == "لینک ندارم"){
                let rmkeyboard = removeKeyboard();
                freelancerService.updateLastCommmand(chatId,"/point").then(()=>{
                  bot.sendMessage(chatId, "امتیاز پروژه رو به عدد برای من بفرستید",rmkeyboard);
                });
              }else if(message == "ثبت نظر و اتمام پروژه"){
                //get last projectId
                freelancerService.getLastProjectId(chatId).then((projectId)=>{
                //change project status to review
                freelancerService.updateProjectStatus(chatId,projectId,ProjectStatus.REVIEW).then(()=>{
                  //update project collection
                  projectService.updateProjectStatus(projectId,ProjectStatus.REVIEW).then((project)=>{
                    let msg = projectService.SendToChannel(review_chanell , project);
                    let opt = projectService.createButtonReview(project.linkInfo,project._id, process.env.userBot);
                    //send post to review channel
                    bot.sendPhoto(msg.chanel_id,"https://educationaldistress.eu/erasmus/media/com_projectfork/projectfork/images/icons/project-placeholder.png" , {caption : msg.text , reply_markup : opt}).then(()=>{
                      bot.answerCallbackQuery(callbackQuery.id, { show_alert : true , text : "پروژه برای بررسی ارسال شد" });
                      //send message to freelancer for review
                      bot.sendMessage(chatid , "در حال حاضر پروژه برای برررسی به مدیریت ارسال شد لطفا منتظر بمانید" , mainMenue());
                    }).catch((err)=>{
                      console.log(err);
                    })
                  })
                })
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
                      //add link to lastComamnd
                      let keyboard = {
                        reply_markup : {
                          keyboard: [
                            [{text:"لینک ندارم"}],
                            []              
                        ],
                        resize_keyboard : true
                        }
                      }
                      freelancerService.updateLastCommmand(chatId,"/link").then(()=>{
                        bot.sendMessage(chatId, "خب حالا لینک مرتبط به پروژه را برای من بفرست" , keyboard);
                      });
                    });
                  });
                  break;
                  case "/link":
                    let pattern = "^(https?|chrome):\/\/[^\s$.?#].[^\s]*$";
                    let regex = new RegExp(pattern); 
                   if(message.match(regex)){
                        //read last project Id and find project and description field.
                        freelancerService.findFreelancer(chatId).then((freelancer)=>{
                          projectService.updateProjectLinkInfo(freelancer.lastCreatedProject , message).then(()=>{
                          //add exprireDate to lastComamnd
                          freelancerService.updateLastCommmand(chatId,"/point").then(()=>{
                            bot.sendMessage(chatId, "امتیاز پروژه رو به عدد برای من بفرستید");
                          });
                        });
                      });
                   }else{ //has not matched
                    bot.sendMessage(chatId , "آدرس صحیح نمی باشد لطفا آدرس صحیح را وارد کنید");
                   }
                  break;
                  case "/point":
                    freelancerService.findFreelancer(chatId).then((freelancer)=>{
                      projectService.updatePoint(freelancer.lastCreatedProject , message).then(()=>{
                      //add exprireDate to lastComamnd
                      freelancerService.updateLastCommmand(chatId,null).then(()=>{
                        let keyboard = mainMenue();
                        bot.sendMessage(chatId, "تبریک میگم \n پروژه شما با موفقیت ایجاد شد",keyboard);
                         //send a preview of task with publish button
                      freelancerService.findFreelancer(chatId).then((freelancer)=>{
                        projectService.findProject(freelancer.lastCreatedProject).then((project)=>{
                        let text = projectService.CreateTemplate(project);
                        let option = projectService.createButtonPreview(project._id.toString())
                        bot.sendMessage(chatId, text , option);
                      });
                    });
                  });
                });
              });
                    break;
                  case "/email" : 
                    //check email is validate?

                      //save email on db   
                       freelancerService.updateEmail(chatId,message).then((freelancer)=>{
                          mailService.sendMail(message, "activation" ,freelancer.activateCode).then(()=>{
                            freelancerService.updateLastCommmand(chatId,"/verifying").then(()=>{
                              bot.sendMessage(chatId , "لطفا کدی که به ایمیلت فرستادیم رو چک کنید");
                            }).catch(()=>{
                              bot.sendMessage(chatId , "خطایی رخ داده")
                            })
                          })
                        })
                  break;
                  case '/verifying' : 
                  //check activation code 
                  if(freelancerService.checkValidation(message,freelancer.freelancer.activateCode)){ //true verifying
                    //set lastCommand to null
                    freelancerService.updateLastCommmand(chatId,null).then(()=>{
                      freelancerService.updateIsverified(chatId,true).then(()=>{
                        //sned message you has been verified
                        let keyboard = mainMenue();
                        bot.sendMessage(chatId,"حساب شما با موفقیت فعال گردید." , keyboard);
                        //send channel link 
                        bot.sendMessage(chatId, "در کانال زیر عضو شوید و پروژه های مرتبط را انتخاب کنید \n https://t.me/kidocodetasks");
                      })
                    });
                  }else{
                    bot.sendMessage(chatId,"کد تایید صحیح نمی باشد.")
                  }        
                  break;
                  case "/finish":
                    freelancerService.updateLastCommmand(chatId,null).then(()=>{
                    });
                  break;
                  case "/addNote":
                    freelancerService.getLastProjectId(chatId).then((lastProjectId)=>{
                      projectService.updateProjectNote(lastProjectId , message).then((project)=>{
                      //with a keyboard 
                      let keyboard = {
                        reply_markup : {
                          keyboard: [
                            [{text:"ثبت نظر و اتمام پروژه"}],
                            []              
                        ],
                        resize_keyboard : true
                        }
                      }
                      bot.sendMessage(chatid, "پیام شما دریافت شد با زدن دکمه ثبت نظر پروژه را به اتمام برسانید" , keyboard);
                      })

                    })
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
                  chatId : chatId , 
                  activateCode : freelancerService.generateCode(), 
                  userName : freelancerService.generateUserId(5)
              })
              freelancerService.registerFreelancer(newFreelancer).then((isRegistered)=>{ //register user in db
                if(isRegistered){
                  // processTheMessage(chatId,message); //process the command 
                  freelancerService.updateLastCommmand(chatId,"/email").then(()=>{
                    bot.sendMessage(chatId , "ثبت ایمیل: \n برای تکمیل ثبت نام لطفا ایمیل خود را وارد کنید ...");
                  });
                }
              })       
          } 
      }).catch((err)=>{
        console.log(err);
      })
  } catch (error) {
      console.log(error)
  }
});

// bot.on('new_chat_members', (ctx) => console.log(ctx.message.new_chat_members))
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
    if(message.startsWith("/start")){
      if(message.indexOf(" ") == -1){
        //create menue chat bot 
        bot.sendMessage(chatId , "به ربات مدیریت پروژه خوش آمدید :)" , mainMenue() )
      }else{
        if(message.startsWith("/start review")){
          var projectId = message.split("=")[1];
          projectService.findOne(projectId).then((project)=>{
            //run on project
            var opts ={
              inline_keyboard: [[{text : "کنسل" , callback_data : "CancellProject="+projectId},{text : "اتمام پروژه" , callback_data : "finishProject="+projectId}],[{text : "پروژه های من " , callback_data : "myProject"}]]    
            };
            // let chatIdUpdate = callbackQuery.message.chat.id;
            // let messageId = callbackQuery.message.message_id;
            let text = `پروژه: ${project.title} \n توضیحات: ${project.description}`;
            // var markup = {
            //   chat_id: callbackQuery.message.chat.id,
            //   message_id: callbackQuery.message.message_id,
            //   reply_markup: opts
            // }
            // console.log(project);
            bot.sendMessage(chatId, text );
          });
          //SHOW IN REIVIEW 
          bot.sendMessage(chatId,"جهت بررسی");
        }else{
          var taskId = message.split(" ")[1];  //pass taskId to get a task from db
          freelancerService.findFreelancer(chatId).then((freelancer)=>{
            //check user is Mojaz
            if(freelancer.isMojaz){
            //check point Score to get the project if under 100 Score can't take over 1 project
            if(freelancer.point < 100){
              if(freelancer.projects.length != 0){//means now have an active project
              //send message you have an active project
              bot.sendMessage(chatId , "شما در حال حاضر یک پروژه فعال در دست دارید." , mainMenue());
              }else{ //have not any project
              //send a request to Coworker to accept request 
              requestFreelancer(taskId,chatId,freelancer);
              }
            }else{ //have enought point and get a new project
              requestFreelancer(taskId,chatId,freelancer);
              //should be assign a new project to freelancer
  
              //and finally send a message to freelancer
  
            }
            }else{ //is not Mojaz
              bot.sendMessage(chatId , "شما مجاز به دریافت پروژه نمی باشید.",mainMenue());
            }
          });
        }
      


        //after coWorker accept project will have been deleted from chanel

        //send a message to freelancer you can do it 

        //change status project to doing

        //send schadule time to 
        
        //set menu to chat with coWorker or Done project

      }
    }else{
      switch(message){
        case "/cancell":
          //set null to last command
          freelancerService.updateLastCommmand(chatId,null).then((freelacer)=>{
            bot.sendMessage(chatId, "تمامی دستورات لغو شد!",mainMenue())
          })
          break;
        case "/create":
          freelancerService.updateLastCommmand(chatId,"/title").then(()=>{
            bot.sendMessage(chatId, "لطفا عنوان پروژه رو برام بفرست");
          })
          break;
        default:
          bot.sendMessage(chatId , "دستور تعریف نشده!",mainMenue());
      }
    }
  }else{//message not command
    switch(message){
      case "🥇 امتیاز های من": 
      //show point of freelancer
      freelancerService.findFreelancer(chatId).then((freelancer)=>{
        bot.sendMessage(chatId, `🥇 امتیاز شما : ${freelancer.point}`);
      });
    break;
    case "🧳 پروژه های من" : 
      //show project list 
      freelancerService.findFreelancer(chatId).then((freelancer)=>{
        if(freelancer.projects.length > 0){ // if freelancer have a project
          let inline_keyboards = [];
          let keyboard ; 
          freelancer.projects.forEach((project)=>{
            if(project.status == ProjectStatus.DOING){
              keyboard = [{text : project.title , callback_data : "projectId="+project.projectId}]
              inline_keyboards.push(keyboard);
            }
          })
          inline_keyboards.push([]);
          var opts ={
            reply_markup: {
                inline_keyboard: inline_keyboards
            }         
        };
         bot.sendMessage(chatId , "پروژه های در حال انجام", opts);

        }else{ //freelancer has not project
          bot.sendMessage(chatId, "شما هیچ پروژه فعالی ندارید",mainMenue());
        }
      })
    break;
    case "🛠 تنظیمات": 
      bot.sendMessage(chatId , "به زودی این قسمت اضافه می شود.");
    break;
    default: 
    let keyboard = mainMenue();
    bot.sendMessage(chatId , "دستور تعریف نشده!" , keyboard);
    break;
    }
  }
}

function ConvertToObject(stringParameter){
  let obj = {};
  let parameters = stringParameter.split("&");
  parameters.forEach(param => {
    let part = param.split("=");
    obj[part[0]] = part[1];
  });
  return obj;
}
//for publish
function requestFreelancer(taskId,chatId,freelancer){
  //send a request to Coworker to accept request 
  projectService.findProject(taskId).then((project)=>{
    //check project freelancerId isn't null and status == doing || project has been assigne to other!
    if(project.freelancerId != null && project.status == ProjectStatus.DOING){
      bot.sendMessage(chatId, "متاسفانه این پروژه توسط فریلنسر دیگری در حال انجام است :(", mainMenue());
    }else if(project.status == ProjectStatus.TODO){
    //send freelancer chat Id and project Id 
   let opt = projectService.createButtonAcceptRequest(chatId , project._id);
   //send message to coworker
   bot.sendMessage(project.cowokerId , `کاربر درخواست انجام پروژه شما را دارد \n کاربر : ${freelancer.name} \n نام پروژه : ${project.title} `, opt);
   //send a message to freelancer
   bot.sendMessage(chatId, "درخواست شما برای کارفرما ارسال شد لطفا منتظر بمانید" , mainMenue());
    }     
  });
}


function mainMenue(){
  let keyboard = {
    reply_markup : {
      keyboard: [
        [{text:"🧳 پروژه های من"}],
        [{text : "🥇 امتیاز های من"}],
        [{text: "🛠 تنظیمات"}]           
    ],
    resize_keyboard : true
    }
  }

  return keyboard;
}

function removeKeyboard(){
  let removeKeyboard = {
    reply_markup : {
      remove_keyboard : true
      }
    }
    return removeKeyboard; 
}

function editMessageText(chatId , messageId , text, opts , ){
  return new Promise((resolve , reject) =>{
    var markup = {
      chat_id: chatId,
      message_id: messageId,
      reply_markup: opts
    }
    bot.editMessageText(text, markup).then((response) => {
      resolve(response);
    }).catch((err)=>{
      reject(err);
    })
  })
}

const ProjectStatus = {
  TODO : "todo",
  DOING : "doing",
  REVIEW : "review",
  REJECT : "reject"
}