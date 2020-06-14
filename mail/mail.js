const nodemailer = require('nodemailer'); 
  
let mailService = {
  createOption : function(to , subject , text){
    let mailDetails = { 
      from: 'kidocodetask@gmail.com', 
      to: to, 
      subject: subject , 
      text: text
  }; 
  return mailDetails;
  },
  sendMail : function(to,subject,text){
    return new Promise((resolve,reject)=>{
      let mailTransporter = nodemailer.createTransport({ 
        service: 'gmail', 
        auth: { 
            user: 'kidocodetask@gmail.com', 
            pass: '77616058'
        } 
    });
      mailTransporter.sendMail(this.createOption(to,subject,text)).then((info, error)=>{
        resolve(info);
        }).catch((err)=>{
          reject(err);
        })
    })
  }
}

module.exports = {
  mailService
}