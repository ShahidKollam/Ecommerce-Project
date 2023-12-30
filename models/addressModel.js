const mongoose = require('mongoose')

const addressSchema = new mongoose.Schema({
 
    user_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
      },

    name: {
        type: String,
        required: true
    },

    house: {
        type: String,
         required: true
    },
    
    street: {
        type: String,
         required: true
    },

    pin: {
        type: String,
        required: true
    },

    city: {
        type: String,
        required: true
    },

    state: {
        type: String,
        required: true
    },

    is_default: {
        type: Boolean,
        required: false
    }
})

module.exports = mongoose.model('Address', addressSchema)