const mongoose = require('mongoose');
const Schema = mongoose.Schema;

let scheduleSchema = new Schema({
    schedule: {
        type: String
    },
    createdAt: { type: Date, default: Date.now }    
});

module.exports = mongoose.model('Schedule', scheduleSchema);