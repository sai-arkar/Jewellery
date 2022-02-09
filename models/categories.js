const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const categoriesSchema = new Schema({
     title:{
          type: String,
          required: true
     },
     userId: {
          type: Schema.Types.ObjectId,
          ref: 'Users',
          required: true
     }
});

module.exports = mongoose.model("Categories", categoriesSchema);