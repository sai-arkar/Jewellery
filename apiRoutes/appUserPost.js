const express = require("express");

const router = express.Router();

const appUserPostController = require("../apiControllers/appUserPost");
const cpUpload = require("../middleware/multer");

/* Get All Categories */
router.get("/categories", appUserPostController.getCategories);

/* Get One Category and it's items */
router.get("/category/:cateId", appUserPostController.getCategoryItems);

/* Get Posts */
router.get("/posts", appUserPostController.getPosts);

/* Get Post and Post's comment */
router.get("/post/:pId", appUserPostController.getPost);

/* Add Post */
router.post("/post", cpUpload, appUserPostController.createPost);

/* Get Edit Post */
router.get("/edit-post/:postId/:userId", appUserPostController.getEditPost);

/* Post Edit Post */
router.post("/edit-post", cpUpload, appUserPostController.editPost);

/* Comment */
router.post("/comment", appUserPostController.postComment);

/* Delete Post */
router.delete("/post/:postId/:userId", appUserPostController.deletePost);

module.exports = router;