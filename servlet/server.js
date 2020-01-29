/*
	Produced 2020
	By https://amattu.com/links/github
	Copy Alec M.
	License GNU Affero General Public License v3.0
*/

'use strict';

// Variables
const WebSocket = require('./assets/ws/lib/websocket-server.js');
const rng = require('./assets/uuid/lib/rng');
const bytesToUuid = require('./assets/uuid/lib/bytesToUuid');
const server = new WebSocket({port: 8080});
let clients = [];

// Events
server.on("connection", function(client, request) {
	// Variables
	let uuid = _generateUUID();
	let index = clients.push(client) - 1;
	client.uuid = uuid

	// Events
	client.on('close', function(d) {
		clients[index] = {};
	});
	client.on('message', function(d) {
		// Variables
		let parsed = _parse(d);

		// Checks
		if (!parsed || typeof(parsed) !== "object") { return false }
		if (!parsed.function || typeof(parsed.function) !== "string") { return false }

		// Navigator
		switch(parsed.function) {
			// let users know we are here
			case "broadcast":
				// Variables
				var result = 0;

				// Loops
				clients.forEach(function(c) {
					// Checks
					if (!c.uuid || c.uuid === client.uuid) { return false }

					// Broadcast New Client
					c.send(JSON.stringify({event: "new", data: {uuid: client.uuid}}));
					result++;
				});

				// Return
				//client.send(JSON.stringify({status: 1, data: {users: result, uuid: client.uuid}}));
				break;
			// users respond to "new" event
			case "initiate":
				// Variables
				var result = 0;

				// Loops
				clients.forEach(function(c) {
					// Checks
					if (!c.uuid || c.uuid !== parsed.uuid) { return false }

					// Respond
					c.send(JSON.stringify({event: "initiated", data: {offer: parsed.offer, uuid: client.uuid}}));
					result = 1;
				});

				// Return
				//client.send(JSON.stringify({status: 1, data: result}));
				break;
			case "respond":
				// Variables
				var result = 0;

				// Loops
				clients.forEach(function(c) {
					// Checks
					if (!c.uuid || c.uuid !== parsed.uuid) { return false }

					// Respond
					c.send(JSON.stringify({event: "responded", data: {offer: parsed.offer, uuid: client.uuid}}));
					result = 1;
				});

				// Return
				client.send(JSON.stringify({status: 1, data: result}));
				break;
			default:
				break;
		}
	});
});

// Parse Data
function _parse(d) {
	try {
		d = JSON.parse(d);
	} catch(e) { d = ""; }

	return d;
}

// Generate UUID
function _generateUUID(options, buf, offset) {
	var i = buf && offset || 0;

	if (typeof(options) == 'string') {
	buf = options === 'binary' ? new Array(16) : null;
	options = null;
	}
	options = options || {};

	var rnds = options.random || (options.rng || rng)();

	// Per 4.4, set bits for version and `clock_seq_hi_and_reserved`
	rnds[6] = (rnds[6] & 0x0f) | 0x40;
	rnds[8] = (rnds[8] & 0x3f) | 0x80;

	// Copy bytes to buffer, if provided
	if (buf) {
		for (var ii = 0; ii < 16; ++ii) {
			buf[i + ii] = rnds[ii];
		}
	}

	return buf || bytesToUuid(rnds);
}
