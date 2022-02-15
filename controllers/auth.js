const Users = require( "../models/Users" );
const bcrypt = require("bcryptjs");
const crypto = require("crypto");
const { validationResult } = require("express-validator");

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey("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")

exports.getSignin = (req, res, next)=>{
     res.render("auth/sign-in", {
          pageTitle: "Sign In",
          errorMessage: false,
          oldInput:{
               email: '',
               password: ''
          },
          validationErrors: []
     });
}

// exports.getSignup = (req, res, next)=>{
//      res.render("auth/sign-up");
// }

// exports.postSignUp = (req, res, next)=>{
//      const name = req.body.name;
//      const email = req.body.email;
//      const password = req.body.password;
//      const confirmPassword = req.body.confirmPassword;

//      Users.findOne({email : email})
//           .then(userDoc=>{
//                if(userDoc){
//                     return res.redirect("/sign-up");
//                }
//                bcrypt.hash(password, 12)
//                     .then(hashedPass=>{
//                          const user = new Users({
//                               email : email, 
//                               password : hashedPass,
//                               name : name
//                          });
//                          return user.save();
//                     })
//                     .then(()=>{
//                          res.redirect("/");
//                     })
//           })
//           .catch(err=>{
//                console.log(err);
//           })
     
// }

exports.postSignIn = (req, res, next)=>{
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
               validationErrors: errors.array()
          });
     }

     Users.findOne({email : email})
          .then(user =>{
               if(!user){
                    return res.status(422).render("auth/sign-in",{
                         pageTitle: "Sign In",
                         errorMessage: "Invalid Email or Password", 
                         oldInput: {
                              email: email,
                              password: password
                         },
                         validationErrors: []
                    })
               }
               bcrypt.compare(password, user.password)
                    .then(doMatch=>{
                         if(doMatch){
                              req.session.isLoggedIn = true;
                              if(user.status === 'super'){
                                   req.session.isSuperAdmin = true;
                              }
                              req.session.user = user;
                              return req.session.save(err=>{
                                   console.log(err);
                                   console.log("Login Successful");
                                   res.redirect("/admin/dashboard");
                              })
                         }
                         return res.status(422).render("auth/sign-in", {
                              pageTitle: "Sign In",
                              errorMessage: "Invalid Email or Password", 
                              oldInput: {
                                   email: email,
                                   password: password
                              },
                              validationErrors: []
                         })
                    })
                    .catch(err=>{
                         console.log(err);
                         res.redirect("/");
                    })
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.postLogOut = (req, res, next)=>{
     req.session.destroy((err)=>{
          console.log(err);
          res.redirect("/");
     })
}

exports.getReset = (req, res, next)=>{
     res.render("auth/reset",{
          pageTitle: "Reset Password"
     });
}

exports.postReset = (req, res, next)=>{
     crypto.randomBytes(32, (err, buffer)=>{
          if(err){
               console.log(err);
               return res.redirect("/reset");
          }
          const token = buffer.toString('hex');
          
          Users.findOne({email : req.body.email})
               .then(user =>{
                    if(!user){
                         return res.redirect("/reset");
                    }
                    user.resetToken = token;
                    user.resetTokenExpiration = Date.now() + 3600000;
                    return user.save();
               })
               .then(result =>{
                    res.redirect("/");
                    const msg = {
                         to: req.body.email, // Change to your recipient
                         from: 'saiscript.digit@gmail.com', // Change to your verified sender
                         subject: 'Password Reset',
                         html: `
                              <h1>You requested a password reset</h1>
                              <h3>Click this <a href="http://jewelry-third-step.herokuapp.com/${token}">link</h3> to set a new password!</p>
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
               })
               .catch(err =>{
                    console.log(err);
               })
     });
}

exports.getNewPassword = (req, res, next)=>{
     const token = req.params.token;
     Users.findOne({resetToken: token, resetTokenExpiration: {$gt: Date.now()}})
          .then(user=>{
               res.render('auth/new-password', {
                    pageTitle: "New Password", 
                    userId: user._id.toString(),
                    passwordToken: token
               })
          })
          .catch(err =>{
               console.log(err);
          })
}

exports.postNewPassword = (req, res, next)=>{
     const currentPass = req.body.currentPassword;
     const newPass = req.body.newPassword;
     const confirmPass = req.body.confirmPassword;
     const passwordToken = req.body.passwordToken;
     const userId = req.body.userId;

     let resetUser;

     Users.findOne({
          resetToken: passwordToken, 
          resetTokenExpiration:{$gt: Date.now()},
          _id: userId
        })
        .then(user =>{ // User.findOne
          resetUser = user
          return bcrypt.hash(newPass, 12)
        })
        .then(hashedPassword =>{ // bcrypt.hash()
          resetUser.password = hashedPassword;
          resetUser.resetToken = undefined;
          resetUser.resetTokenExpiration = undefined;
          return resetUser.save();
        })
        .then(result =>{ // resetUser.save()
          console.log("Changed Password!");
          res.redirect('/');
        })
        .catch(err =>{
          console.log(err);
        })
}
      