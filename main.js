// require('dotenv').config();
const mongoose = require('./db/mongoose'); //we use mongoose CONFIGURATION
const TOKEN = process.env.TELEGRAM_TOKEN || '1174993784:AAF88wKCuFIsEi2ctayhbuwzKsED6AO_csI';
const url_local = 'https://d7a8fd604e95.ngrok.io'; //for localhost
const port = 2020; //we use port on 2020 http://localhost://2020
const chanel_id = -110829829 ; 
const express = require('express'); //we use express module
const bodyParser = require('body-parser');
const {projectModel} = require('./model/projectModel');
const {freelancerModel} = require('./model/freelancerModel');
const taskManager = require('./Services/ProjectService');
const freelancerService = require('./Services/freelancerService');
var url = require('url'); //Url Module
var fs = require('fs'); // file System
const TelegramBot = require('node-telegram-bot-api'); //use telegram API

const app = express();
app.use(bodyParser.json());

const bot = new TelegramBot(TOKEN);

bot.setWebHook(`${url_local}/bot${TOKEN}`); //set webhook by address

// var dataBaseManager = require('./Junk/DatabaseManager'); //it's depricated 
// var MongoClient = require('mongodb').MongoClient;//USE mongo liberary
// var url_db = "mongodb://localhost:27017/"; //set database URL


// No need to pass any parameters as we will handle the updates with Express
// This informs the Telegram servers of the new webhook.
// parse the updates to JSON

// We are receiving updates at the route below!
app.post(`/bot${TOKEN}`, (req, res) => {
  bot.processUpdate(req.body);
  res.sendStatus(200);
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

// webhook API just to ping!
bot.on('message', msg => {
    try {
        var chatId = msg.chat.id; //get chatId
        var text = msg.text; //get Message or Command
        freelancerModel.count({chatId : chatId} , (err , count)=>{
          if(err){
              throw err; //throw error
          }
          if(count>0){//freelancer exist on db 
          console.log("is registered!"); 
            if(text.startsWith("/start")){ //if start with /start it's command with task 
              var taskId = text.split(" ")[1];  //pass taskId to get a task from db
              projectModel.findOne({_id : taskId}).then((task)=>{ //get project selected
                let myPromise = new Promise((resolve , reject) =>{
                    var freelancer = freelancerService.findAndUpdateFreelancer(chatId , task); //find and assign task to freelancer
                    resolve(freelancer);
                }).then((freelacer)=> {
                    sendMessage(chatId , `you select project: ${freelancer.project.title}`);
                });
              });
              // place for new command :)
            }else{
                bot.sendMessage(chatId , "command is not defined!");
            }
          } else{
              //user must be register on db
              let newFreelancer = new freelancerModel({
                  name : msg.chat.first_name , 
                  family : msg.chat.last_name , 
                  chatId : chatId 
              })
              freelancerService.registerFreelancer(newFreelancer); //register freelancer
              bot.sendMessage(chatId , "you are registered!");
          }
      });
    } catch (error) {
        console.log(error)
    }
});

var sendMessage = function(chatId , message){
    bot.sendMessage(chatId , message);
}
// Start Express Server
app.listen(port, () => {
    console.log(`Bot server's listening on ${port}`);
  });
  

var sendMessage = function(chatId , Message){
    bot.sendMessage(chatId , message); 
}