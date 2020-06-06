const mongoose = require('../db/mongoose');
const {freelancerModel} = require('../model/freelancerModel');

var freelancerService = {
     isRegistered :function(chatId){
        freelancerModel.count({chatId : chatId} , (err , count)=>{
            if(err){
                throw err; //throw error
            }
            if(count>0){//freelancer exist on db 
              console.log("is registered!")
              return true ; 
            } else{
                //user must be register on db
                console.log("is not registered!")
                return false;
              }
        });
     }, 
    registerFreelancer : function(freelancer){
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
            return true ; 
        } , (err) => {
            throw err ; 
        });
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
    }
}




module.exports = freelancerService ; 