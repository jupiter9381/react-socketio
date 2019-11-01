const express = require('express');
const keypadRoutes = express.Router();

// Load Apply model
// const Apply = require('../../model/Apply');

keypadRoutes.route('/').get(function(req, res){
    console.log('keypadROute');
    res.send('this is keypad route');
});

module.exports = keypadRoutes;