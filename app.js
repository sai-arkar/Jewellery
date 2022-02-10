const path = require("path");
const fs = require("fs");

const cors = require("cors");
const { createProxyMiddleware } = require('http-proxy-middleware');
const bodyParser = require('body-parser');
const express = require("express");
const mongoose = require("mongoose");
const session = require("express-session");
const MongoDBStore = require('connect-mongodb-session')(session);

// const csrf = require("csurf");

// const csrfProtection = csrf();

const Users = require("./models/Users");

const MONGODB_URI = `mongodb+srv://${process.env.MONGO_USER}:${process.env.MONGO_PASSWORD}@cluster0.hl7kn.mongodb.net/${process.env.MONGO_DEFAULT_DATABASE}?retryWrites=true&w=majority`;

const app = express();
const store = new MongoDBStore({
     uri: MONGODB_URI,
     collection: 'sessions'
});


app.set("view engine", "ejs");
app.set("views", "views");

const authRoutes = require("./routes/auth");
const appUserRoutes = require("./apiRoutes/appUserAuth");
const adminRoutes = require("./routes/admin");

app.use(cors());

app.use(bodyParser.json());
app.use(express.urlencoded({extended : false}));
app.use(express.static(path.join(__dirname, 'public')));
app.use("/images", express.static(path.join(__dirname, "images")));

app.use(
     session({
          secret: 'my Session',
          resave: false,
          saveUninitialized: false,
          store: store
     })
)

// app.use(csrfProtection);
// app.use(cookieParser());

app.use((req, res, next)=>{
     res.locals.isSuperAdmin = req.session.isSuperAdmin;
     next();
   });
   
app.use((req, res, next) => {
     if (!req.session.user) {
       return next();
     }
     Users.findById(req.session.user._id)
       .then(user => {
         if(!user){
           return next();
         }
         req.user = user;
         next();
       })
       .catch(err =>{
         next(new Error(err));
       });
   });


// app.use((req, res, next)=>{
//      res.setHeader('Access-Control-Allow-Origin', '*');
//      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
//      res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
//      res.setHeader('Access-Control-Allow-Credentials', true);
//      next();
// })


// app.use('/api', createProxyMiddleware({ 
//      target: 'http://localhost:8080/', //original url
//      changeOrigin: true, 
//      //secure: false,
//      onProxyRes: function (proxyRes, req, res) {
//         proxyRes.headers['Access-Control-Allow-Origin'] = '*';
//      }
//  }));
 
app.use('/admin', adminRoutes);
app.use(authRoutes);
app.use('/api',appUserRoutes);

mongoose.connect(MONGODB_URI)
     .then(()=>{
          console.log("Connected!");
          app.listen(process.env.PORT || 8080);
     })
     .catch(err=>{
          console.log(err);
     });

