const Posts = require("../models/items");

const allPosts = []; /* To Store All Post for Pagination */

exports.getPosts =async (req, res, next)=>{
     const currentPage = req.query.page || 1;
     const perPage = req.query.perPage || 3;

     try{
          const totalCount = await Posts.find().countDocuments();
          let posts = await Posts.find()
                         .skip((currentPage -1)* perPage)
                         .limit(perPage)
          posts.map(post=>{
               allPosts.push(post);
          })
          res.status(200).json({
               result: allPosts ,
               currentPage: currentPage,
               perPage: perPage,
               totalCount: totalCount
          });

     }catch(err){
          console.log(err);
     }
}