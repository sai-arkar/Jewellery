const Users = require( "../models/Users" );
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const sgMail = require('@sendgrid/mail');
sgMail.setApiKey("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");

let showInfo = false

exports.getSignin = (req, res, next)=>{
     res.render("auth/sign-in", {
          pageTitle: "Sign In",
          errorMessage: false,
          oldInput:{
               email: '',
               password: ''
          },
          validationErrors: [],
          showInfo: showInfo
     });
}

exports.postSignIn = async (req, res, next)=>{
     const email = req.body.email;
     const password = req.body.password;
     const errors = validationResult(req);

     if(!errors.isEmpty()){
          return res.status(422).render("auth/sign-in",{
               pageTitle: "Sign In",
               errorMessage: errors.array()[0].msg,
               oldInput:{
                    email: email,
                    password: password
               },
               validationErrors: errors.array(),
               showInfo: showInfo
          });
     }

     try{

          let user = await Users.findOne({email : email});
               if(!user){
                    return res.status(422).render("auth/sign-in",{
                         pageTitle: "Sign In",
                         errorMessage: "Please enter a valid email address", 
                         oldInput: {
                              email: email,
                              password: password
                         },
                         validationErrors: errors.array(),
                         showInfo: showInfo
                    })
               }
          let doMatch = await bcrypt.compare(password, user.password);

               showInfo = false;

               if(doMatch){
                    req.session.isLoggedIn = true;
                    if(user.status === 'super'){
                         req.session.isSuperAdmin = true;
                    }
                    req.session.user = user;
                    return await req.session.save(err=>{
                         console.log(err);
                         console.log("Login Successful");
                         res.redirect("/admin/dashboard");
                    })
               }
               return res.status(422).render("auth/sign-in", {
                    pageTitle: "Sign In",
                    errorMessage: "Incorret Password", 
                    oldInput: {
                         email: email,
                         password: password
                    },
                    validationErrors: errors.array(),
                    showInfo: showInfo,
                    red: true
               })
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }

}

/* Session Destroy */
exports.postLogOut = (req, res, next)=>{
     req.session.destroy((err)=>{
          console.log(err);
          res.redirect("/");
     })
}

exports.getReset = (req, res, next)=>{
     res.render("auth/reset",{
          pageTitle: "Reset Password",
          oldInput: {
               email: ''
          },
          validationErrors: [],
          errorMessage: false
     });
}

exports.postReset = async(req, res, next)=>{
     const errors = validationResult(req);

     if(!errors.isEmpty()){
          return res.status(422).render("auth/reset",{
               pageTitle: "Reset Password",
               errorMessage: errors.array()[0].msg,
               oldInput:{
                    email: req.body.email
               },
               validationErrors: errors.array()
          });
     }

     try{
          await crypto.randomBytes(32, async (err, buffer)=>{
               if(err){
                    console.log(err);
                    return res.redirect("/reset");
               }
               const token = buffer.toString('hex');
               
               let user = await Users.findOne({email : req.body.email})
                         if(!user){
                              return res.redirect("/reset");
                         }
                         user.resetToken = token;
                         user.resetTokenExpiration = Date.now() + 3600000;
                    await user.save();
                         showInfo = true;
                         res.redirect("/");
                         const msg = {
                              to: req.body.email, // Change to your recipient
                              from: 'saiscript.digit@gmail.com', // Change to your verified sender
                              subject: 'Password Reset',
                              html: `
                                   <h1>You requested a password reset</h1>
                                   <h3>Click this <a href="http://localhost:8080/reset/${token}">link</h3> to set a new password!</p>
                                   `
                            };
     
                         sgMail
                            .send(msg)
                            .then((response) => {
                              console.log(response[0].statusCode)
                              console.log(response[0].headers)
                            })
                            .catch((error) => {
                              console.error(error)
                            })
          });
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.getNewPassword = async (req, res, next)=>{
     const token = req.params.token;

     try{
          let user = await Users.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
               res.render('auth/new-password', {
                    pageTitle: "New Password", 
                    userId: user._id.toString(),
                    passwordToken: token,
                    errorMessage: false,
                    oldInput:{
                         currentPass: '',
                         newPass: '',
                         confirmPass: ''
                    },
                    validationErrors: []
               })
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.postNewPassword = async (req, res, next)=>{
     const currentPass = req.body.currentPassword;
     const newPass = req.body.newPassword;
     const confirmPass = req.body.confirmPassword;
     const passwordToken = req.body.passwordToken;
     const userId = req.body.userId;

     const errors = validationResult(req);

     console.log(errors.array())
     if(!errors.isEmpty()){
          return res.status(422).render("auth/new-password",{
               pageTitle: "New Password",
               errorMessage: errors.array()[0].msg,
               userId: userId,
               passwordToken: passwordToken,
               oldInput:{
                    currentPass: currentPass,
                    newPass: newPass,
                    confirmPass: confirmPass
               },
               validationErrors: errors.array()
          });
     }

     let resetUser;

     try{
          let user = await Users.findOne({
               resetToken: passwordToken, 
               resetTokenExpiration:{$gt: Date.now()},
               _id: userId
             });
          // User.findOne
          resetUser = user
          let hashedPassword = await bcrypt.hash(newPass, 12);
          // bcrypt.hash()
               resetUser.password = hashedPassword;
               resetUser.resetToken = undefined;
               resetUser.resetTokenExpiration = undefined;

          await resetUser.save();
           // resetUser.save()
               showInfo = false;
               console.log("Changed Password!");
               res.redirect('/');
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}
      