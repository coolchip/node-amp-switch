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
	    return console.log(state);

		http.get({
   		    host: 'http://raspibox.fritz.box:1880',
       		path: '/rcswitch?device=D&status=' + state.toString()
	    }, function(response) {
   		    // Continuously update stream with data
       		var body = '';
        	response.on('data', function(d) {
    	        body += d;
   	    	});
    	    response.on('end', function() {
   	    	    // Data reception is done, do whatever with it!
       	    	console.log('response: ' + body);
	        });
   		});
	});
};

setInterval(main, 2000);
