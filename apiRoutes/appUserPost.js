const express = require("express");

const router = express.Router();

const appUserPostController = require("../apiControllers/appUserPost");

router.get("/posts", appUserPostController.getPosts);

module.exports = router;