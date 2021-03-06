define(function(require) {
	'use strict';

	var common_data = require('common_data'),
		enums = require('enums'),
		pubsub = require('pubsub'),
		enable_page_title_notifications = null,
		enable_sound_notifications = null,
		sound = null,
		title = '',
		interval = null,
		showing_title_prefix = false,
		current_notification_id = null,
		notification_id_to_message = {};

	function setOption(option_id, value) {
		if (option_id === enums.Options.EnablePageTitleNotifications) {
			enable_page_title_notifications = value;
			if (!value) {
				turnOff();
			}
		} else if (option_id === enums.Options.EnableSoundNotifications) {
			enable_sound_notifications = value;
		} else if (option_id === enums.Options.Sound) {
			sound = value;
		}
	}

	function intervalCallback() {
		showing_title_prefix = !showing_title_prefix;
		document.title = (showing_title_prefix ? '!!! ' + notification_id_to_message[current_notification_id] + ' !!! ' : '') + title;
	}

	function turnOn(notification_id) {
		var beep;

		if (enable_page_title_notifications) {
			turnOff();

			current_notification_id = notification_id;

			interval = setInterval(intervalCallback, 500);
			intervalCallback();
		}

		if (enable_sound_notifications) {
			beep = document.getElementById(sound);
			if (typeof beep.readyState === 'number' && beep.readyState > 0) {
				beep.pause();
				beep.currentTime = 0;
				beep.play();
			}
		}
	}

	function turnOff() {
		if (interval !== null) {
			clearInterval(interval);
			interval = null;
			showing_title_prefix = false;
			document.title = title;

			current_notification_id = null;
		}
	}

	function onClientSetClientData() {
		title = 'Acquire - ' + common_data.client_id_to_data[common_data.client_id].username;
		showing_title_prefix = !showing_title_prefix;
		intervalCallback();
	}

	function resetTitle() {
		title = 'Acquire';
		showing_title_prefix = !showing_title_prefix;
		intervalCallback();
	}

	function onInitializationComplete() {
		notification_id_to_message[enums.Notifications.GameFull] = 'GAME FULL';
		notification_id_to_message[enums.Notifications.GameStarted] = 'GAME STARTED';
		notification_id_to_message[enums.Notifications.YourTurn] = 'YOUR TURN';
		notification_id_to_message[enums.Notifications.GameOver] = 'GAME OVER';
	}

	pubsub.subscribe(enums.PubSub.Client_SetOption, setOption);
	pubsub.subscribe(enums.PubSub.Client_SetClientData, onClientSetClientData);
	pubsub.subscribe(enums.PubSub.Network_Disconnect, resetTitle);
	pubsub.subscribe(enums.PubSub.Client_InitializationComplete, onInitializationComplete);

	return {
		turnOn: turnOn,
		turnOff: turnOff
	};
});
