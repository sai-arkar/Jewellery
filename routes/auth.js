const express = require("express");
const bcrypt = require("bcryptjs");
const Users = require("../models/Users");
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
router.get('/reset', authControllers.getReset);

router.post("/reset", [
    
    body("email")
        .isEmail()
        .withMessage("Please enter a valid email address")
        .normalizeEmail()
   
]
, authControllers.postReset);

router.get("/reset/:token", authControllers.getNewPassword);

router.post('/new-password', [

    body("currentPassword")
        .trim()
        .isAlphanumeric()
        .custom((value , {req})=>{
            return Users.findOne({_id: req.body.userId})
                .then(userDoc=>{

                    return  bcrypt.compare(value, userDoc.password)
                })
                .then(doMatch=>{
                    if(!doMatch){
                        return Promise.reject("Current Password Must be Match");
                    }
                    
                return true;
            })
        }),
    body("newPassword" , "The password must be 6+ chars long and contain a number")
        .trim()
        .isLength({min : 6})
        .isAlphanumeric(),

    body("confirmPassword", "Password confirmation does not match password!")
        .trim()
        .isLength({min: 6})
        .isAlphanumeric()
        .custom((value, {req})=>{
            if(value != req.body.newPassword){
                return Promise.reject("Password confirmation does not match password!");
            }
            return true;
        })


], authControllers.postNewPassword);

module.exports = router;