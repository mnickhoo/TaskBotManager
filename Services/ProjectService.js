require('dotenv/config');
const TelegramBot = require('node-telegram-bot-api'); //use telegram API
var http = require('http'); 
const mongoose = require('../db/mongoose');
const freelancerModel = require('../model/freelancerModel');
const {projectModel} = require('../model/projectModel');

const token = process.env.TELEGRAM_TOKEN //Set Token
var chanel_id = process.env.CHANEL_ID ; 
const options = {
    webHook: {
      port: process.env.port
    }
};
var bot = new TelegramBot(token , options); 

var projectService = {
    SendToChannel:function(chanel_id ,project){
        var text = this.CreateTemplate(project);
        var option = this.createButton(project.linkInfo,project._id)
        bot.sendMessage(chanel_id,text ,option); //SendMessage to Chanel
        console.log("send message!");   
    },
    CreateTemplate: function(project){
        var txt = project.title + "\n\n" + "توضیحات:"+ project.description + "\n\n" + "زمان تحویل:" + project.duration +
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
    createButtonPreview(projectId){
        //Create Button 
        var opts ={
            reply_markup: {
                inline_keyboard: [
                    [{text:"انتشار" , callback_data : "publish="+projectId}],
                    []              
                ]
            }         
        };
        return opts;
    },
    findProject : function(projectId){
        projectModel.findById({
            _id : projectModel
        }).then((project)=>{
            console.log("project finded!" , project);
        })
    },
    createProject : function(title , chatId){
        return new Promise((resolve , reject) =>{
            let newProject = new projectModel({
                title : title , 
                cowokerId : chatId
            })
            newProject.save().then((project)=>{
                resolve(project);
            })
        })
    },
    updateProjectDescription: function(projectId,description){
        return new Promise((resolve,reject)=>{
           projectModel.findOneAndUpdate({
               _id : projectId
           },{
               $set: {description : description}
           }).then((project)=>{
               resolve(project);
           })
        })
    },
    updateProjectDuration: function(projectId,duration){
        return new Promise((resolve,reject)=>{
           projectModel.findOneAndUpdate({
               _id : projectId
           },{
               $set: {duration : duration}
           }).then((project)=>{
               resolve(project);
           })
        })
    },
    updateProjectLinkInfo: function(projectId,linkInfo){
        return new Promise((resolve,reject)=>{
           projectModel.findOneAndUpdate({
               _id : projectId
           },{
               $set: {linkInfo : linkInfo}
           }).then((project)=>{
               resolve(project);
           }).catch((err)=>{
               reject(err);
           })
        })
    },
    updatePoint: function(projectId,point){
        return new Promise((resolve,reject)=>{
           projectModel.findOneAndUpdate({
               _id : projectId
           },{
               $set: {point : point}
           }).then((project)=>{
               resolve(project);
           }).catch((err)=>{
               reject(err);
           })
        })
    },
    findProject : function(projectId){
        return new Promise((resolve , reject)=>{
            projectModel.findById(projectId).then((project)=>{
                resolve(project);
            }).catch((err)=>{
                reject(err);
            })
        })
    }
}

module.exports = projectService ; //Create Channel Manager Module