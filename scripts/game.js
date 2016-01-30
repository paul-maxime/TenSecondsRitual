/*
 * Ten Seconds Ritual
 */

Game = {
	timer: 0,
	timerId: null,
	now: 0,
	level: null,
	levels: null,
	music: null,
	sounds: {
		clock: [],
		fail: []
	},
	musicEnabled: true,
	soundEnabled: true,
};

Game.initialize = function () {
	Game.initializeLevels();
	Game.startLevel();
	Game.music = new Audio('assets/musics/FuturisticCityMusic-SteamCity.ogg');
	Game.music.loop = true;
	Game.music.volume = 0.25;
	Game.music.play();
	for (var i = 0; i < 8; ++i) {
		Game.sounds.clock.push(new Audio('assets/sounds/tone1.ogg'));
	}
	for (var i = 0; i < 3; ++i) {
		Game.sounds.fail.push(new Audio('assets/sounds/zap2.ogg'));
	}

	$('#options-music').click(Game.toggleMusic);
	$('#options-sound').click(Game.toggleSound);
};

Game.playSound = function (sound) {
	if (!Game.soundEnabled) {
		return;
	}
	for (var i = 0; i < Game.sounds[sound].length; ++i) {
		if (Game.sounds[sound][i].paused) {
			Game.sounds[sound][i].play();
			break;
		}
	}
};

Game.toggleMusic = function () {
	Game.musicEnabled = !Game.musicEnabled;
	if (Game.musicEnabled) {
		Game.music.play();
	} else {
		Game.music.pause();
	}
	$('#options-music').text('Music: ' + (Game.musicEnabled ? 'Enabled' : 'OFF'));
};

Game.toggleSound = function () {
	Game.soundEnabled = !Game.soundEnabled;
	$('#options-sound').text('Sound: ' + (Game.soundEnabled ? 'Enabled' : 'OFF'));
};

Game.initializeLevels = function () {
	Game.levels = [
		new Game.ButtonLevel()
	];
};

Game.startLevel = function () {
	Game.setTimer(12000);
	Game.now = Date.now();
	Game.level = Game.levels[0];
	Game.level.start(Game.successLevel, Game.failLevel);
	Game.timerId = setInterval(function () {
		var oldTimer = Game.timer;
		var now = Date.now();
		var delta = now - Game.now;
		Game.now = now;
		var timer = Game.timer - delta;
		if (timer <= 0) {
			Game.failLevel();
		} else {
			Game.setTimer(timer);
			if (Game.timer <= 2000) {
				if (Math.floor(oldTimer / 500) !== Math.floor(timer / 500)) {
					Game.playSound('clock');
				}
			} else if (Game.timer <= 5000) {
				if (Math.floor(oldTimer / 1000) !== Math.floor(timer / 1000)) {
					Game.playSound('clock');
				}
			}
		}
	}, 70);
};

Game.successLevel = function () {
	clearInterval(Game.timerId);
	Game.level.clear();
	Game.startLevel();
};

Game.failLevel = function () {
	Game.playSound('fail');
	clearInterval(Game.timerId);
	Game.level.clear();
	Game.setTimer(0); 
	Game.music.pause();
	$('#game-timer').removeClass('game-timer-alert');
	$('#game-level-instructions').text('Game over! The entire solar system exploded.');
};

Game.setTimer = function (value) {
	Game.timer = value;
	var seconds = Math.floor(value / 1000) + '';
	var milliseconds = Math.floor((value / 10) % 100) + '';
	if (seconds.length < 2) {
		seconds = '0' + seconds;
	}
	if (milliseconds.length < 2) {
		milliseconds = '0' + milliseconds;
	}
	var text = seconds + ':' + milliseconds;
	$('#game-timer').text(text);
	if (Game.timer < 5000) {
		$('#game-timer').addClass('game-timer-warning');
	} else {
		$('#game-timer').removeClass('game-timer-warning');
	}
	if (Game.timer < 2000) {
		$('#game-timer').addClass('game-timer-alert');
	} else {
		$('#game-timer').removeClass('game-timer-alert');
	}
};

Game.createLevelContainer = function (name) {
	return $('<div>')
		.attr('id', 'game-level-' + name)
		.appendTo($('#game-level'));
}

Game.ButtonLevel = function () {
	this.uiLevel = Game.createLevelContainer('buttons');
};

Game.ButtonLevel.COLORS = [
	'Black',
	'Blue',
	'Green',
	'Grey',
	'Orange',
	'Pink',
	'Red',
	'Yellow'
];

Game.ButtonLevel.SHAPES = [
	1, 7, 9, 10, 11, 12
];

Game.ButtonLevel.SHAPE_NAMES = {
	1: 'Square',
	7: 'Triangle',
	9: 'Star',
	10: 'Diamond',
	11: 'Circle',
	12: 'Heart'
};

Game.ButtonLevel.MESSAGES = [
	'Push the [button] now!',
	'I think you should push the [button].',
	'The [button] must be pushed.',
	'Do not waste time reading long instructions and push the [button]!',
	'[button], maybe.'
]

Game.ButtonLevel.prototype.start = function (onSuccess, onFailure) {
	this.onSuccess = onSuccess;
	this.onFailure = onFailure;
	this.colors = Game.ButtonLevel.COLORS.slice();
	this.shapes = Game.ButtonLevel.SHAPES.slice();
	this.uiButtons = [];
	for (var i = 0; i < Math.floor(Math.random() * 4) + 3; ++i) {
		var button = this.pickRandomButton();
		this.uiButtons.push($('<img>')
			.attr('src', 'assets/images/shapes/tile'+button.color+'_'+(button.shape<10?'0':'')+button.shape+'.png')
			.addClass('game-image-button')
			.data('button', button)
			.appendTo(this.uiLevel)
		);
	};
	this.validButton = this.uiButtons[Math.floor(Math.random() * this.uiButtons.length)];
	for (var i = 0; i < this.uiButtons.length; ++i) {
		if (this.validButton === this.uiButtons[i]) {
			this.uiButtons[i].click(onSuccess);
		} else {
			this.uiButtons[i].click(onFailure);			
		}
	}
	var instructionText = Game.ButtonLevel.MESSAGES[Math.floor(Math.random() * Game.ButtonLevel.MESSAGES.length)];
	var buttonText = '';
	if (Math.floor(Math.random() * 2) === 0) {
		buttonText = '<b>' + this.validButton.data('button').name + '</b>';
	} else {
		buttonText = '<b>' + this.validButton.data('button').color + '</b> button';
	}
	$('#game-level-instructions').html(instructionText.replace('[button]', buttonText));
};

Game.ButtonLevel.prototype.pickRandomButton = function () {
	var color = this.pickRandomColor();
	var shape = this.pickRandomShape();
	var name = Game.ButtonLevel.SHAPE_NAMES[shape];
	return {
		color: color,
		shape: shape,
		name: name
	}
};

Game.ButtonLevel.prototype.pickRandomColor = function () {
	var index = Math.floor(Math.random() * this.colors.length);
	var color = this.colors[index];
	this.colors.splice(index, 1);
	return color;
};

Game.ButtonLevel.prototype.pickRandomShape = function () {
	var index = Math.floor(Math.random() * this.shapes.length);
	var shape = this.shapes[index];
	this.shapes.splice(index, 1);
	return shape;
};

Game.ButtonLevel.prototype.clear = function () {    
	this.uiLevel.empty();
};

$(function () {
	Game.initialize();
});
