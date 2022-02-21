const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const commentSchema = new Schema({
     userId: {
          type: Schema.Types.ObjectId,
          ref: 'Users',
          required: true
     },
     itemId: {
          type: Schema.Types.ObjectId,
          ref: "Items", 
          required: true
     },
     name: {
          type: String,
          required: true
     },
     comment: {
          type: String,
          required: true
     }
}, {timestamps: true});

module.exports = mongoose.model("Comment", commentSchema);