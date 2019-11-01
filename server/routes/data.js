var ObjectID = require('mongodb').ObjectID;


const express = require('express');
const dataRoutes = express.Router();

const Queue = require('../model/queue');
const Ticket = require('../model/ticket');
const Schedule = require('../model/schedule');
/**
 * @route POST api/data/schedule/
 * @dsec Save schedule
 * @access Public
 */

dataRoutes.route('/schedule').post(function(req, res) {
    Schedule.remove({}, () => {
        
        let schedule = new Schedule(req.body);
        schedule.save()
            .then(data => {                
                console.log('before jobschedule --------------------', jobSchedule);
                
                var stringTime = `* ${data.schedule} * * *`;
                console.log('schedule string----------------------', stringTime);

                jobSchedule.reschedule(stringTime, function(){
                    console.log('ticket numbers will reset to 000');
                    let date_ob = new Date();
                    // current hours
                    let hours = date_ob.getHours();

                    // current minutes
                    let minutes = date_ob.getMinutes();

                    // current seconds
                    let seconds = date_ob.getSeconds();
                    console.log("current time is : " + hours + ":" + minutes + ":" + seconds);
                    // reset all ticket number to 001
                    Queue.updateMany({}, { $set: { number: 1 } }, (err, res) => {
                        if(err){
                            console.log('err', err);
                        } else {
                            console.log('success', res, 'Ticket numbers are reset.');
                        }
                    });
                    // change all remaining ticket's status to removed.
                    Ticket.update({status:{$in:['noshow', 'called', 'pending', 'waiting', 'complete']}}, {status: 'removed', removedAt: new Date()}, {multi: true}, (err, res) => {
                        if(err){
                            console.log(err);
                        } else {
                            console.log('success in multi update', res);
                        }
                    });
                    // trigger all displays and keypads to reset all status.
                    req.io.sockets.emit('reset', 'reset');        
                });

                console.log('new jobschedule--------------+++++++++++++++++++', jobSchedule);
                res.status(200).json(data);
            })
            .catch(err => {
                res.status(400).send(err);
            });
    });
})

/**
 * @route GET api/data/schedule/
 * @dsec Get schedule
 * @access Public
 */
dataRoutes.route('/schedule').get(function(req, res){
    Schedule.find((err, data) => {
        if(err) {
            console.log(err);
            res.status(400).send(err);
        } else {
            res.json(data);
        }
    });
});
/**
 * @route GET api/data/queue/
 * @dsec Get all queue
 * @access Public
 */

dataRoutes.route('/queue').get(function(req, res){
    Queue.find((err, data) => {
        if(err) {
            console.log(err);
            res.status(400).send(err);
        } else {
            res.json(data);
        }
    });
});
 
/**
 * @route Post api/data/queue/
 * @desc Add queue
 * @access public
 */
dataRoutes.route('/queue').post((req,res) => {
    let queue = new Queue(req.body);
    queue.save()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

// Display routes
const Display = require('../model/display');

/**
 * @route GET api/data/display/
 * @dsec Get all display
 * @access Public
 */

dataRoutes.route('/display').get(function(req, res){
    Display.find((err, data) => {
        if(err) {
            console.log(err);
            res.status(400).send(err);
        } else {
            res.json(data);
        }
    });
});

/**
 * @route Post api/data/display/
 * @desc Add display
 * @access public
 */
dataRoutes.route('/display').post((req,res) => {
    let display = new Display(req.body);
    display.save()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(400).send(err);
        });
});
 
//Counter
const Counter = require('../model/counter');
/**
 * @route GET api/data/counter/
 * @dsec Get all counter
 * @access Public
 */

dataRoutes.route('/counter').get(function(req, res){
    Counter.find((err, data) => {
        if(err) {
            console.log(err);
            res.status(400).send(err);
        } else {
            res.json(data);
        }
    });
});

/**
 * @route Post api/data/counter/
 * @desc Add counter
 * @access public
 */
dataRoutes.route('/counter').post((req,res) => {
    let counter = new Counter(req.body);
    counter.save()
        .then(data => {
            res.status(200).json(data);
        })
        .catch(err => {
            res.status(400).send(err);
        });
});

dataRoutes.route('/counter/:id').get((req, res) =>{
    let id = req.params.id;
    Counter.findById(id, (err, data) => {
        if(err){
            console.log(err);
            res.status(400).send(err);
        } else {
            res.status(200).json(data);
        }
    });
});

dataRoutes.route('/analysis').post(async function(req,res){
    let {start, end} = req.body.datetime;
    let counterID = req.body.counterSelected._id;
    let queueID = req.body.queueSelected._id;
    let startTime = new Date(start);
    let endTime = new Date(end);

    var mCounters = await Counter.find().select('_id');
    var counters = mCounters.map(counter => {
        return counter._id;
    });

    var mQueues = await Queue.find().select('_id');
    var queues = mQueues.map(queue=>{
        return queue._id
    })
   
    let queueCond = [];
    if(queueID == 'total'){
        queueCond = queues;
    } else {
        queueCond.push(new ObjectID(queueID));
    }
    let counterCond = [];
    if(counterID == 'total'){
        counterCond = counters;
    } else {
        counterCond.push(new ObjectID(counterID));
    }
    
    
    var issuedTickets = await Ticket.aggregate([
        { $match: { 
            createdAt: { 
                $gte: startTime, $lte: endTime}
            },
        },
        { $count: "dataCount" },        
    ]);

    var calledTickets = await Ticket.aggregate([
        {
            $match : {
                createdAt: {
                    $gte: new Date(start), $lte: new Date(end)
                },
                calledAt: {
                    $ne: null
                },
                queue: {
                    $in: queueCond
                },
                counter: {
                    $in: counterCond
                }
            }
        },
        {
            $count: "dataCount"
        }
    ]);
    var completedTickets = await Ticket.aggregate([
        {
            $match : {
                createdAt: {
                    $gte: new Date(start), $lte: new Date(end)
                },
                completedAt: {
                    $ne: null
                },
                queue: {
                    $in: queueCond
                },
                counter: {
                    $in: counterCond
                }
            }
        },
        {
            $count: "dataCount"
        }
    ]);
    
    var waitTickets = await Ticket.aggregate([
        {
            $match : {
                createdAt: {
                    $gte: new Date(start), $lte: new Date(end)
                },
                waitingAt: {
                    $ne: null
                },
                queue: {
                    $in: queueCond
                },
                waitCounter: {
                    $in: counterCond
                }
            }
        },
        {
            $count: "dataCount"
        }
    ]);
    var noshowTickets = await Ticket.aggregate([
        {
            $match : {
                createdAt: {
                    $gte: new Date(start), $lte: new Date(end)
                },
                noshowAt: {
                    $ne: null
                },
                queue: {
                    $in: queueCond
                },
                noshowCounter: {
                    $in: counterCond
                }
            }
        },
        {
            $count: "dataCount"
        }
    ]);
    
    var calledTicketsInfo = await Ticket.aggregate([
        {
            $match : {
                createdAt: {
                    $gte: new Date(start), $lte: new Date(end)
                },
                calledAt: {
                    $ne: null
                },
                queue: {
                    $in: queueCond
                },
                counter: {
                    $in: counterCond
                }
            }
        }
    ]);

    var totalCallingTime = 0;
    var countCalling = 0;
    var timeIssuedToCall = null;
    calledTicketsInfo.map( ticket => {
        totalCallingTime += (ticket.calledAt - ticket.createdAt)/1000;
        countCalling++;
    });
   
    timeIssuedToCall = countCalling > 0 ? totalCallingTime / countCalling : timeIssuedToCall;
  
    var CompleteTicketsInfo = await Ticket.aggregate([
        {
            $match : {
                createdAt: {
                    $gte: new Date(start), $lte: new Date(end)
                },
                calledAt: {
                    $ne: null
                },
                completedAt: {
                    $ne: null
                },
                queue: {
                    $in: queueCond
                },
                counter: {
                    $in: counterCond
                }
            }
        }
    ]);

    var totalTimeCallToComplete = 0;
    var countComplete = 0;
    var timeCallToComplete = null;
    CompleteTicketsInfo.map( ticket => {
        totalTimeCallToComplete += (ticket.completedAt - ticket.calledAt)/1000;
        countComplete++;
    });
  
    timeCallToComplete = countComplete > 0 ? totalTimeCallToComplete / countComplete : timeCallToComplete;

    res.json({issuedTickets, calledTickets, completedTickets, waitTickets, noshowTickets, timeIssuedToCall, timeCallToComplete});
})

module.exports = dataRoutes;