const mongoose = require('mongoose');

let projectModel = mongoose.model('project' , { 
    title : {
        type : String , 
        trim : true , 
        require : true
    } , 
    description: {
        type : String , 
        require : true ,
        default : null,
    }, 
    linkInfo: {
        type : String ,
        default : null
    },
    status : {
        type : String,
        default : "todo"
    },
    freelancerId : {
        type : Number,
        default : null
    }, 
    cowokerId : {
        type: Number,
        default : null
    },
    duration: {
        type : String,
        default : null
    },
    point : {
        type : Number,
        default : null
    }, 
    imageAddress : {
        type : String,
        default : null
    },
    postId : {
        type : String,
        default : null
    },
    note : {
        type : String,
        default : null
    }
})


module.exports = {
    projectModel 
}