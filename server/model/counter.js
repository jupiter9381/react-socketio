const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let counterSchema = new Schema({
    name: {
        type: String
    },
    status: {
        type: Boolean
    },
    createdAt: { type: Date, default: Date.now }    
});

module.exports = mongoose.model('Counter', counterSchema);