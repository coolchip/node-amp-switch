'use strict';

const fs = require('fs');
const http = require('http');
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

let audioPlaying = undefined; 
let turnoffTimer = null;
const main = function () {
	getAudioPlayingState( (err, state) => {
		if (err) {
			return console.log(err);
		}

		if (audioPlaying !== state) {
			audioPlaying = state;
            if (state === 1) {
                clearTimeout(turnoffTimer);
				switchAmpPower(state, (err, res) => {
                    if (err) {
						return console.log(err);
					}
					console.log('sucessfully turned on the amplifier');
				});
			} else {
				turnoffTimer = setTimeout( () => {
					switchAmpPower(state, (err, res) => {
						if (err) {
							console.log(res);
						}
						console.log('sucessfully turned off the amplifier');
					});
				}, 10000);
			}
		}
	});
};

setInterval(main, 2000);
console.log('started amp-switch service');

