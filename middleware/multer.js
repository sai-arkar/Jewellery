const multer = require('multer');

/* Manage Single Image with random name */
const fileStorage = multer.diskStorage({
  destination: (req, file, cb)=>{
    cb(null, 'images');
  },
  filename: (req, file, cb)=>{
    cb(null, Date.now() + '-' + file.originalname);
  }
});

/* filter image with file type */
const fileFilter = (req, file, cb)=>{
  if(
      file.mimetype === 'image/png' || 
      file.mimetype === 'image/jpg' || 
      file.mimetype === 'image/jpeg'
  ){
    cb(null , true);
  }else{
    cb(null, false);
  }
};

const upload = multer({
     storage : fileStorage, 
     fileFilter : fileFilter
});

let cpUpload = upload.fields([
     {name: 'image', maxCount: 1},
     {name : 'relatedImage', maxCount: 20}
]);

module.exports = cpUpload;