const mongoose = require('../db/mongoose');
const {freelancerModel} = require('../model/freelancerModel');

var freelancerService = {
     isRegistered :function(chatId){
         return new Promise((resolve , reject)=>{
            freelancerModel.count({chatId : chatId} , (err , count)=>{
                if(err){
                    throw err; //throw error
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
    registerFreelancer : function(freelancer){
        return new Promise((resolve,reject)=>{
            let newFreelancer = new freelancerModel({
                name : freelancer.name , 
                family : freelancer.family , 
                chatId : freelancer.chatId , 
                sheba  : null , 
                skills : null , 
                project : null , 
                isMojaz : true
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
       let freelancer = freelancerModel.findOneAndUpdate({
            chatId : chatId
        } , {project : task} , {new : true}).then((freelancer) => {
            //write somthing here
        } , (err) => {
            console.log(err)
        })
        return freelancer;
    }, 
    hasLastCommand : function(chatId){
        return new Promise((resolve, reject)=>{
            freelancerModel.findOne({
                chatId : chatId
            }).then((freelancer)=> {
                let check =  freelancer.lastCommand != null ;
                resolve({"hasLastCommand": check, "lastCommand" : freelancer.lastCommand}); 
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
    }
}




module.exports = freelancerService ; 