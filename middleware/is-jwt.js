const jwt = require('jsonwebtoken');

module.exports = (req, res, next)=>{
     const authHeader = req.header('Authorization'); // Bearer asdfj;aldjkowjl;sdkjf234
     if(!authHeader){
          const error = new Error('Not Authorization');
          error.statusCode = 401;
          throw error;
     }
     const token = authHeader.split(" ")[1];
     let decodedToken;
     try{
          decodedToken = jwt.verify(token, 'thisissupersecretforjsonwebtoken');
     }catch(err){
          err.statusCode = 500;
          throw err;
     }
     if(!decodedToken){
          const error = new Error('Not Authorization');
          error.statusCode = 401;
          throw error;
     }
     req.userId = decodedToken.userId;
     next();
}