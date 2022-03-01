const express = require("express");

const router = express.Router();

const apiControllers = require("../apiControllers/appUserAuth");
const isJwt = require("../middleware/is-jwt");

router.get("/auth/sign-up", apiControllers.getSignup);

router.post("/auth/sign-up", apiControllers.postSignUp);

router.post("/auth/login", apiControllers.postLogin);

/* Get User and user's items */
router.get("/user/:uid", isJwt, apiControllers.getUser);

/* User' Post Detail and Comment */
router.get("/user/post/:userId/:postId", isJwt, apiControllers.getUserPostDetail);

/* Edit User */
router.post("/edit-user", isJwt, apiControllers.postEditUser);

/* Get All User's Id */
router.get("/all-uId", isJwt, apiControllers.getAllUserId);

router.get("/all-user", isJwt, apiControllers.getAllUser);

module.exports = router;

