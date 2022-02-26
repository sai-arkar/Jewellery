const AppUsers = require( "../models/appUsers" );
const Categories = require("../models/categories");
const Items = require("../models/items");

const bcrypt = require("bcryptjs");

exports.getSignup = (req, res, next)=>{
     res.render("auth/sign-up");
}

exports.postSignUp = (req, res, next)=>{
     const name = req.body.name;
     const email = req.body.email;
     const password = req.body.password;
     const confirmPassword = req.body.confirmPassword;

     AppUsers.findOne({email: email})
          .then(user =>{
               if(user){
                    return res.status(200).json({
                         message: "Email Already Exist!",
                         error: true
                    })
               }
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
          })
          .catch(err=>{
               console.log(error);
               const error = new Error(err);
               error.httpStatusCode = 500;
               return next(error);
          })
     
}

exports.postLogin = (req, res, next)=>{
     const email = req.body.email;
     const password = req.body.password;
     let loadedUser;
     AppUsers.findOne({email: email})
          .then(user =>{
               if(!user){
                    return res.status(200).json({ message : "User Not Found!", error: true});
               }
               loadedUser = user;
               bcrypt.compare(password, user.password)
                    .then(isEuqal=>{
                         if(!isEuqal){
                              return res.status(200).json({ message : "Incorret Password!", error: true});
                         }
                         res.status(200).json({
                              userId: loadedUser._id.toString(),
                              name: loadedUser.name,
                              email: loadedUser.email
                         })
                    })
          })
          .catch(err =>{
               const error = new Error(err);
               error.httpStatusCode = 500;
               return next(error);
          });

}


exports.getUser = async (req, res, next)=>{
     const uId = req.params.uid;
     
     try{
          let user = await AppUsers.findById(uId);
               if(!user){
                    return res.status(200).json({ message : "User Not Found!", error: true});
               }
          let items = await Items.find({userId: uId}).populate('categoryId').sort({createdAt: -1});
          let categories = await Categories.find();
               res.status(200).json({
                    info:{
                         userId: user._id,
                         name: user.name,
                         email: user.email,
                    },
                    items: items,
                    categories: categories
               })
          
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.postEditUser = async (req, res, next)=>{
     const updatedName = req.body.name;
     const updatedEmail = req.body.email;
     const updatedPassword = req.body.password;
     const userId = req.body.userId;

     try{
          let user = await AppUsers.findById(userId);
               if(!user){
                    return res.status(200).json({ message: "User Not Exist!" });
               }
               if(user._id.toString() === userId.toString()){
                    let hashedPass = await bcrypt.hash(updatedPassword, 12);
                         user.name = updatedName;
                         user.email = updatedEmail;
                         user.password = hashedPass;

                         await user.save();
                         res.status(201).json({
                              message : "Update Success"
                         })
               }else{
                    res.status(200).json({ message: "Not Authorized!"});
               }
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }

}

exports.getAllUserId = (req, res, next)=>{
     let userId = [];
     AppUsers.find()
          .then(users=>{
               users.map(user=>{
                    userId.push(user._id.toString());
               })
               res.status(200).json({
                    result : userId
               })
          })
          .catch(err => {
               const error = new Error(err);
               error.httpStatusCode = 500;
               return next(error);
          });
}

exports.getAllUser = (req, res, next)=>{
     AppUsers.find()
          .then(result=>{
               res.status(200).json({
                    user : result
               })
          })
          .catch(err => {
               const error = new Error(err);
               error.httpStatusCode = 500;
               return next(error);
          });
}