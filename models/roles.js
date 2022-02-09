const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const roleSchema = new Schema({
     title:{
          type: String,
          required: true
     },
     description: {
          type: String,
          required: true
     },
     userId: { // ဘယ် user က ဖန်တီးထားသလဲ ဆိုတာကို သိဖို့အတွက်
          type: Schema.Types.ObjectId,
          ref: 'Users',
          required: true
     }
});

module.exports = mongoose.model("Roles", roleSchema);