const mongoose = require('mongoose') ; //require mongoose
//create a model from coworker
let coworker = mongoose.model('coworker' , {
    name : {
        type : String , 
        require : true,
        trim : true
    },
    lastName : {
        type : String ,
        require : true , 
        trim : true
    }
})
//export module coworker
module.exports = {
    coworker
}