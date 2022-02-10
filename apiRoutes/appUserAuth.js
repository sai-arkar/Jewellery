const express = require("express");

const router = express.Router();

const apiControllers = require("../apiControllers/appUserAuth");

router.get("/sign-up", apiControllers.getSignup);

router.post("/sign-up", apiControllers.postSignUp);

router.post("/login", apiControllers.postLogin);

/* Get User */
router.get("/user/:uid", apiControllers.getUser);

/* Get User's Items */
router.get("/items/:uid", apiControllers.getUserItems);

router.get("/all-user", apiControllers.getAllUser);

module.exports = router;