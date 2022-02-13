const Posts = require("../models/items");
const Categories = require("../models/categories");
const fileHelper = require("../middleware/file");

let approvedPosts = []; /* To Store All Post for Pagination */
let relatedImageArr = [];

exports.getPosts =async (req, res, next)=>{
     const currentPage = req.query.page;
     const perPage = req.query.perPage;

     try{
          if(currentPage && perPage){
               let posts = await Posts.find()
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
          console.log(err);
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
          return res.status(422).json({message: "Image Must Be Include"});;
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
               console.log(err);
          })
}

exports.deletePost = (req, res, next)=>{
     const postId = req.params.postId;
     const userId = req.params.userId;

     Posts.findById(postId)
          .then(post=>{
               if(!post){
                    return next(new Error('post Not Found!'));
               }

               if(post.userId.toString() === userId.toString()){

                    fileHelper.deleteFile(post.image);
               
                    post.relatedImg.map(path=>{
                         fileHelper.deleteFile(path);
                    })

                    Posts.deleteOne({_id:postId})
                         .then(()=>{
                              res.status(200).json({ message : 'Success!'});
                         })
               }else{
                    console.log("Not Authorized!");
                    return res.redirect("/admin/all-items");
               }
               
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.getEditPost = (req, res, next)=>{

     const editMode = req.query.edit;
     const postId = req.params.postId;
     const userId = req.params.userId;
    
     let getPosts;
     if(!editMode){
          return res.status(404).json({ message: "Can't Edit"});
     }
     Posts.findById(postId)
          .then(post =>{
               
               if(post.userId.toString() !== userId.toString()){
                    return res.status(401).json({ message: "Not Authorized!"});
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
               console.log(err);
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
                    return res.status(404).json({ message: "Post Not Found!"});
               }
               if(post.userId.toString() !== userId.toString()){
                    return res.status(401).json({ message: "Not Authorized!"});
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
               console.log(err);
          })
}