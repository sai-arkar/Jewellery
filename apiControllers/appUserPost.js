const Posts = require("../models/items");

let approvedPosts = []; /* To Store All Post for Pagination */

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