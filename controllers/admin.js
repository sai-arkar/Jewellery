const Categories = require("../models/categories");
const Items = require("../models/items");
const Users = require("../models/Users");
const Roles = require("../models/roles");
const Comments = require("../models/comments");
const bcrypt = require("bcryptjs");

const moment = require("moment");

const { validationResult } = require("express-validator");

const sgMail = require('@sendgrid/mail')
sgMail.setApiKey("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")

const fileHelper = require("../middleware/file");
const mongoose = require( "mongoose" );

let relatedImageArr = [];
let roleForUse = [];
let test;

exports.getAdminDashborad = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }
     res.status(201).render("admin/dashboard", {
          pageTitle : "Admin Dashboard",
          user : req.user.name,
          editing : false,
          path: '/admin/dashboard'
     });
}

exports.getAddCate = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }
     res.status(201).render("admin/add-cate", {
          pageTitle : "Add Category",
          editing : false,
          user : req.user.name,
          path: '/admin/add-cate'
     });
}

exports.postAddCate =async (req, res, next)=>{
     const title = req.body.title;

     const category = new Categories({
          title : title,
          userId: req.user
     });

     try{
          await category.save();

          console.log("Add Category!");
          res.status(300).redirect("/admin/add-cate");

     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.getEditCate =async (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.status(300).redirect('/');
     }

     const editMode = req.query.edit;
     const cateId = req.params.cateId;

     if(!editMode){
          return res.status(300).redirect('/admin/categories');
     }

     try{
          let cate = await Categories.findById(cateId);
               if(!cate){
                    return res.status(300).redirect("/admin/categories");
               }
              
               if( req.user._id.toString() === '62031c692c2300baf01541f2' 
                    || cate.userId.toString() == req.user._id.toString() ){

                         res.status(201).render('admin/add-cate', {
                              pageTitle : 'Edit Category',
                              editing : editMode,
                              cate : cate,
                              user : req.user.name,
                              path: '/admin/add-cate'
                         })
               }else{
                    console.log("Not Authorized!");
                    return res.status(300).redirect("/admin/categories"); 
               }
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }

}

/* Need Some Testing */
exports.postEditCate = async (req, res, next)=>{
     const cateId = req.body.cateId;
     const updatedTitle = req.body.title;

     try{
          let cate = await Categories.findById(cateId);
               if(req.user._id.toString() === '62031c692c2300baf01541f2' 
               || cate.userId.toString() === req.user._id.toString() )
               {
                    cate.title = updatedTitle;
                    const result = await cate.save(); 
                    console.log("Updated Category!");
                    res.status(300).redirect("/admin/categories");
                     
               }else{
                    console.log("Not Authorized!");
                    res.status(300).redirect("/admin/categories");
               }
               
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.getCategories = async (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.status(300).redirect('/');
     }
     try{
          let result = await Categories.find();
               res.status(201).render("admin/categories", {
                    pageTitle : "Categories",
                    categories : result,
                    user : req.user.name,
                    editing : false,
                    path: '/admin/categories'
               });
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }

}

exports.deleteCate = async (req, res, next)=>{
     const cateId = req.params.cateId;

     try{
          let cate = await Categories.findById(cateId);
               if(!cate){
                    return next(new Error('Category Not Found!'));
               }

               if(req.user._id.toString() === '62031c692c2300baf01541f2' 
               || cate.userId.toString() == req.user._id.toString() )
               {
                    let result = await Categories.deleteOne({_id: cateId});
                         res.status(200).json({ message : 'Success!'});

                    let items = await Items.find();
                         items.map(item=>{
                              if(item.categoryId.toString() == cateId.toString()){
                                   fileHelper.deleteFile(item.image);
                                   item.relatedImg.map(path=>{
                                        fileHelper.deleteFile(path);
                                   });
                              }
                         })
                    let deleteResult = await Items.deleteMany({categoryId : cateId});
                         console.log("Delete Related Items From Category!");
               }else{
                    console.log("Not Authorized!");
                    return res.status(300).redirect("/admin/categories");
               }

     }catch(err){
          res.status(500).json({ message : "Deleting Category Failed!"});
     }
          
}

exports.getAddItem = async (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.status(300).redirect('/');
     }

     try{
          let result = await Categories.find();
               res.status(201).render('admin/add-item', {
                    pageTitle : "Add Item",
                    categories : result,
                    adding : true,
                    editing : false,
                    user : req.user.name,
                    path: '/admin/add-item'
               })
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.postAddItem = async (req, res, next)=>{
     const categoryId = req.body.categoryId;
     const title = req.body.title;
     const description = req.body.description;
     const price = req.body.price;

     const image = req.files.image;
     const relatedImage = req.files.relatedImage;

     if(!req.files){
          return res.status(422).redirect('/admin/add-items');
     }

     relatedImageArr = new Array();
     relatedImage.map((item)=>{
          relatedImageArr.push(item.path);
     })

     try{
          const item = new Items({
               categoryId : categoryId,
               title: title,
               image : image[0].path,
               relatedImg: relatedImageArr,
               description: description,
               price : price,
               userId: req.user
          });
          const result = await item.save()
               console.log("Add Item Successfully!");
               res.status(300).redirect("/admin/all-items");
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.declineItem = async (req, res, next)=>{
     const itemId = req.params.itemId;
     try{
          let item = await Items.findById(itemId)
               if(!item){
                    return next(new Error('Item Not Found!'));
               }
               if(item.userId.toString() === req.user._id.toString()
               || req.user._id.toString() === '62031c692c2300baf01541f2'){

                    fileHelper.deleteFile(item.image);
               
                    item.relatedImg.map(path=>{
                         fileHelper.deleteFile(path);
                    })

                    await Comments.deleteMany({itemId: itemId});
                    await Items.deleteOne({_id:itemId})
                         res.status(200).json({ message : 'Success!'});
                         console.log("Deleted Item!");
               }else{
                    console.log("Not Authorized!");
                    return res.status(403).redirect("/admin/all-items");
               }
               
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.postApproveItem = async (req, res, next)=>{
     const itemId = req.params.itemId;

     try{
          let item = await Items.findById(itemId);
               if(!item){
                    return res.status(300).redirect('/admin/all-items');
               }
               item.state = true;
               await item.save()
                    res.status(200).json({message : "Approve Item"});
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}


exports.getApprovedItems = async(req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.status(404).redirect('/');
     }

     let getItems = [];
     
     try{
          let resultItems = await Items.find().populate('categoryId').sort({createdAt: -1});
               
               resultItems.map(item=>{
                    if(item.state == true){
                         getItems.push(item);
                    }
               })
               console.log(getItems);
               
          let cateResult = await Categories.find();
               res.status(201).render('admin/approved-items', {
                    pageTitle : "Approved Items",
                    items : getItems,
                    categories : cateResult,
                    editing: false,
                    user : req.user.name,
                    path: '/admin/approved-items'
               });
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}


exports.getAllItems = async (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.status(404).redirect('/');
     }

     let getItems;
     try{
          let resultItems = await Items.find().populate('categoryId').sort({createdAt: -1});
               getItems = resultItems;
          let cateResult = await Categories.find();
               res.status(201).render('admin/all-items', {
                    pageTitle : "Pending Items",
                    items : getItems,
                    categories : cateResult,
                    editing: false,
                    user : req.user.name,
                    path: '/admin/all-items'
               });
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.getItemDetail = async (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.status(404).redirect('/');
     }

     const itemId = req.params.itemId;

     try{
          let item = await Items.findById(itemId);
          let comments = await Comments.find({itemId: itemId});
               let time = moment(comments.createdAt).format('LT');
               res.status(201).render("admin/detail", {
                    pageTitle : "Detail",
                    item : item,
                    user : req.user.name,
                    userInfo: req.user,
                    editing : false,
                    path: '',
                    comments: comments,
                    time: time,
                    itemId: itemId
               });
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.postComment = async (req, res, next)=>{
     const itemId = req.body.itemId;
     const userComment = req.body.comment;

     try{
          const comment = new Comments({
               userId: req.user,
               itemId: itemId,
               name: req.user.name,
               comment: userComment
          });
          await comment.save();

          res.status(300).redirect("/admin/items/"+itemId);

     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.getEditItem = async (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.status(404).redirect('/');
     }

     const editMode = req.query.edit;
     let getItems;
     if(!editMode){
          return res.redirect('/admin/all-items');
     }
     const itemId = req.params.itemId;
     
     try{
          let item = await Items.findById(itemId);
          getItems = item;
               if(item.userId.toString() === req.user._id.toString()
               || req.user._id.toString() === '62031c692c2300baf01541f2'){
                    let categories = await Categories.find();
                    res.status(201).render('admin/add-item', {
                         pageTitle : "Edit Item",
                         editing : editMode,
                         adding : false,
                         item : getItems,
                         categories : categories,
                         user : req.user.name,
                         path: '/admin/add-item'
                    });
               }else{
                    console.log("Not Authorized!");
                    return res.redirect("/admin/all-items");
               }
               
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }

}

exports.postEditItem = async (req, res, next)=>{
     const categoryId = req.body.categoryId;
     const itemId = req.body.itemId;
     const updatedTitle = req.body.title;
     const updatedDes = req.body.description;
     const updatedPrice = req.body.price;

     const image = req.files.image;
     const updateRImage = req.files.relatedImage;

     let updateRImageArr = [];
     
     if(updateRImage){
          updateRImage.map((item)=>{
               updateRImageArr.push(item.path);
          })
     }
     
     try{
          let item = await Items.findById(itemId);
               if(!item){
                    return res.redirect('/admin/all-items');
               }
               if(item.userId.toString() === req.user._id.toString()
               || req.user._id.toString() === '62031c692c2300baf01541f2'){

                    item.categoryId = categoryId;
                    item.title = updatedTitle;
                    item.price = updatedPrice;
                    item.description = updatedDes;
                    if(image){
                         fileHelper.deleteFile(item.image);
                         item.image = image[0].path;
                    }
                    if(updateRImage){
                         item.relatedImg.map(path=>{
                              fileHelper.deleteFile(path);
                         })
                         item.relatedImg = updateRImageArr;
                    }
                    item.state = false;

                    await item.save();

                    if(updateRImage){
                         relatedImageArr = updateRImageArr;
                    }
                    
                    console.log("Updated Item");
                    res.status(300).redirect("/admin/all-items");

               }else{
                    console.log("Not Authorized!");
                    return res.redirect("/admin/all-items");
               }
               
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }

}


exports.getProfile = async (req, res, next)=>{
     if(!req.user){
          console.status(404).log("Account Does not Exist");
          return res.redirect('/');
     }
     try{
          let result = await Users.findOne(req.user);
               res.render("admin/profile", {
                    pageTitle : "Profile",
                    user : result.name,
                    User : result,
                    editing : false,
                    path: '/admin/profile'
               });
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
     
}

exports.postProfileInfo = async (req, res, next)=>{
     const userId = req.body.userId;
     const updatedName = req.body.name;
     const updatedEmail = req.body.email;
     const updatedConEmail = req.body.confirmEmail;

     try{
          let user = await Users.findOne({userId});
               if(!user){
                    console.log("User Not Exit");
                    return res.redirect("/admin/profile");
               }
               if(updatedName){
                    user.name = updatedName;
               }
               if(updatedEmail){
                    user.email = updatedEmail;
               }
               await user.save();

               console.log("Updated User Info");
               res.status(300).redirect("/admin/profile");
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }

}

exports.postChangePass = async (req, res, next)=>{
     const userId = req.body.userId;
     const currentPass = req.body.currentPass;
     const newPass = req.body.newPass;
     const confirmPass = req.body.confirmPass;

     try{
          let user = await Users.findOne({userId});
          let doMatch = await bcrypt.compare(currentPass, user.password);
               if(!doMatch){
                    console.log("Password Didn't Match");
                    return res.status(300).redirect('/admin/profile');
               }
               let hashedPass = await bcrypt.hash(newPass, 12);
                         
                    user.password = hashedPass;
                    await user.save();
                         console.log("Change Password!");
                         res.status(300).redirect("/admin/profile");
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

// user ဖန်တီးထားတဲ့ items တွေနဲ့ images တွေကိုပါ Delete လုပ်ပေးရမယ်။
exports.postDeleteAcc = (req, res, next)=>{
     res.send("helloworld");
}

exports.getAddRole = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.status(300).redirect('/');
     }

     res.render('admin/add-role', {
          path: '/admin/add-role',
          editing: false,
          pageTitle: "Add Role",
          user: req.user.name
     });
}

exports.postAddRole = async (req, res, next)=>{
     const title = req.body.title;
     const description = req.body.description;

     try{
          const role = new Roles({
               title,
               description,
               userId: req.user
          });
     
          await role.save()
          
          console.log("Created Role");
          
          res.status(300).redirect("/admin/add-role");
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }

}

exports.getRole = async (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.status(300).redirect('/');
     }

     try{
          let result = await Roles.find();
          res.render("admin/roles", {
               path: '/admin/roles',
               pageTitle: "All Roles",
               editing : false,
               user: req.user.name,
               roles : result
          });
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
 
}

exports.getTestDatatable = (req, res, next)=>{
     res.status(300).render('admin/test-datatable');
}

exports.getEditRole = async (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.status(300).redirect('/');
     }

     const editMode = req.query.edit;
     const roleId = req.params.roleId;

     if(!editMode){
          return res.status(300).redirect('/admin/roles');
     }

     try{
          let role = await Roles.findById(roleId);
               if(!role){
                    return res.redirect("/admin/roles");
               }
              
               if( req.user._id.toString() === '62031c692c2300baf01541f2' 
                    && role.userId.toString() == req.user._id.toString() ){

                         res.status(201).render('admin/add-role', {
                              pageTitle : 'Edit Role',
                              editing : editMode,
                              role : role,
                              user : req.user.name,
                              path: '/admin/add-role'
                         })
               }else{
                    console.log("Not Authorized!");
                    return res.status(300).redirect("/admin/roles"); 
               }
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }

}

exports.postEditRole = async (req, res, next)=>{
     const roleId = req.body.roleId;
     const updatedTitle = req.body.title;
     const updatedDesc = req.body.description;

     try{
          let role = await Roles.findById(roleId);
               if(req.user._id.toString() === '62031c692c2300baf01541f2' 
               || role.userId.toString() == req.user._id.toString() )
               {
                    role.title = updatedTitle;
                    role.description = updatedDesc;
                    await role.save();
                    console.log("Updated Role!");
                    res.redirect("/admin/roles");

               }else{
                    console.log("Not Authorized!");
                    res.redirect("/admin/roles");
               }
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }

}

exports.deleteRole = async (req, res, next)=>{
     const roleId = req.params.roleId;
     
     try{
          let role = await Roles.findById(roleId);
               if(!role){
                    return next(new Error('Role Not Found!'));
               }

               if(req.user._id.toString() === '62031c692c2300baf01541f2' 
               || role.userId.toString() == req.user._id.toString() )
               {
                    await Roles.deleteOne({_id: roleId});
                         console.log("Delete Role!");
                         res.status(200).json({ message : 'Success!'});

               }else{
                    console.log("Not Authorized!");
                    return res.redirect("/admin/roles");
               }

     }catch(err){
          res.status(500).json({ message : "Deleting Role Failed!"});
     }
}

exports.getAddEmployee = async (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }

     try{
          let result = await Roles.find();
               test = result
               roleForUse = new Array();

               result.map(role=>{
                    roleForUse.push(role);
               })

               res.render("admin/add-employee", {
                    pageTitle : 'Add Employee',
                    editing : false,
                    user : req.user.name,
                    path: '/admin/add-employee',
                    roles: result,
                    errorMessage: false,
                    oldInput: {
                         email: '',
                         password: '',
                         confirmPassword: ''
                    },
                    validationErrors: []
               });
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
     
}

exports.postAddEmployee = async (req, res, next)=>{
     const name = req.body.name;
     const email = req.body.email;
     const password = req.body.password;
     const roleTitle = req.body.roleTitle;

     const errors = validationResult(req);
     if(!errors.isEmpty()){
          return res.status(422).render("admin/add-employee",{
               pageTitle: "Add Employee",
               errorMessage: errors.array()[0].msg,
               editing : false,
               user : req.user.name,
               path: '/admin/add-employee',
               roles: roleForUse,
               oldInput: {
                    name: name,
                    email: email,
                    password: password,
                    confirmPassword: req.body.confirmPassword
               },
               validationErrors: errors.array()
          });
     }
               
     try{
          let hashedPass = await bcrypt.hash(password, 12);
               const employee = new Users({
                    name,
                    email,
                    password: hashedPass,
                    status: roleTitle
               });
               await employee.save();
               console.log("Created Employee");
               res.redirect('/admin/add-employee');

               const msg = {
                    to: req.body.email, // Change to your recipient
                    from: 'saiscript.digit@gmail.com', // Change to your verified sender
                    subject: "Welcome To National Cyber City",
                    html: `
                         <h1>Now, You Can Use National Cyber City's App</h1>
                         <h3>Click this <a href="http://localhost:8080/">link</h3> 
                         `
                  };

               sgMail
                  .send(msg)
                  .then((response) => {
                    console.log(response[0].statusCode)
                    console.log(response[0].headers)
                  })
                  .catch((error) => {
                    console.error(error)
                  })
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.getAllEmployees = async (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }
     
     try{
          let result = await Users.find();
               res.render('admin/employees', {
                    pageTitle : 'Employees',
                    editing : false,
                    user : req.user.name,
                    path: '/admin/employees',
                    users: result
               })
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.getEditEmployee = async (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }
     
     const editMode = req.query.edit;
     const eId = req.params.eId;

     if(!editMode){
          return res.redirect('/admin/employees');
     }

     try{
          let result = await Users.findById(eId);

               if(req.user._id.toString() === '62031c692c2300baf01541f2')
               {
                    let roles = await Roles.find();
                         res.render('admin/add-employee', {
                              pageTitle : 'Edit Employee',
                              editing : editMode,
                              user : req.user.name,
                              path: '/admin/add-employee',
                              employee : result,
                              roles: roles,
                              errorMessage: false,
                              oldInput: {
                                   name: '',
                                   email: '',
                                   password: '',
                                   confirmPassword: ''
                              },
                              validationErrors: []
                         })
               }else{
                    console.log("Not Authorized!");
                    return res.redirect("/admin/employees");
               }
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.postEditEmployee = async (req, res, next)=>{
     const eId = req.body.eId;
     const updatedName = req.body.name;
     const updatedEmail = req.body.email;
     const updatedRole = req.body.roleTitle
     const updatedPass = req.body.password;
     const updatedConPass = req.body.confirmPassword;

     try{
          let user = await Users.findById(eId);
               if(!user){
                    console.log("User Not Exist!");
                    return res.redirect('/admin/employees');
               }
               if(req.user._id.toString() === '62031c692c2300baf01541f2'){

                    let hashedPass = await bcrypt.hash(updatedPass, 12);
                         user.name = updatedName;
                         user.email = updatedEmail;
                         user.password = hashedPass;
                         user.status = updatedRole;

                         await user.save();
                         console.log("Updated User Info");
                         res.redirect('/admin/employees');
               }
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}

exports.deleteEmployee = async(req, res, next)=>{
     const eId = req.params.eId;
     try{
          let employee = Users.findById(eId);
               if(!employee){
                    return next(new Error('employee Not Found!'));
               }
               if("62031c692c2300baf01541f2" !== req.user._id.toString()){
                    console.log("Not Authorized!");
                    return res.redirect("/admin/employees");
               }
               
               await Users.deleteOne({_id:eId});
                    console.log("Deleted Employee!");
                    res.status(200).json({ message : 'Success!'});

                         // must delete user-create items and items's images
               let items =  Items.find({userId: eId});
                    for(let item of items){
                         fileHelper.deleteFile(item.image);
               
                         item.relatedImg.map(path=>{
                              fileHelper.deleteFile(path);
                         })
                         await Items.deleteOne({userId: eId})
                              console.log("Deleted Item!");
                    }
     }catch(err){
          const error = new Error(err);
          error.httpStatusCode = 500;
          return next(error);
     }
}