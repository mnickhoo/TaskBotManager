require('dotenv/config');
const TelegramBot = require('node-telegram-bot-api'); //use telegram API
var http = require('http'); 
const mongoose = require('../db/mongoose');
const freelancerModel = require('../model/freelancerModel');
const {projectModel} = require('../model/projectModel');
const { promises } = require('fs');

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
            return({"chanel_id" : chanel_id , "text" : text })   
    },
    CreateTemplate: function(project){
        var txt = project.title + "\n\n" + "توضیحات:"+ project.description + "\n\n" + "زمان تحویل:" + project.duration +
        "\n\n"+"امتیاز:" + project.point;
        return txt ; 
    },
    createButton(linkInfo,projectId,userBot){
        try{
            var opt ;
            if(linkInfo != null){
                 opt = {
                    inline_keyboard: [
                    [{text:"بیشتر" , url: linkInfo}, {text:"قبول", url: "https://t.me/"+userBot+"?start="+projectId}],
                    []              
                ]
                }
            }else{
                opt = {
                    inline_keyboard: [
                    [{text:"قبول", url: "https://t.me/"+userBot+"?start="+projectId}],
                    []              
                ]
                }
            }
            return opt;
        }catch{

        }
    } , 
    createButtonReview(linkInfo,projectId,userBot){
        try{
            var opt ;
            if(linkInfo != null){
                 opt = {
                    inline_keyboard: [
                    [{text:"بیشتر" , url: linkInfo}, {text:"جهت بررسی", url: "https://t.me/"+userBot+"?start=review="+projectId}],
                    []              
                ]
                }
            }else{
                opt = {
                    inline_keyboard: [
                    [{text:"جهت بررسی", url: "https://t.me/"+userBot+"?start=review="+projectId}],
                    []              
                ]
                }
            }
            return opt;
        }catch{

        }
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
    createButtonAcceptRequest(chatId , projectId){
        //Create Button 
        var opts ={
            reply_markup: {
                inline_keyboard: [
                    [{text:"قبول" , callback_data : "accept="+true+"&projectId="+projectId+"&chatId="+chatId}],
                    [{text:"رد درخواست" , callback_data : "accept="+false+"&projectId="+projectId+"&chatId="+chatId}]              
                ]
            }         
        };
        return opts;
    },
    findProject : function(projectId){
        return new promises((resolve , reject)=>{
            projectModel.findById({
                _id : projectModel
            }).then((project)=>{
                resolve(project);
            })
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
    }, 
    findOne : function(projectId){
        return new Promise((resolve,reject) => {
            projectModel.findOne({
                _id : projectId
            }).then((project) => {
                resolve(project);
            }).catch((err)=>{
                reject(err);
            })
        })
    },
    updateFreelancerIdAndStatus: function(projectId,status,freelancerId){
        return new Promise((resolve,reject)=>{
           projectModel.findOneAndUpdate({
               _id : projectId
           },{
               $set: {freelancerId : freelancerId , status : status}
           }).then((project)=>{
               resolve(project);
           })
        })
    }
}

module.exports = projectService ; //Create Channel Manager Module