const express = require("express");
const { check, body } = require("express-validator");

const router = express.Router();

const authControllers = require("../controllers/auth");
const isAuth = require("../middleware/is-auth");

router.get("/", authControllers.getSignin);

router.post("/", [
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email address")
        .normalizeEmail(),
    body("password", "Password Mush Be Valid")
        .trim()
        .isLength({min : 4})
        .isAlphanumeric()
   
]
,authControllers.postSignIn);

router.post("/logout", authControllers.postLogOut);

/* Change Password */
router.get('/reset', isAuth, authControllers.getReset);

router.post("/reset", authControllers.postReset);

router.get("/reset/:token", authControllers.getNewPassword);

router.post('/new-password', authControllers.postNewPassword);

module.exports = router;