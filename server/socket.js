const Counter = require ('./model/counter');
const Ticket = require('./model/ticket');
const Queue = require('./model/queue');

module.exports = function(io){
    io.on('connection', function(socket) {
        // socket.emit('refresh', 'true');


        socket.on('connectCounter', (data) => {
            socket.id = data.id;
            gCounters[Number(data.name)-1].status = true;
            Counter.findById(data.id, function(err, counter){
                if(!counter){
                    console.log('error cannot find the data in the db');
                } else {
                    counter.status = true;
                    counter.save()
                        .then(uCounter => {
                            socket.broadcast.emit('counterChange', gCounters);
                        })
                        .catch(err => {
                            console.log('Update not possible');
                        });
                }
            });

        });

        socket.on('connectTV', (data) => {
            console.log('TV connected');
        });

        socket.on('callTicket', (data)=>{
            let ticketId = data.ticket._id;
            let counterId = data.counter._id;

            Ticket.findById(ticketId, (err, result) => {
                if(err){
                    console.log(err);
                } else {
                    if(result.status == 'called'){
                        return;
                    }
                    switch(data.type){
                        case 'pending': // assign ticket to the given counter, sound output in tv
                        case 'noshow':
                        case 'complete':
                        case 'waiting':
                            result.counter = counterId;
                            result.calledAt = new Date();
                            result.status = "called";
                            result.save()
                                .then(uTicket => {
                                    Ticket.findById(uTicket._id)
                                        .populate('queue')
                                        .populate('counter')
                                        .exec((err, ticket) => {
                                            if(err){
                                                console.log(err);
                                            } else {
                                                if(data.type == 'pending'){
                                                    socket.broadcast.emit('callTicketo', ticket);
                                                    socket.emit('callTickets', ticket);
                                                    // coming tickets find
                                                    getPendingTickets(socket);
                                                } else if(data.type =='noshow') {
                                                    socket.broadcast.emit('noshow_to_called_o', ticket);
                                                    socket.emit('cut_noshowTickets', ticket);
                                                } else if(data.type =='waiting') {
                                                    socket.broadcast.emit('waiting_to_called_o', ticket);
                                                    socket.emit('cut_waitingTickets', ticket);
                                                } else {
                                                    socket.broadcast.emit('complete_to_called_o', ticket);
                                                    socket.emit('complete_to_called', ticket);

                                                    // called->complete
                                                    getCompletedTickets(socket);
                                                }
                                            }
                                        });
                                })
                                .catch(err => {
                                    console.log('Ticket Update not possible', err);
                                });
                            break;
                        case 'called': // sound output in tv
                            socket.broadcast.emit('called_to_called_o', data.ticket);

                            break;
                        default:
                            console.log('callTicket socket type is default');
                    }
                }
            })
        });

        socket.on('completeTicket', (data) => {
            let ticketId = data.ticket._id;
            let counterId = data.counter._id;
            let prevTicketStatus = data.ticket.status;
            Ticket.findById(ticketId, (err, result) => {
                if(err){
                    console.log(err);
                } else {
                    result.counter = counterId;
                    result.completedAt = new Date();
                    result.status = "complete";
                    result.save()
                        .then(uTicket => {
                            Ticket.findById(uTicket._id)
                                .populate('queue')
                                .populate('counter')
                                .exec((err, ticket) => {
                                    if(err){
                                        console.log(err);
                                    } else {
                                        socket.broadcast.emit('completeTicketo', {ticket:ticket, type:prevTicketStatus});
                                        socket.emit('completeTickets', {ticket:ticket, type:prevTicketStatus});

                                        if(prevTicketStatus == 'pending'){
                                            getPendingTickets(socket);
                                        }
                                        getCompletedTickets(socket);
                                    }
                                });
                        })
                        .catch(err => {
                            console.log('Ticket Update not possible', err);
                        });
                }
            });
        });

        // tickets -> noshow
        socket.on('noshowTicket', (data) => {
            let ticketId = data.ticket._id;
            let counterId = data.counter._id;
            Ticket.findById(ticketId, (err, result) => {
                if(err){
                    console.log(err);
                } else {
                    result.noshowCounter = counterId;
                    result.noshowAt = new Date();
                    result.status = "noshow";
                    result.save()
                        .then(uTicket => {
                            Ticket.findById(uTicket._id)
                                .populate('queue')
                                .populate('counter')
                                .exec((err, ticket) => {
                                    if(err){
                                        console.log(err);
                                    } else {
                                        socket.broadcast.emit('called_to_noshow_o', ticket);
                                        console.log('noshow tickets', ticket);
                                        socket.emit('noshowTickets', ticket);
                                    }
                                });
                        })
                        .catch(err => {
                            console.log('Ticket Update not possible', err);
                        });
                }
            });
        });

        // tickets -> waiting
        socket.on('waitingTicket', (data) => {
            let ticketId = data.ticket._id;
            let counterId = data.counter._id;
            Ticket.findById(ticketId, (err, result) => {
                if(err){
                    console.log(err);
                } else {
                    result.waitCounter = counterId;
                    result.waitingAt = new Date();
                    result.status = "waiting";
                    result.save()
                        .then(uTicket => {
                            Ticket.findById(uTicket._id)
                                .populate('queue')
                                .populate('counter')
                                .exec((err, ticket) => {
                                    if(err){
                                        console.log(err);
                                    } else {
                                        socket.broadcast.emit('called_to_waiting_o', ticket);
                                        console.log('waiting tickets', ticket);
                                        socket.emit('waitingTickets', ticket);
                                    }
                                });
                        })
                        .catch(err => {
                            console.log('Ticket Update not possible', err);
                        });
                }
            });
        });

        socket.on('remove_noshowTickets', ticketIds => {
            let criteria = {
                _id: {$in: ticketIds}
            };
            Ticket.update(criteria, {status: 'removed', removedAt: new Date()}, {multi: true}, (err, res) => {
                if(err){
                    console.log(err);
                } else {
                    console.log('success in multi update');
                }
            });
            socket.emit('remove_noshowTicket_s', ticketIds);
            socket.broadcast.emit('remove_noshowTicket_o', ticketIds);
        });

        socket.on('callNext', counter => {
            socket.broadcast.emit('callNext', counter);
        });

        socket.on('refresh_counter', counter => {
            socket.broadcast.emit('refresh_counter', counter);
        });

        socket.on('deviceDisconnect', (data) => {
            switch(data.type){
                // case 'counter':
                //     // console.log(`counter ${data.id} is disconnected`);
                //     gCounters[Number(data.name)-1].status = false;
                //     Counter.findById(data.id, function(err, counter){
                //         if(!counter){
                //             console.log('error cannot find the data in the db');
                //         } else {
                //             counter.status = false;
                //             counter.save()
                //                 .then(counter => {
                //                     socket.broadcast.emit('counterChange', gCounters);
                //                 })
                //                 .catch(err => {
                //                     console.log('Update not possible');
                //                 });
                //         }

                //     });
                //     console.log(gCounters);
                //     break;
                case 'keypad':
                    console.log(`keypad is disconnected`);
                    break;
                case 'landscape':
                    console.log(`TV is disconnected`);
                    break;
                case 'kiosk':
                    console.log(`Kiosk is disconnected`);
                    break;
                default:
                    console.log('Something is disconnected');
            }
        });

        socket.on('disconnect', () => {

            // check disconnected socket was from the counter.
            gCounters.map((item,key) => {
                if(item._id == socket.id){
                    item.status = false;
                    Counter.findById(socket.id, function(err, counter){
                        if(!counter){
                            console.log('error cannot find the data in the db');
                        } else {
                            counter.status = false;
                            counter.save()
                                .then(counter => {
                                    socket.broadcast.emit('counterChange', gCounters);
                                    let ntime = new Date();
                                    console.log('counter disconnected', gCounters, ntime);
                                })
                                .catch(err => {
                                    console.log('Update not possible');
                                });
                        }
                    });
                }
            })
        });

        socket.on('resetAll',()=>{
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
                io.sockets.emit('reset', 'reset');
                console.log("Rest called");
              });




    });
}

const getPendingTickets = function(socket){
    console.log('get pending tickets function');
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
            socket.broadcast.emit('pendingTickets', result);
        }
    });

};
const getCompletedTickets = function(socket){
    console.log('get completed tickets function');
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
            socket.broadcast.emit('completeTicketToLandscape', result);
        }
    });

};
