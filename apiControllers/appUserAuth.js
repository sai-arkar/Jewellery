const AppUsers = require( "../models/appUsers" );
const Categories = require("../models/categories");
const Items = require("../models/items");
const Comments = require("../models/comments");

const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

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
                    const error = new Error('Email Already Exist!');
                    error.statusCode = 409;
                    throw error;
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
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
     
}

exports.postLogin = (req, res, next)=>{
     const email = req.body.email;
     const password = req.body.password;
     let loadedUser;
     AppUsers.findOne({email: email})
          .then(user =>{
               if(!user){
                    const error = new Error('A user with this email count not be found!');
                    error.statusCode = 401;
                    throw error; 
               }
               loadedUser = user;
               return bcrypt.compare(password, user.password);
          })
          .then(isEuqal=>{
               if(!isEuqal){
                    const error = new Error('Incorret Password!');
                    error.statusCode = 401;
                    throw error; 
               }
               const token = jwt.sign({
                    email: loadedUser.email,
                    userId: loadedUser._id.toString()
               },
               'thisissupersecretforjsonwebtoken',
               {expiresIn: '1h'}
               );
               res.status(200).json({
                    token: token,
                    userId: loadedUser._id.toString(),
                    name: loadedUser.name,
                    email: loadedUser.email
               })
          })
          .catch(err =>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          });

}


exports.getUser = async (req, res, next)=>{
     const uId = req.params.uid;
     
     try{
          let user = await AppUsers.findById(uId);
               if(!user){
                    const error = new Error('User Not found!');
                    error.statusCode = 404;
                    throw error; 
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
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
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
                    const error = new Error('User Not found!');
                    error.statusCode = 404;
                    throw error;
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
                    const error = new Error('Not Authorized!');
                    error.statusCode = 403;
                    throw error;
               }
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
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
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
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
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          });
}

exports.getUserPostDetail = async(req, res, next)=>{
     const postId = req.params.postId;

     try{
          let item = await Items.findById(postId);
          let comments = await Comments.find({itemId: postId});

          // console.log(item.userId.toString());
          // console.log(comments);

          res.status(200).json({
               message : "User's Post Detail",
               post: item,
               comments: comments,
               userId: item.userId.toString()
          });
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }

}
