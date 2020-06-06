require('dotenv').config(); //Add .env 
const TelegramBot = require('node-telegram-bot-api'); //use telegram API
var http = require('http'); 
const mongoose = require('../db/mongoose');
const projectModel = require('../model/freelancerModel');

const token = process.env.TELEGRAM_TOKEN //Set Token
var chanel_id = process.env.CHANEL_ID ; 
const options = {
    webHook: {
      port: 80
    }
};
var bot = new TelegramBot(token , options); 

var projectService = {
    task : {
    id : "",
    title: " ",
    description : "",
    linkInfo : "",
    status:"",
    freelancer:"",
    publisher:"",
    expireDate:"",
    point:"",
    image:""
    }, 
    SendToChannel:function(chanel_id ,project){
        var text = this.CreateTemplate(project);
        var option = this.createButton(project.linkInfo,project._id)
        bot.sendMessage(chanel_id,text ,option); //SendMessage to Chanel
        console.log("send message!");   
    },
    CreateTemplate: function(project){
        var txt = project.title + "\n\n" + "توضیحات:"+ project.description + "\n\n" + "زمان تحویل:" + project.expireDate +
        "\n\n"+"امتیاز:" + project.point;
        return txt ; 
    },
    createButton(linkInfo,_id){
        //Create Button 
        var opts ={
            reply_markup: {
                inline_keyboard: [
                    [{text:"بیشتر" , url: linkInfo}, {text:"قبول", url: "https://t.me/yechizebahalbot?start="+_id}],
                    []              
                ]
            }         
        };
        return opts;
    } , 
    findProject : function(projectId){
        projectModel.findById({
            _id : projectModel
        }).then((project)=>{
            console.log("project finded!" , project);
        })
    }
}

module.exports = projectService ; //Create Channel Manager Module