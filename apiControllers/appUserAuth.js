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

     AppUsers.findOne({email : email})
          .then(userDoc=>{
               if(userDoc){
                    return console.log("User Already Exist!");
                    // return res.redirect("/api/sign-up");
               }
               bcrypt.hash(password, 12)
                    .then(hashedPass=>{
                         const appUser = new AppUsers({
                              email : email, 
                              password : hashedPass,
                              name : name
                         });
                         return appUser.save();
                    })
                    .then((result)=>{
                         // res.status(201).json({
                         //      message: "User Created!", user: result
                         // });
                         res.redirect("/");
                    })
          })
          .catch(err=>{
               console.log(err);
          })
     
}
