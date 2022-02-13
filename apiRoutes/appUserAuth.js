const express = require("express");

const router = express.Router();

const apiControllers = require("../apiControllers/appUserAuth");

router.get("/auth/sign-up", apiControllers.getSignup);

router.post("/auth/sign-up", apiControllers.postSignUp);

router.post("/auth/login", apiControllers.postLogin);

/* Get User and user's items */
router.get("/user/:uid", apiControllers.getUser);

/* Get All User's Id */
router.get("/all-uId", apiControllers.getAllUserId);

router.get("/all-user", apiControllers.getAllUser);

module.exports = router;