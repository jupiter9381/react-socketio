const mongoose = require('mongoose');
const Schema = mongoose.Schema;
/**
 * @number Type Number
 * @queueId Type ObjectId
 */
let ticketSchema = new Schema({
    number: {
        type: Number
    },
    queue: {
        type: Schema.Types.ObjectId,
        ref: "Queue"
    },
    status: {
        type: String
    },
    counter: {
        type: Schema.Types.ObjectId,
        ref: "Counter"
    },
    noshowCounter: {
        type: Schema.Types.ObjectId,
        ref: "Counter"
    },
    waitCounter: {
        type: Schema.Types.ObjectId,
        ref: "Counter"
    },
    calledAt: {
        type: Date
    },
    completedAt:{
        type: Date
    },
    noshowAt:{
        type: Date
    },
    waitingAt:{
        type: Date
    },
    createdAt:{
        type: Date, default: Date.now
    },
    removedAt: {
        type: Date
    }
});

module.exports = mongoose.model('Ticket', ticketSchema);