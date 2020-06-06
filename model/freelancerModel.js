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
    }
});


module.exports = {
    freelancerModel
}