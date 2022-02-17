const Categories = require("../models/categories");
const Items = require("../models/items");
const Users = require("../models/Users");
const Roles = require("../models/roles");
const Comments = require("../models/comments");
const bcrypt = require("bcryptjs");
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
     res.render("admin/dashboard", {
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
     res.render("admin/add-cate", {
          pageTitle : "Add Category",
          editing : false,
          user : req.user.name,
          path: '/admin/add-cate'
     });
}

exports.postAddCate = (req, res, next)=>{
     const title = req.body.title;

     const category = new Categories({
          title : title,
          userId: req.user
     });

     category.save()
          .then(()=>{
               console.log("Add Category!");
               res.redirect("/admin/add-cate");
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.getEditCate = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }

     const editMode = req.query.edit;
     const cateId = req.params.cateId;

     if(!editMode){
          return res.redirect('/admin/categories');
     }

     Categories.findById(cateId)
          .then(cate=>{
               if(!cate){
                    return res.redirect("/admin/categories");
               }
              
               if( req.user._id.toString() === '62031c692c2300baf01541f2' 
                    || cate.userId.toString() == req.user._id.toString() ){

                         res.render('admin/add-cate', {
                              pageTitle : 'Edit Category',
                              editing : editMode,
                              cate : cate,
                              user : req.user.name,
                              path: '/admin/add-cate'
                         })
               }else{
                    console.log("Not Authorized!");
                    return res.redirect("/admin/categories"); 
               }
          })
          .catch(err=>{
               console.log(err);
          })

}

exports.postEditCate = (req, res, next)=>{
     const cateId = req.body.cateId;
     const updatedTitle = req.body.title;

     Categories.findById(cateId)
          .then(cate=>{
               if(req.user._id.toString() === '62031c692c2300baf01541f2' 
               || cate.userId.toString() == req.user._id.toString() )
               {
                    cate.title = updatedTitle;
                    return cate.save();  
               }else{
                    console.log("Not Authorized!");
                    return res.redirect("/admin/categories");
               }
               
          })
          .then(()=>{
               console.log("Updated Category!");
               res.redirect("/admin/categories");
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.getCategories = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }

     Categories.find()
          .then(result=>{
               res.render("admin/categories", {
                    pageTitle : "Categories",
                    categories : result,
                    user : req.user.name,
                    editing : false,
                    path: '/admin/categories'
               });
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.deleteCate = (req, res, next)=>{
     const cateId = req.params.cateId;
     Categories.findById(cateId)
          .then(cate=>{
               if(!cate){
                    return next(new Error('Category Not Found!'));
               }

               if(req.user._id.toString() === '62031c692c2300baf01541f2' 
               || cate.userId.toString() == req.user._id.toString() )
               {
                    Categories.deleteOne({_id: cateId})
                    .then(()=>{
                         res.status(200).json({ message : 'Success!'});
                         return Items.find();
                    })
                    .then((items)=>{
                         items.map(item=>{
                              if(item.categoryId.toString() == cateId.toString()){
                                   fileHelper.deleteFile(item.image);
                                   item.relatedImg.map(path=>{
                                        fileHelper.deleteFile(path);
                                   });
                              }
                         })
                         return Items.deleteMany({categoryId : cateId});
                    })
                    .then(()=>{
                         console.log("Delete Related Items From Category!");
                    })
               }else{
                    console.log("Not Authorized!");
                    return res.redirect("/admin/categories");
               }

          })
          .catch(err=>{
               res.status(500).json({ message : "Deleting Category Failed!"});
          })
          
}

exports.getAddItem = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }

     Categories.find()
          .then(result=>{
               res.render('admin/add-item', {
                    pageTitle : "Add Item",
                    categories : result,
                    adding : true,
                    editing : false,
                    user : req.user.name,
                    path: '/admin/add-item'
               })
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.postAddItem = (req, res, next)=>{
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

     const item = new Items({
          categoryId : categoryId,
          title: title,
          image : image[0].path,
          relatedImg: relatedImageArr,
          description: description,
          price : price,
          userId: req.user
     });
     item.save()
          .then(result=>{
               console.log("Add Item Successfully!");
               res.redirect("/admin/all-items");
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.declineItem = (req, res, next)=>{
     const itemId = req.params.itemId;
     Items.findById(itemId)
          .then(item=>{
               if(!item){
                    return next(new Error('Item Not Found!'));
               }
               if(item.userId.toString() === req.user._id.toString()
               || req.user._id.toString() === '62031c692c2300baf01541f2'){

                    fileHelper.deleteFile(item.image);
               
                    item.relatedImg.map(path=>{
                         fileHelper.deleteFile(path);
                    })

                    Items.deleteOne({_id:itemId})
                         .then(()=>{
                              res.status(200).json({ message : 'Success!'});
                              console.log("Deleted Item!");
                         })
               }else{
                    console.log("Not Authorized!");
                    return res.redirect("/admin/all-items");
               }
               
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.getAllItems = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }

     let getItems;
     Items.find()
          .populate('categoryId')
          .then(resultItems =>{
               getItems = resultItems;
               return Categories.find();
          })
          .then(cateResult =>{
               res.render('admin/all-items', {
                    pageTitle : "Pending Items",
                    items : getItems,
                    categories : cateResult,
                    editing: false,
                    user : req.user.name,
                    path: '/admin/all-items'
               });
          })
          .catch(err =>{
               console.log(err);
          })
}



exports.getItemDetail = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }

     const itemId = req.params.itemId;
     Items.findById(itemId)
          .then(item =>{
               Comments.find()
                    .then(comments=>{
                         
                         res.render("admin/detail", {
                              pageTitle : "Detail",
                              item : item,
                              user : req.user.name,
                              userInfo: req.user,
                              editing : false,
                              path: '',
                              comments: comments
                         });
                    })
          })
          .catch(err =>{
               console.log(err);
          })
}


exports.getEditItem = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }

     const editMode = req.query.edit;
     let getItems;
     if(!editMode){
          return res.redirect('/admin/all-items');
     }
     const itemId = req.params.itemId;
     Items.findById(itemId)
          .then(item =>{
               if(item.userId.toString() !== req.user._id.toString()
               || req.user._id.toString() !== '62031c692c2300baf01541f2'){
                    console.log("Not Authorized!");
                    return res.redirect("/admin/all-items");
               }
               getItems = item;
               Categories.find()
                    .then(categories =>{
                         res.render('admin/add-item', {
                              pageTitle : "Edit Item",
                              editing : editMode,
                              adding : false,
                              item : getItems,
                              categories : categories,
                              user : req.user.name,
                              path: '/admin/add-item'
                         })
                    })
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.postEditItem = (req, res, next)=>{
     const categoryId = req.body.categoryId;
     const itemId = req.body.itemId;
     const updatedTitle = req.body.title;
     const updatedDes = req.body.description;
     const updatedPrice = req.body.price;

     const image = req.files.image;
     const updateRImage = req.files.relatedImage;

     console.log(image);
     
     let updateRImageArr = [];
     
     if(updateRImage){
          updateRImage.map((item)=>{
               updateRImageArr.push(item.path);
          })
     }
     
     Items.findById(itemId)
          .then(item =>{
               if(!item){
                    return res.redirect('/admin/all-items');
               }
               if(item.userId.toString() !== req.user._id.toString()
               || req.user._id.toString() !== '62031c692c2300baf01541f2'){
                    console.log("Not Authorized!");
                    return res.redirect("/admin/all-items");
               }
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
               return item.save();
          })
          .then(()=>{
               if(updateRImage){
                    relatedImageArr = updateRImageArr;
               }
               // console.log('UpdateRImage array ',updateRImageArr);
               // console.log('Update related image Array',relatedImageArr);
               console.log("Updated Item");
               res.redirect("/admin/all-items");
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.postApproveItem = (req, res, next)=>{
     const itemId = req.params.itemId;

     Items.findById(itemId)
          .then(item=>{
               if(!item){
                    return res.redirect('/admin/all-items');
               }
               item.state = true;
               item.save()
                    .then(()=>{
                         res.status(200).json({message : "Approve Item"});
                    })
          })
          .catch(err=>{
               console.log(err);
          })
}


exports.getApprovedItems = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }

     let getItems;
     Items.find()
          .populate('categoryId')
          .then(resultItems =>{
               getItems = resultItems;
               return Categories.find();
          })
          .then(cateResult =>{
               res.render('admin/approved-items', {
                    pageTitle : "Approved Items",
                    items : getItems,
                    categories : cateResult,
                    editing: false,
                    user : req.user.name,
                    path: '/admin/approved-items'
               });
          })
          .catch(err =>{
               console.log(err);
          })
}

exports.getProfile = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }

     Users.findOne(req.user)
          .then((result)=>{
               res.render("admin/profile", {
                    pageTitle : "Profile",
                    user : result.name,
                    User : result,
                    editing : false,
                    path: '/admin/profile'
               });
          })
}

exports.postProfileInfo = (req, res, next)=>{
     const userId = req.body.userId;
     const updatedName = req.body.name;
     const updatedEmail = req.body.email;
     const updatedConEmail = req.body.confirmEmail;

     Users.findOne({userId})
          .then(user =>{
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
               return user.save();
          })
          .then(()=>{
               console.log("Updated User Info");
               res.redirect("/admin/profile");
          })
          .catch(err=>console.log(err));
}

exports.postChangePass = (req, res, next)=>{
     const userId = req.body.userId;
     const currentPass = req.body.currentPass;
     const newPass = req.body.newPass;
     const confirmPass = req.body.confirmPass;

     Users.findOne({userId})
          .then((user)=>{
               bcrypt.compare(currentPass, user.password)
                    .then(doMatch =>{
                         if(!doMatch){
                              console.log("Password Didn't Match");
                              return res.redirect('/admin/profile');
                         }
                         bcrypt.hash(newPass, 12)
                              .then(hashedPass =>{
                                   
                                   user.password = hashedPass;
                                   user.save()
                                        .then(()=>{
                                             console.log("Change Password!");
                                             res.redirect("/admin/profile");
                                        })
                              })
                    })
          })
          .catch(err=>{
               console.log(err);
          })
}

// user ဖန်တီးထားတဲ့ items တွေနဲ့ images တွေကိုပါ Delete လုပ်ပေးရမယ်။
exports.postDeleteAcc = (req, res, next)=>{
     res.send("helloworld");
}

exports.getAddRole = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }

     res.render('admin/add-role', {
          path: '/admin/add-role',
          editing: false,
          pageTitle: "Add Role",
          user: req.user.name
     });
}

exports.postAddRole = (req, res, next)=>{
     const title = req.body.title;
     const description = req.body.description;

     const role = new Roles({
          title,
          description,
          userId: req.user
     });

     role.save()
          .then(()=>{
               console.log("Created Role");
               res.redirect("/admin/add-role");
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.getRole = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }

     Roles.find()
          .then(result =>{
               res.render("admin/roles", {
                    path: '/admin/roles',
                    pageTitle: "All Roles",
                    editing : false,
                    user: req.user.name,
                    roles : result
               });
          })
}

exports.getTestDatatable = (req, res, next)=>{
     res.render('admin/test-datatable');
}

exports.getEditRole = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }

     const editMode = req.query.edit;
     const roleId = req.params.roleId;

     if(!editMode){
          return res.redirect('/admin/roles');
     }

     Roles.findById(roleId)
          .then(role=>{
               if(!role){
                    return res.redirect("/admin/roles");
               }
              
               if( req.user._id.toString() === '62031c692c2300baf01541f2' 
                    && role.userId.toString() == req.user._id.toString() ){

                         res.render('admin/add-role', {
                              pageTitle : 'Edit Role',
                              editing : editMode,
                              role : role,
                              user : req.user.name,
                              path: '/admin/add-role'
                         })
               }else{
                    console.log("Not Authorized!");
                    return res.redirect("/admin/roles"); 
               }
          })
          .catch(err=>{
               console.log(err);
          })

}

exports.postEditRole = (req, res, next)=>{
     const roleId = req.body.roleId;
     const updatedTitle = req.body.title;
     const updatedDesc = req.body.description;

     Roles.findById(roleId)
          .then(role=>{
               if(req.user._id.toString() === '62031c692c2300baf01541f2' 
               || role.userId.toString() == req.user._id.toString() )
               {
                    role.title = updatedTitle;
                    role.description = updatedDesc;
                    return role.save();  
               }else{
                    console.log("Not Authorized!");
                    return res.redirect("/admin/roles");
               }
               
          })
          .then(()=>{
               console.log("Updated Role!");
               res.redirect("/admin/roles");
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.deleteRole = (req, res, next)=>{
     const roleId = req.params.roleId;
     Roles.findById(roleId)
          .then(role=>{
               if(!role){
                    return next(new Error('Role Not Found!'));
               }

               if(req.user._id.toString() === '62031c692c2300baf01541f2' 
               || role.userId.toString() == req.user._id.toString() )
               {
                    Roles.deleteOne({_id: roleId})
                    .then(()=>{
                         console.log("Delete Role!");
                         res.status(200).json({ message : 'Success!'});
                    })
               }else{
                    console.log("Not Authorized!");
                    return res.redirect("/admin/roles");
               }

          })
          .catch(err=>{
               res.status(500).json({ message : "Deleting Role Failed!"});
          })
}

exports.getAddEmployee = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }

     Roles.find()
          .then(result=>{
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
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.postAddEmployee = (req, res, next)=>{
     const name = req.body.name;
     const email = req.body.email;
     const password = req.body.password;
     const roleTitle = req.body.roleTitle;

     const errors = validationResult(req);
     console.log(email);
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
               
     bcrypt.hash(password, 12)
          .then(hashedPass=>{
               const employee = new Users({
                    name,
                    email,
                    password: hashedPass,
                    status: roleTitle
               });
               return employee.save();
          })
          .then(()=>{
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
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.getAllEmployees = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }
     
     Users.find()
          .then(result =>{
               res.render('admin/employees', {
                    pageTitle : 'Employees',
                    editing : false,
                    user : req.user.name,
                    path: '/admin/employees',
                    users: result
               })
          })
          .catch(err=>{
               console.log(err);
          })
}

exports.getEditEmployee = (req, res, next)=>{
     if(!req.user){
          console.log("Account Does not Exist");
          return res.redirect('/');
     }
     
     const editMode = req.query.edit;
     const eId = req.params.eId;

     if(!editMode){
          return res.redirect('/admin/employees');
     }
     Users.findById(eId)

          .then(result=>{
               if(req.user._id.toString() === '62031c692c2300baf01541f2')
               {
                    Roles.find()
                         .then(roles =>{
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
                         })
               }else{
                    console.log("Not Authorized!");
                    return res.redirect("/admin/employees");
               }
          })
          .catch(err => console.log(err));
}

exports.postEditEmployee = (req, res, next)=>{
     const eId = req.body.eId;
     const updatedName = req.body.name;
     const updatedEmail = req.body.email;
     const updatedRole = req.body.roleTitle
     const updatedPass = req.body.password;
     const updatedConPass = req.body.confirmPassword;

     Users.findById(eId)
          .then(user=>{
               if(!user){
                    console.log("User Not Exist!");
                    return res.redirect('/admin/employees');
               }
               if(req.user._id.toString() === '62031c692c2300baf01541f2'){

                    bcrypt.hash(updatedPass, 12)
                         .then(hashedPass=>{
                              user.name = updatedName;
                              user.email = updatedEmail;
                              user.password = hashedPass;
                              user.status = updatedRole;

                              return user.save();
                         })
                         .then(()=>{
                              console.log("Updated User Info");
                              res.redirect('/admin/employees');
                         })
               }
          })
          .catch(err=>console.log(err));
}

exports.deleteEmployee = (req, res, next)=>{
     const eId = req.params.eId;
     Users.findById(eId)
          .then(employee=>{
               if(!employee){
                    return next(new Error('employee Not Found!'));
               }
               if("62031c692c2300baf01541f2" !== req.user._id.toString()){
                    console.log("Not Authorized!");
                    return res.redirect("/admin/employees");
               }
               
               Users.deleteOne({_id:eId})
                    .then(()=>{
                         console.log("Deleted Employee!");
                         res.status(200).json({ message : 'Success!'});

                         // must delete user-create items and items's images
                         return Items.find({userId: eId})
                    })
                    .then(items=>{
                         for(let item of items){
                              fileHelper.deleteFile(item.image);
               
                              item.relatedImg.map(path=>{
                                   fileHelper.deleteFile(path);
                              })
                              Items.deleteOne({userId: eId})
                                   .then(()=>{
                                        console.log("Deleted Item!");
                                   })
                         }
                    })
          })
          .catch(err=>{
               console.log(err);
          })
}