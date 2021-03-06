const express = require("express");
const { check, body } = require("express-validator");
const router = express.Router();

const Users = require("../models/Users");

const adminControllers = require("../controllers/admin");
const cpUpload = require("../middleware/multer");
const isAuth = require("../middleware/is-auth");
const isSuperAdmin = require("../middleware/is-superAdmin");

// testing
router.get('/test', isAuth, adminControllers.getTestDatatable);
// end testing

router.get('/dashboard', isAuth, adminControllers.getAdminDashborad);

router.get('/add-cate', isAuth, adminControllers.getAddCate);

/* Add Category */
router.post('/add-cate', isAuth, adminControllers.postAddCate);

router.get('/edit-cate/:cateId', isAuth, adminControllers.getEditCate);

/* Edit Category */
router.post('/edit-cate', isAuth, adminControllers.postEditCate);

router.get('/categories', isAuth, adminControllers.getCategories);

router.get('/add-item', isAuth, adminControllers.getAddItem);

/* Add Item */
router.post('/add-item', isAuth, cpUpload, adminControllers.postAddItem);

router.get('/all-items', isAuth, adminControllers.getAllItems);

/* Item Details */
router.get('/items/:itemId', isAuth, adminControllers.getItemDetail);

/* Add Comment*/
router.post("/comment", isAuth, adminControllers.postComment);

/* Delete Comment */ 
router.delete("/comment/:uId/:cId", isAuth, adminControllers.deleteComment);

/* Edit Comment */
router.post("/edit-comment", isAuth, adminControllers.postEditComment);

/* Edit Item */
router.get('/edit-item/:itemId', isAuth, adminControllers.getEditItem);

/* Edit Item */
router.post('/edit-item', isAuth, cpUpload, adminControllers.postEditItem);

/* Post Approve Item */
router.post('/approve-item/:itemId', isAuth, adminControllers.postApproveItem);

router.get('/approved-items', isAuth, adminControllers.getApprovedItems);


/* All Roles */
router.get('/roles', isAuth, isSuperAdmin, adminControllers.getRole);

/* Add Role */
router.get('/add-role', isAuth, isSuperAdmin, adminControllers.getAddRole);

router.post('/add-role', isAuth, isSuperAdmin, adminControllers.postAddRole);

/* Edit Role */
router.get('/edit-role/:roleId', isAuth, isSuperAdmin, adminControllers.getEditRole);

router.post('/edit-role', isAuth, isSuperAdmin, adminControllers.postEditRole);

/* Profile */
router.get('/profile', isAuth, adminControllers.getProfile);

/* Change Profile Info */
router.post('/profile-info', isAuth, adminControllers.postProfileInfo);



/* Add Employee */
router.get('/add-employee', isAuth, isSuperAdmin, adminControllers.getAddEmployee);

router.post('/add-employee', [
     check("email")
          .isEmail()
          .withMessage("Please enter a valid email!")
          .normalizeEmail()
          .custom((value , {req})=>{
               return Users.findOne({email : value})
                    .then(userDoc=>{
                         if(userDoc){
                              return Promise.reject("E-Mail exists already, please pick a different one.!");
                         }
                         return true;
                    })
           }),
     body("password", 
     "Please enter a password with only Numbers and Text and at least 6 Characters")
          .trim()
          .isLength({min : 6})
          .isAlphanumeric(),

     body("confirmPassword")
           .trim()
           .custom((value, {req})=>{
                if(value !== req.body.password){
                     throw new Error("Password Have To Match!");
                }
                return true;
           })
   
]
,isAuth, isSuperAdmin, adminControllers.postAddEmployee);

/* Employee */
router.get('/employees', isAuth, isSuperAdmin, adminControllers.getAllEmployees);

router.get('/edit-employee/:eId', isAuth, isSuperAdmin, adminControllers.getEditEmployee);

router.post('/edit-employee', isAuth, isSuperAdmin, adminControllers.postEditEmployee);

/* Delete Account */
router.post('/delete-account', isAuth, adminControllers.postDeleteAcc);

/* Delete Category */
router.delete('/categories/:cateId', isAuth, adminControllers.deleteCate);

/* Decline or Delete Item */
router.delete('/item/:itemId', isAuth, adminControllers.declineItem);

/* Delete Role */
router.delete('/delete-role/:roleId', isAuth, adminControllers.deleteRole);

/* Delete Employee */
router.delete('/delete-employee/:eId', isAuth, isSuperAdmin, adminControllers.deleteEmployee);

module.exports = router;