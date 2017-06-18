'use strict';

const http = require('http');
const fs = require('fs');
const path = require('path');

const filePath = path.join('/proc', 'asound', 'card0', 'pcm0p', 'sub0', 'status');

const getAudioPlayingState = function (callback) {
	fs.readFile(filePath, {encoding: 'utf-8'}, function(err,data) {
    	if (err) {
        	return callback(err);
	    }
    	let state = '1';
	    if (data.includes('closed')) {
        	state = '0';
	    } 
        return callback (null, state);
	});
};

const main = function () {
	getAudioPlayingState( (err, state) => {
		if (err) {
			return console.log(err);
		}
	    //console.log(state);

		http.get(`http://raspibox.fritz.box:1880/rcswitch?device=D&status=${state}`, (response) => {
       		var body = '';
        	response.on('data', function(d) {
    	        body += d;
   	    	});
    	    response.on('end', function() {
       	    	console.log('response: ' + body);
	        });
   		});
	});
};

setInterval(main, 2000);
