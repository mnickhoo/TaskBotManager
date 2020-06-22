const mongoose = require('mongoose');
const project = require('./projectModel');
let freelancerModel = mongoose.model('freelancer' , {
    name : {
        type : String , 
        trim : true
    }, 
    family: {
        type : String , 
        trim : true
    } , 
    chatId:{
        type:String
    },
    sheba: {
        type : Number
    },
    skills: {
        type: Array(String)
    },
    project:{
        type : project
    },
    isMojaz:{
        type : Boolean
    },
    lastCommand : {
        type : String , 
        default : null
    },
    lastCreatedProject : {
        type : String , 
        default : null
    },
    email : {
        type : String , 
        default : null
    },
    isVerfied : {
        type : Boolean,
        default : false
    },
    activateCode : {
        type : String , 
        default : null
    },
    point : {
        type : Number , 
        default : 0 
    } , 
    userName : {
        type : String , 
        default : null
    }
});

module.exports = {
    freelancerModel
}