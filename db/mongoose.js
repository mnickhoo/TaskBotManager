const mongoose = require('mongoose'); //require mongoose 
mongoose.Promise = global.Promise ; //support promise 
mongoose.connect('mongodb://localhost:27017/taskManager',{useNewUrlParser: true}) ; //Connect to db
//export Module
module.exports = {
    mongoose
}