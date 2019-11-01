const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let ads = new Schema({
    row: {type: Number},
    column: {type: Number}
});
let displaySchema = new Schema({
    name: {
        type: String
    },
    theme: {
        type: String
    },
    advPositions: {
        type: String
    },    
    bottomText: {type: String},
    callingVolume: {type: Number, default: 100},
    createdAt: { type: Date, default: Date.now }
    
});

module.exports = mongoose.model('Display', displaySchema);