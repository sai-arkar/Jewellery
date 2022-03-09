const Posts = require("../models/items");
const Categories = require("../models/categories");
const Comments = require("../models/comments");
const fileHelper = require("../middleware/file");
const moment = require("moment");

let approvedPosts = []; /* To Store All Post for Pagination */
let relatedImageArr = [];


exports.getCategories = async (req, res, next)=>{

     try{
          let categories = await Categories.find();
          res.status(200).json({
               message: "ALL Categories",
               categories: categories
          })
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
}

exports.getCategoryItems = async (req, res, next)=>{
     const cateId = req.params.cateId;

     try{
          let items = await Posts.find({categoryId: cateId});
               res.status(200).json({
                    message: "Category's Items",
                    items: items
               });
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
     
}

exports.getPosts =async (req, res, next)=>{
     const currentPage = req.query.page;
     const perPage = req.query.perPage;
     try{
          if(currentPage && perPage){
               let posts = await Posts.find().populate('categoryId')
                              .skip((currentPage -1)* perPage)
                              .limit(perPage);
               
               posts.map(post=>{
                    if(post.state == true){
                         approvedPosts.push(post);
                    }
               })

               res.status(200).json({
                    result: approvedPosts ,
                    currentPage: currentPage,
                    perPage: perPage,
                    totalCount: approvedPosts.length
               });
               approvedPosts = [];

          }else{
               let posts = await Posts.find()
          
               posts.map(post=>{
                    if(post.state == true){
                         approvedPosts.push(post);
                    }
               })

               res.status(200).json({
                    result: approvedPosts,
                    totalCount: approvedPosts.length
               })
               approvedPosts = [];
          }
          

     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
}

exports.getPost = async (req, res, next)=>{
     const pId = req.params.pId;
     try{
          let post = await Posts.findById(pId).populate('categoryId');
          let comments = await Comments.find({itemId: pId});
          
               if(!post){
                    const error = new Error('Post Not Found');
                    error.statusCode = 404;
                    throw error;
               }
               res.status(200).json({
                    message: "Success", 
                    post: post,
                    comments: comments
               });
     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }

}

exports.createPost = (req, res, next)=>{
     const categoryId = req.body.categoryId;
     const userId = req.body.userId;
     const title = req.body.title;
     const description = req.body.description;
     const price = req.body.price;

     const image = req.files.image;
     const relatedImage = req.files.relatedImage;

     if(!req.files){
          const error = new Error('Image Mush Be Include!');
          error.statusCode = 409;
          throw error;
     }

     relatedImageArr = new Array();
     relatedImage.map((post)=>{
          relatedImageArr.push(post.path);
     })

     const post = new Posts({
          categoryId : categoryId,
          title: title,
          image : image[0].path,
          relatedImg: relatedImageArr,
          description: description,
          price : price,
          userId: userId
     });
     post.save()
          .then(result=>{
               console.log("Add post Successfully!");
               res.status(201).json({
                    message: "Post Created Successfully!",
                    post: post
               })
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}

exports.deletePost = (req, res, next)=>{
     const postId = req.params.postId;
     const userId = req.params.userId;

     Posts.findById(postId)
          .then(post=>{
               if(!post){
                    const error = new Error('Post Not Found!');
                    error.statusCode = 404;
                    throw error;
               }

               if(post.userId.toString() === userId.toString()){

                    fileHelper.deleteFile(post.image);
               
                    post.relatedImg.map(path=>{
                         fileHelper.deleteFile(path);
                    })

                    Comments.deleteMany({itemId: postId})
                         .then(()=>{
                              Posts.deleteOne({_id:postId})
                                   .then(()=>{
                                        res.status(200).json({ message : 'Success!'});
                                   })
                         })
                    
               }else{
                    const error = new Error('Not Authorized!');
                    error.statusCode = 403;
                    throw error;
               }
               
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}

exports.getEditPost = (req, res, next)=>{

     const editMode = req.query.edit;
     const postId = req.params.postId;
     const userId = req.params.userId;
    
     let getPosts;
     if(!editMode){
          const error = new Error('Not Authorized!');
          error.statusCode = 403;
          throw error;
     }
     Posts.findById(postId)
          .then(post =>{
               
               if(post.userId.toString() !== userId.toString()){
                    const error = new Error('Not Authorized!');
                    error.statusCode = 403;
                    throw error;
               }
               getPosts = post;
               Categories.find()
                    .then(categories =>{
                         res.status(200).json(
                              {
                                   post : getPosts,
                                   categories : categories
                              }
                         );
                    })
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}

exports.editPost = (req, res, next)=>{
     const categoryId = req.body.categoryId;
     const userId = req.body.userId;
     const postId = req.body.postId;
     const updatedTitle = req.body.title;
     const updatedDes = req.body.description;
     const updatedPrice = req.body.price;

     const image = req.files.image;
     const updateRImage = req.files.relatedImage;

     let updateRImageArr = [];
     
     if(updateRImage){
          updateRImage.map((post)=>{
               updateRImageArr.push(post.path);
          })
     }
     
     Posts.findById(postId)
          .then(post =>{
               if(!post){
                    const error = new Error('Post Not Found!');
                    error.statusCode = 404;
                    throw error;
               }
               if(post.userId.toString() !== userId.toString()){
                    const error = new Error('Not Authorized!');
                    error.statusCode = 403;
                    throw error;
               }
               post.categoryId = categoryId;
               post.title = updatedTitle;
               post.price = updatedPrice;
               post.description = updatedDes;
               if(image){
                    fileHelper.deleteFile(post.image);
                    post.image = image[0].path;
               }
               if(updateRImage){
                    post.relatedImg.map(path=>{
                         fileHelper.deleteFile(path);
                    })
                    post.relatedImg = updateRImageArr;
               }
               post.state = false;
               return post.save();
          })
          .then(()=>{
               if(updateRImage){
                    relatedImageArr = updateRImageArr;
               }
               
               console.log("Updated Item");
               res.status(201).json("Edited Successfully!");
          })
          .catch(err=>{
               if(!err.statusCode){
                    err.statusCode = 500;
               }
               next(err);
          })
}

exports.postComment = async (req, res, next)=>{
     const postId = req.body.postId;
     const userId = req.body.userId;
     const name = req.body.name;
     const userComment = req.body.comment;

     try{
          const comment = new Comments({
               userId: userId,
               itemId: postId,
               name: name,
               comment: userComment
          });
          await comment.save();

          res.status(201).json({
               message: "Post Comment",
          });

     }catch(err){
          if(!err.statusCode){
               err.statusCode = 500;
          }
          next(err);
     }
}

exports.deleteComment = async (req, res, next)=>{
     const cId = req.params.cId;
     const uId = req.params.uId;

     try{
          let comment = await Comments.findById(cId);
               if(comment.userId.toString() === uId.toString() ||
               req.user._id.toString() === "62031c692c2300baf01541f2"){
                    
                    await Comments.deleteOne({_id: cId})
                              console.log("Delete Comment");
                              res.status(200).json({
                                   message: "Success"
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

exports.postEditComment = async (req, res, next)=>{
     const cId = req.body.cId;
     const userId = req.body.userId;
     const updatedComment = req.body.comment;

     try{
          let result = await Comments.findById(cId); 
               if(!result){
                    const error = new Error('Comment Not Found!');
                    error.statusCode = 404;
                    throw error;
               }
               if(result.userId.toString() === userId.toString() ||
               req.user._id.toString() === "62031c692c2300baf01541f2"){
                    
                    result.comment = updatedComment;
                    await result.save();
                    console.log("Updated Comment");
                    res.status(201).json({
                         message: "Success", 
                         comment: result
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