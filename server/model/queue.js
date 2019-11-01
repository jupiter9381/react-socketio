const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let QueueSchema = new Schema({
    name: {
        zhTW: {
            type: String
        },
        en: {
            type: String
        }        
    },
    status: {
        type: String
    },
    code: {
        type: String
    },
    order:{
        type: Number
    },
    number: {
        type: Number
    },
    updatedAt: {
        type: Date
    },
    createdAt:{
        type: Date,
        default: Date.now
    }
});

module.exports = mongoose.model('Queue', QueueSchema);