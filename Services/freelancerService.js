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
                activateCode : freelancer.activateCode , 
                userName : freelancer.userName
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
                chatId : chatId,
            } , {projects : task} , {new : true}).then((freelancer) => {
                //write somthing here
                resolve(freelancer) ;
            } , (err) => {
               reject(err);
            })  
        })
    }, 
    addProject :  function(chatId , task){
        return new Promise((resolve , reject)=>{
            freelancerModel.update({
                chatId : chatId
            }, {
                $push : {projects : task}
            }).then((project)=>{
                resolve(task);
            }).catch((err)=>{
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
    getLastProjectId : function(chatId){
        return new Promise((resolve , reject)=>{
            freelancerModel.findOne({
                chatId  : chatId
            }).then((freelancer)=>{
                resolve(freelancer.lastCreatedProject);
            }).catch((err)=>{
                reject(err);
            })
        })
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
    findFreelancerById : function(_id){
        return new Promise((resolve , reject)=>{
            freelancerModel.findById(_id).then((freelancer)=>{
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
    generateUserId : function makeid(length) {
        let result = '';
        let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
        let charactersLength = characters.length;
        for ( var i = 0; i < length; i++ ) {
           result += characters.charAt(Math.floor(Math.random() * charactersLength));
        }
        return "user"+result;
     },
     updateProjectStatus : function(chatId , projectId , status){
         return new Promise((resolve , reject)=>{
             freelancerModel.findOneAndUpdate({
                chatId : chatId,
                "projects.projectId" : projectId
             },{
                 $set : {"projects.$.status" : status}
             }).then((project)=>{
                 resolve(project);
             }).catch((err)=>{
                 reject(err);
             })
         })
     },
     haveThisProject : function(chatId , projectId){
         return new Promise((resolve , reject)=>{
             freelancerModel.findOne({
                 chatId : chatId , 
             }).then((freelancer)=>{
                 let result = false;
                 //should be return a boolean value
                 freelancer.projects.forEach(project => {
                     if(project.projectId == projectId){
                         result = true; 
                     }
                 });
                 resolve(result);
             })
         })
     }

}




module.exports = freelancerService ; 