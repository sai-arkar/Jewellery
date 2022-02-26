const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const itemSchema = new Schema({
     categoryId: {
          type: Schema.Types.ObjectId,
          ref: 'Categories',
          required: true
     },
     title:{
          type: String,
          required: true
     },
     image : {
          type: String,
          required: true
     },
     relatedImg:[
          {
               type: String,
               required: true
          }
     ],
     description:{
          type: String,
          required: true
     },
     price: {
          type: Number,
          required: true
     },
     state: {
          type: Boolean,
          default: false // false => Pending // true => Approve
     },
     userId: {
          type: Schema.Types.ObjectId,
          ref: 'Users',
          required: true
     }
}, {timestamps: true});

module.exports = mongoose.model("Items", itemSchema);