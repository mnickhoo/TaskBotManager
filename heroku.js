require('dotenv/config');
const mongoose = require('./db/mongoose'); //we use mongoose CONFIGURATION
const chanel_id = process.env.chanel_id ; 
const express = require('express'); //we use express module
const bodyParser = require('body-parser');
const port = process.env.PORT || 3000;
const {projectModel} = require('./model/projectModel');
const {freelancerModel} = require('./model/freelancerModel');
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

const options = {
  webHook: {
    port: port
    // port : 2020
  }
};

// const urlConfig = process.env.APP_URL || 'https://tranquil-inlet-79772.herokuapp.com/';
const urlConfig = "https://2614ea314925.ngrok.io";
const bot = new TelegramBot(TOKEN, options);

// This informs the Telegram servers of the new webhook.
// Note: we do not need to pass in the cert, as it already provided
bot.setWebHook(`${urlConfig}/bot${TOKEN}`);

// app.get('/insert', function(req , res){
//   var q = url.parse(req.url, true); //get url 
//   var filename = "./views/insert.html" //find fileName
//   fs.readFile(filename,function(err, data) {
//     if(err) {
//       res.writeHead(404,{'Content-Type': 'text/html'});
//       return res.end("404 Not Found");
//     } //Error 404 not Found
//     res.writeHead(200, {'Content-Type': 'text/html'});
//     if(q.query.title != null){
//       //initiate to project object

//       let newProject = new projectModel({
//           title : q.query.title , 
//           description : q.query.description, 
//           linkInfo : q.query.linkInfo , 
//           expireDate : q.query.expireDate, 
//           point : q.query.point
//       }); 
//       //save to db 
//       newProject.save().then((project)=>{
//           //send project to channel
//           taskManager.SendToChannel(chanel_id , project); //send Task to Channel  

//           console.log("project has been saved." , project);     
//       },(err) =>{
//           console.log("project unable to save on db", err);
//       });
//     }
//     res.write(data); //return view
//     return res.end();
//   });
// });

app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
});

// webhook API just to ping!
bot.on('message', msg => {
  try {
      var chatId = msg.chat.id; //get chatId
      var message = msg.text; //get Message or Command
      freelancerService.isRegistered(chatId).then((registered)=> { 
        if(registered){//is user registered!?
          freelancerService.hasLastCommand(chatId).then((hasLastCommand)=>{
            if(hasLastCommand){//is user has last commamnd?
              //PROCESS THE LAST COMAMND 
              if(message.startsWith("/cancell")){
                //set null to last command
                freelancerService.updateLastCommmand(chatId,null).then((freelacer)=>{
                  bot.sendMessage(chatId, "the progress has been canceled!")
                })
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
                  bot.sendMessage(chatId , "you are registered!");
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
        var taskId = message.split(" ")[1];  //pass taskId to get a task from db
        projectModel.findOne({_id : taskId}).then((task)=>{ //get project selected
          let myPromise = new Promise((resolve , reject) =>{
              var freelancer = freelancerService.findAndUpdateFreelancer(chatId , task); //find and assign task to freelancer
              resolve(freelancer);
          }).then((freelacer)=> {
              sendMessage(chatId , `you select project: ${freelancer.project.title}`);
          });
        });
        break;
      case "/cancell":
        //set null to last command
        freelancerService.updateLastCommmand(chatId,null).then((freelacer)=>{
          bot.sendMessage(chatId, "the progress has been canceled!")
        })
        break;
      case "/create":
        freelancerService.updateLastCommmand(chatId,"/title").then(()=>{
          bot.sendMessage(chatId, "ok send me title of task");
        })
        break
      default:
        bot.sendMessage(chatId , "command is not defined!");
    }
  }else{//message not command
        bot.sendMessage(chatId , "command is not defined!");
  }
}

// // Start Express Server
// app.listen(port, () => {
//   console.log(`Bot server's listening on ${port}`);
// });

// var sendMessage = function(chatId , Message){
//   bot.sendMessage(chatId , message); 
// }

// app.get('/' , function(req , res){
//   res.writeHead(200 , {'Content-Type': 'text/html'}); 
//   res.write("salam :)");
//   res.end();
// })

// // We are receiving updates at the route below!
// app.post(`/bot${TOKEN}`, (req, res) => {
//   bot.processUpdate(req.body);
//   res.sendStatus(200);
// });

// // Start Express Server
// app.listen(port, () => {
//   console.log(`Bot server's listening on ${port}`);
// });

// // Just to ping!
// bot.on('message', function onMessage(msg) {
//   var chatId = msg.chat.id; //get chatId
//   var text = msg.text; //get Message or Command
//   if(text == "/maysam"){
//     bot.sendMessage(msg.chat.id, "hello maysam :)");
//   }else if (text == "mahdi"){
//     bot.sendMessage(msg.chat.id, 'my father is mahdi :D');
//   }else{
//     // bot.sendMessage(msg.chat.id, 'Hi my name is Task Bot');
//   }
// });