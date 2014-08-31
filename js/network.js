define(function(require) {
	'use strict';

	var enums = require('enums'),
		pubsub = require('pubsub'),
		server_url = null,
		version = null,
		socket = null;

	function initializeServerUrlData() {
		var result = /^http(s?):\/\/([^\/]+)\//.exec(window.location.href);

		if (result !== null) {
			server_url = 'http' + result[1] + '://' + result[2];
		} else {
			server_url = 'http://127.0.0.1:9000';
		}

		version = $('#page-login').attr('data-version');
	}

	function getServerUrl() {
		return server_url;
	}

	function connect(username, password) {
		if (socket === null) {
			socket = io(server_url + '?version=' + encodeURIComponent(version) + '&username=' + encodeURIComponent(username) + '&password=' + encodeURIComponent(password), {
				forceNew: true,
				reconnection: false
			});

			socket.on('disconnect', function() {
				socket = null;
				pubsub.publish(enums.PubSub.Network_Disconnect);
			});

			socket.on('x', function(data) {
				var data_length, i;

				data = JSON.parse(data);
				data_length = data.length;
				for (i = 0; i < data_length; i++) {
					pubsub.publish.apply(null, data[i]);
				}

				pubsub.publish(enums.PubSub.Network_MessageProcessingComplete);
			});
		}
	}

	function sendMessage() {
		if (socket !== null) {
			socket.emit('x', JSON.stringify(Array.prototype.slice.call(arguments, 0)));
		}
	}

	function onInitializationComplete() {
		initializeServerUrlData();
	}

	pubsub.subscribe(enums.PubSub.Client_InitializationComplete, onInitializationComplete);

	return {
		getServerUrl: getServerUrl,
		connect: connect,
		sendMessage: sendMessage
	};
});
