const mongoose = require('../db/mongoose');
const {freelancerModel} = require('../model/freelancerModel');

var freelancerService = {
     isRegistered :function(chatId){
         return new Promise((resolve , reject)=>{
            freelancerModel.count({chatId : chatId} , (err , count)=>{
                if(err){
                    reject(err);
                }
                if(count>0){//freelancer exist on db 
                  resolve(true)  ; 
                } else{
                    //user must be register on db
                    resolve(false) ;
                  }
            });
         })
     }, 
     isVerfied : function(chatId){
       return new Promise((resolve , reject)=>{
        freelancerModel.findOne({
            chatId : chatId
        }).then((freelancer)=> {
            let check =  freelancer.isVerfied == true ;
            resolve({"isVerfied": check}); 
        });
       })
     },
     checkValidation : function(message , code){
         return message == code;
     },
    registerFreelancer : function(freelancer){
        return new Promise((resolve,reject)=>{
            let newFreelancer = new freelancerModel({
                name : freelancer.name , 
                family : freelancer.family , 
                chatId : freelancer.chatId , 
                sheba  : null , 
                skills : null , 
                project : null , 
                isMojaz : true, 
                activateCode : freelancer.activateCode
            });
            newFreelancer.save().then((freelancer) => {
                if(freelancer._id != null){
                    resolve(true);
                }else{
                    resolve(false);
                }
            } , (err) => {
                throw err ; 
            });
        })
    } , 
    findAndUpdateFreelancer : function(chatId , task){
        return new Promise((resolve , reject) => {
            freelancerModel.findOneAndUpdate({
                chatId : chatId
            } , {project : task} , {new : true}).then((freelancer) => {
                //write somthing here
                resolve(freelancer) ;
            } , (err) => {
               reject(err);
            })  
        })
    }, 
    hasLastCommand : function(chatId){
        return new Promise((resolve, reject)=>{
            freelancerModel.findOne({
                chatId : chatId
            }).then((freelancer)=> {
                let check =  freelancer.lastCommand != null ;
                resolve({"hasLastCommand": check, "lastCommand" : freelancer.lastCommand , "freelancer" : freelancer}); 
            });
        })   
    },
    updateLastCommmand : function(chatId,lastCommand){
        return new Promise((resolve,reject)=>{
            freelancerModel.findOneAndUpdate({
                chatId : chatId
            },{
                $set:{
                    lastCommand : lastCommand
                }
            }).then((freelancer)=>{
                resolve(freelancer);
            }).catch((err)=>{
                console.log(err);
            })
        });
    },
    updateEmail : function(chatId,email){
        return new Promise((resolve,reject)=>{
            freelancerModel.findOneAndUpdate({
                chatId : chatId
            },{
                $set:{
                    email : email
                }
            }).then((freelancer)=>{
                resolve(freelancer);
            }).catch((err)=>{
                console.log(err);
            })
        });
    },
    updateduration : function(chatId,duration){
        return new Promise((resolve,reject)=>{
            freelancerModel.findOneAndUpdate({
                chatId : chatId
            },{
                $set:{
                    duration : duration
                }
            }).then((freelancer)=>{
                resolve(freelancer);
            }).catch((err)=>{
                console.log(err);
            })
        });
    },
    updateIsverified : function(chatId,check){
        return new Promise((resolve,reject)=>{
            freelancerModel.findOneAndUpdate({
                chatId : chatId
            },{
                $set:{
                    isVerfied : check
                   }
            }).then((freelancer)=>{
                resolve(freelancer);
            }).catch((err)=>{
                console.log(err);
            })
        });
    },
    updateLastProjectId : function(chatId , projectId){
        return new Promise((resolve , reject)=>{
            freelancerModel.findOneAndUpdate({
                chatId : chatId
            },{
                $set : {
                    lastCreatedProject : projectId
                }
            }).then((freelancer)=>{
                resolve(freelancer);
            }).catch((err)=>{
                reject(err);
            })
        });
    },
    findFreelancer : function(chatId){
        return new Promise((resolve , reject)=>{
            freelancerModel.findOne({
                chatId : chatId
            }).then((freelancer)=>{
                resolve(freelancer);
            }).catch((err)=>{
                reject(err);
            })
        })
    },
    generateCode : function(){
        let code = Math.floor(1000 + Math.random() * 9000);
        return code;
    },
}




module.exports = freelancerService ; 