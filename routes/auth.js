const express = require("express");

const router = express.Router();

const authControllers = require("../controllers/auth");

router.get("/", authControllers.getSignin);

router.post("/sign-in", authControllers.postSignIn);

router.post("/logout", authControllers.postLogOut);

module.exports = router;