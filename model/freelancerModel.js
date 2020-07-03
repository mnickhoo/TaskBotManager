const mongoose = require('mongoose');
const project = require('./projectModel');
const {projectModel} = require('./projectModel')
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
    project :{
        type : project
    }
    ,
    isMojaz:{
        type : Boolean , 
        default : true
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
        default : 50 
    } , 
    userName : {
        type : String , 
        default : null
    }, 
    projects : [
        {projectId : String , cowokerId : String  , status : String }
    ]
});

module.exports = {
    freelancerModel
}