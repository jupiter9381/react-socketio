const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
const schedule = require('node-schedule');
const app = express();
const Ticket = require('./model/ticket');
const Queue = require('./model/queue');
const Counter = require ('./model/counter');
const Schedule = require ('./model/schedule');
global.gPendingTickets = [];
global.gCounters = [];
global.jobSchedule = null;
var tt = 10;
var server = require('http').createServer(app);
var io = require('socket.io')(server);

var socket = require('./socket')(io);

app.use(cors());
app.use(bodyParser.urlencoded({
    extended: false
}));
app.use(bodyParser.json());

// Routes
const keypadRoute = require('./routes/keypad');
const kioskRoute = require('./routes/kiosk');
const dataRoute = require('./routes/data');
const ticketRoute = require('./routes/ticket');
// DB
const db = require('./config/db.config').mongoURI;

mongoose.connect(db, {useNewUrlParser: true})
        .then(() => {
            console.log('MongoDB connected successfully');
            Counter.find((err, res) => {
                if(err){
                    console.log(err);
                } else {

                    res.map((item,key)=>{
                        gCounters[key] = {status:item.status, _id:item._id, name:item.name};

                    });
                    console.log('gCounters',gCounters);
                }
            });
        })
        .catch(err => console.log(err));

// Make io accessible to our router
app.use(function(req,res,next){
    req.io = io;
    next();
});

app.use('/api/kiosk', kioskRoute);
app.use('/api/keypad', keypadRoute);
app.use('/api/data', dataRoute);
app.use('/api/ticket', ticketRoute);

const port = process.env.PORT || 8080;
var schedule_time;
server.listen(port, () => {
    console.log(`Server up and running on port ${port} !`);
    setTimeout(()=>{
        io.sockets.emit('serverstart', 'server is start');
    }, 1000);
    
});

setTimeout(function(){
    console.log('inside timeout')
    Schedule.find((err, data) => {
        if(err) {
            console.log(err);
            res.status(400).send(err);
        } else {
            schedule_time = data[0]['schedule'];
            var stringTime = `* ${schedule_time} * * * `;
            jobSchedule = schedule.scheduleJob(stringTime, function(){
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
                io.sockets.emit('reset', 'reset');
            
            });
            console.log(schedule_time);
        }
    });
    console.log('back of schedule find')
}, 1500);


var k = schedule.scheduleJob('0 * * * * *', ()=>{
    console.log('socket will send the signal every one minute', new Date());
    io.sockets.emit('ping', new Date());
})