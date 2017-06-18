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
    	let state = 1;
	    if (data.includes('closed')) {
        	state = 0;
	    } 
        return callback (null, state);
	});
};

const switchAmpPower = function (state, callback) {
    try {
		http.get('http://raspibox.fritz.box:1880/rcswitch?device=D&status=' + state.toString(), (res) => {
			if (typeof(callback) !== 'undefined') {
				return callback(null, res.statusCode);
			}
		})
        .on('error', function(e) {
			return callback(e);
		});
	} catch (e) {
		return callback(e);
	}
};

let audioPlaying = 0;
const main = function () {
	getAudioPlayingState( (err, state) => {
		if (err) {
			return console.log(err);
		}
	    //console.log(state);

		if (audioPlaying !== state) {
            if (state === 1) {
				switchAmpPower(state, (err, res) => {
					console.log(res);
				});
			} else {
				setTimeout( () => {
					switchAmpPower(state, (err, res) => {
						console.log(res);
					});
				}, 10000);
			}
			audioPlaying = state;
		}
	});
};

setInterval(main, 2000);

