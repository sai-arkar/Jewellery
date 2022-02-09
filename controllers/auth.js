const Users = require( "../models/Users" );
const bcrypt = require("bcryptjs");

exports.getSignin = (req, res, next)=>{
     res.render("auth/sign-in");
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

     Users.findOne({email : email})
          .then(user =>{
               if(!user){
                    return res.redirect("/");
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
                         res.redirect("/");
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