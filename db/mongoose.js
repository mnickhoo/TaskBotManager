const mongoose = require('mongoose'); //require mongoose 
mongoose.Promise = global.Promise ; //support promise 
mongoose.connect('mongodb+srv://mehdi:20204343@taskchatbot-jnsyb.mongodb.net/taskManager',{useNewUrlParser: true}) ; //Connect to db
//export Module
module.exports = {
    mongoose
}

//mongodb+srv://mehdi:<password>@taskbot-jnsyb.mongodb.net/<dbname>?retryWrites=true&w=majority
