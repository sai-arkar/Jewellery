const express = require("express");

const router = express.Router();

const appUserPostController = require("../apiControllers/appUserPost");
const cpUpload = require("../middleware/multer");
const isJwt = require("../middleware/is-jwt");

/* Get All Categories */
router.get("/categories", appUserPostController.getCategories);

/* Get One Category and it's items */
router.get("/category/:cateId", appUserPostController.getCategoryItems);

/* Get Posts */
router.get("/posts", appUserPostController.getPosts);

/* Get Post and Post's comment */
router.get("/post/:pId", appUserPostController.getPost);

/* Add Post */
router.post("/post", isJwt, cpUpload, appUserPostController.createPost);

/* Get Edit Post */
router.get("/edit-post/:postId/:userId", isJwt, appUserPostController.getEditPost);

/* Post Edit Post */
router.post("/edit-post", isJwt, cpUpload, appUserPostController.editPost);

/* Comment */
router.post("/comment", isJwt, appUserPostController.postComment);

router.delete("/comment/:uId/:cId", isJwt, appUserPostController.deleteComment);

router.post("/edit-comment", isJwt, appUserPostController.postEditComment);

/* Delete Post */
router.delete("/post/:postId/:userId", isJwt, appUserPostController.deletePost);

module.exports = router;