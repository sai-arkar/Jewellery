const AppUsers = require( "../models/appUsers" );
const bcrypt = require("bcryptjs");

exports.getSignup = (req, res, next)=>{
     res.render("auth/sign-up");
}

exports.postSignUp = (req, res, next)=>{
     const name = req.body.name;
     const email = req.body.email;
     const password = req.body.password;
     const confirmPassword = req.body.confirmPassword;

     bcrypt.hash(password, 12)
          .then(hashedPass=>{
               const appUser = new AppUsers({
                    name : name,
                    email: email,
                    password: hashedPass
               })
               return appUser.save()                   
          })
          .then(result=>{
               res.status(201).json({
                    message: "Created!", user : result
               })
          })
          .catch(err => console.log(err));
     
}

exports.getAllUser = (req, res, next)=>{
     AppUsers.find()
          .then(result=>{
               res.status(201).json({
                    user : result
               })
          })
          .catch(err => console.log(err));
}