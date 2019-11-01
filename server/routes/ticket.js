const express = require('express');
const ticketRoutes = express.Router();
const _= require('lodash');
const Ticket = require('../model/ticket');

// Load Apply model
// const Apply = require('../../model/Apply');

ticketRoutes.route('/').get(function(req, res){
    Ticket.find((err, result) => {
        if(err){
            console.log(err);
            res.status(400).send(err);
        } else {
            res.status(200).json(result);
        }
    });
});
ticketRoutes.route('/pending').get(function(req, res){    
    Ticket.find({status:'pending'}).populate('queue').exec((err, result) => {
        if(err){
            console.log(err);
            res.status(400).send(err);
        } else {
            res.status(200).json(result);
        }
    });   
});

ticketRoutes.route('/called').get(function(req, res){
    // var start = new Date();
    // start.setHours(0,0,0,0);
    // var end = new Date();
    // end.setHours(0,0,0,0);
    // console.log('called ::::::: ', start);
    // Ticket.find({status: 'called', createdAt: {$gte: start, $lt: end}})
    Ticket.find({status: 'called'})
        .populate('queue').populate('counter').exec((err, result) => {
        if(err){
            res.status(400).send(err);
        } else {
            res.status(200).json(result);
        }
    });   
});
// ticketRoutes.route('/keypad').post(function(req, res){
//     var counterID = req.body.counterID;
//     Ticket.find({status: {$in :['called', 'noshow']}, counter: counterID})  
//         .populate('queue').populate('counter').exec((err, result) => {
//         if(err){
//             res.status(400).send(err);
//         } else {
//             res.status(200).json(result);
//         }
//     });   
// });
ticketRoutes.route('/noshow').post(function(req, res){
    Ticket.find({status: 'noshow'})  
        .populate('queue').populate('counter').exec((err, result) => {
        if(err){
            res.status(400).send(err);
        } else {
            res.status(200).json(result);
        }
    });   
});
ticketRoutes.route('/waiting').post(function(req, res){
    Ticket.find({status: 'waiting'})  
        .populate('queue').populate('counter').exec((err, result) => {
        if(err){
            res.status(400).send(err);
        } else {
            res.status(200).json(result);
        }
    });   
});
ticketRoutes.route('/calledbykeypad').post(function(req, res){
    var counterID = req.body.counterID;
    Ticket.find({status: 'called', counter: counterID})
        .populate('queue').populate('counter').exec((err, result) => {
        if(err){
            res.status(400).send(err);
        } else {
            res.status(200).json(result);
        }
    });   
});
ticketRoutes.route('/comingTickets').get(function(req, res){
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
            res.status(200).json(result);
        }
    });
});

ticketRoutes.route('/completedTickets').get(function(req, res){
    Ticket.aggregate([
        { $match: { status: "complete" } },
        { $sort: { completedAt: -1 }},
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
            res.status(200).json(result);
        }
    });
});

module.exports = ticketRoutes;