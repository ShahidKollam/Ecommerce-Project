const mongoose = require('mongoose');

const bannerModel = new mongoose.Schema({
//    sequence: {
//       type: Number,
//       required: true,
//    },
   title:{
      type: String,
   },
   description:{
      type: String,
   },
   isBlocked:{
      type: Boolean,
      default: true, 
   },
   image:{
      type: String
   },
   url: {
    type: String, 
 }
})

module.exports = mongoose.model('Banner',bannerModel);