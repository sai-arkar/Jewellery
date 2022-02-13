const express = require("express");

const router = express.Router();

const appUserPostController = require("../apiControllers/appUserPost");
const cpUpload = require("../middleware/multer");

router.get("/posts", appUserPostController.getPosts);

router.post("/post", cpUpload, appUserPostController.createPost);

router.get("/edit-post/:postId/:userId", appUserPostController.getEditPost);

router.post("/edit-post", cpUpload, appUserPostController.editPost);

router.delete("/post/:postId/:userId", appUserPostController.deletePost);

module.exports = router;