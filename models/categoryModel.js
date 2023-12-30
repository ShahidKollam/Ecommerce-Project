const mongoose=require('mongoose');


const categorySchema = new mongoose.Schema({
    name:{
        type:String,
        unique:true,
        required:true
    },
        
    CatOffer: {
        type: Number,
        default: 0
    },

    is_blocked:{
        type: Boolean,
        default:false
    },
    
    is_deleted: {
        type: Boolean,
        default: false
    }
})

module.exports=mongoose.model('Category',categorySchema);