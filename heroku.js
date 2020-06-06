require('dotenv/config');
// const mongoose = require('./db/mongoose'); //we use mongoose CONFIGURATION
const chanel_id = process.env.chanel_id ; 
const express = require('express'); //we use express module
const bodyParser = require('body-parser');
// const {projectModel} = require('./model/projectModel');
// const {freelancerModel} = require('./model/freelancerModel');
// const taskManager = require('./Services/ProjectService');
// const freelancerService = require('./Services/freelancerService');
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
    port: process.env.PORT
  }
};

const urlConfig = process.env.APP_URL || 'https://tranquil-inlet-79772.herokuapp.com/';
const bot = new TelegramBot(TOKEN, options);


// This informs the Telegram servers of the new webhook.
// Note: we do not need to pass in the cert, as it already provided
bot.setWebHook(`${urlConfig}/bot${TOKEN}`);


// Just to ping!
bot.on('message', function onMessage(msg) {
  var chatId = msg.chat.id; //get chatId
  var text = msg.text; //get Message or Command
  bot.sendMessage(msg.chat.id, 'Hi my name is Task Bot');
  if(text == "/maysam"){
    bot.sendMessage("hello maysam :)");
  }
});




app.get('/insert', function(req , res){
  var q = url.parse(req.url, true); //get url 
  var filename = "./views/insert.html" //find fileName
  fs.readFile(filename,function(err, data) {
    if(err) {
      res.writeHead(404,{'Content-Type': 'text/html'});
      return res.end("404 Not Found");
    } //Error 404 not Found
    res.writeHead(200, {'Content-Type': 'text/html'});
    if(q.query.title != null){
      //initiate to project object

      let newProject = new project({
          title : q.query.title , 
          description : q.query.description, 
          linkInfo : q.query.linkInfo , 
          expireDate : q.query.expireDate, 
          point : q.query.point
      }); 
      //save to db 
      newProject.save().then((project)=>{
          //send project to channel
          taskManager.SendToChannel(chanel_id , project); //send Task to Channel  

          console.log("project has been saved." , project);     
      },(err) =>{
          console.log("project unable to save on db", err);
      });
    }
    res.write(data); //return view
    return res.end();
  });
});