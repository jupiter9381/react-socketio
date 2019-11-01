const express = require('express');
const kioskRoutes = express.Router();

// Load models
const Queue = require('../model/queue');
const Ticket = require('../model/ticket');


// @route GET api/applies/
// @dsec Get Apply List
// @access Public
kioskRoutes.route('/').get(function(req, res){
   console.log('kioskRoute');
   res.send('this is kiosk routes');
});

kioskRoutes.route('/:id/createTicket').post(function(req, res){
    let queueId = req.params.id;
    let printingJobId = req.body.printingJobId;
    Queue.findById(queueId, (err, queue)=> {
        if(err){
            console.log(err);
            res.status(400).send(err);
        } else {            
            let number = queue.number;
            if(number == 999){ // ticket number will be reset to 0 when the number is over 99
                queue.number = 1;
            } else {
                queue.number = queue.number + 1;
            }
            
            // save ticket to the db
            var ticket = new Ticket({
                number: number,
                queue: queueId,
                status: 'pending',
                createdAt: new Date()
            });
            ticket.save()
                .then(result => {
                    let rticket = {
                        _id: result._id,
                        queue: queue,
                        number: result.number,
                        status: result.status,
                        createdAt: result.createdAt,
                        printingJobId: printingJobId
                    };
                    getPendingTickets(req.io);
                    queue.save() // when a new ticket is created, ticket number should be saved.
                        .then(result => {
                            gPendingTickets.push(rticket);
                            req.io.sockets.emit('newTicket', rticket);        
                            res.status(200).json(rticket);
                        })
                        .catch(error => {
                            console.log('DB store throw error', error);
                            res.status(400).send(error);
                        });
                    
                })
                .catch(error => {
                    console.log('DB store throw error', error);
                    res.status(400).send(error);
                });             
        }
    });
    
});
const getPendingTickets = function(io){
    console.log('get pending tickets function');
    // var q = Ticket.find({'status' : 'pending'}).sort({'createdAt': -1}).limit(5);
    // q.exec(function(err, tickets){
    //     if(err){
    //         console.log('error', err);
    //     } else {
    //         console.log('the result of the pending tickets.');
    //         console.log(tickets);
    //     }
    // });

    Ticket.aggregate([
        { $match: { status: "pending" } },
        { $sort: { createdAt: 1 }},
        { $group: { 
                _id: "$queue", 
                tickets: {$push: "$$ROOT"}
            }
        },        
        { $project: {
            "tickets": { "$slice": [ "$tickets", 5 ] }
        }}
    ], (err, result) => {
        if(err){
            console.log(err);
        } else {
            console.log('aggregate', result);
            io.sockets.emit('pendingTickets', result);
        }
    });

};
module.exports = kioskRoutes;