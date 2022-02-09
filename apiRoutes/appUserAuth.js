const express = require("express");

const router = express.Router();

const authControllers = require("../apiControllers/appUserAuth");

router.get("/sign-up", authControllers.getSignup);

router.put("/sign-up", authControllers.postSignUp);


module.exports = router;