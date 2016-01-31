/*
 * Ten Seconds Ritual
 */

Utils = {};

Utils.randomElement = function (array) {
	return array[Math.floor(Math.random() * array.length)];
};

Utils.shuffleArray = function (array) {
    var counter = array.length;
    while (counter > 0) {
        var index = Math.floor(Math.random() * counter);
        counter--;
        var temp = array[counter];
        array[counter] = array[index];
        array[index] = temp;
    }
    return array;
}

Game = {
	timer: 0,
	timerId: null,
	now: 0,
	start: 0,
	score: 0,
	surviveTime: 0,
	level: null,
	levels: null,
	music: null,
	sounds: {
		clock: [],
		fail: [],
		click: []
	},
	musicEnabled: true,
	soundEnabled: true
};

Game.initialize = function () {
	Game.initializeLevels();
	Game.music = new Audio('assets/musics/FuturisticCityMusic-SteamCity.ogg');
	Game.music.loop = true;
	Game.music.volume = 0.25;
	for (var i = 0; i < 8; ++i) {
		Game.sounds.clock.push(new Audio('assets/sounds/tone1.ogg'));
	}
	for (var i = 0; i < 3; ++i) {
		Game.sounds.fail.push(new Audio('assets/sounds/zap2.ogg'));
	}
	for (var i = 0; i < 3; ++i) {
		Game.sounds.click.push(new Audio('assets/sounds/switch2.ogg'));
	}

	$('#options-music').click(Game.toggleMusic);
	$('#options-sound').click(Game.toggleSound);

	Game.startGame();
};

Game.startGame = function () {
	if (Game.musicEnabled) {
		Game.music.play();
	}
	Game.start = Date.now();
	Game.startLevel();
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
	if (Game.musicEnabled && Game.level !== null) {
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
		new Game.ButtonLevel(),
		new Game.SequenceLevel()
	];
};

Game.startLevel = function () {
	Game.setTimer(10000);
	Game.now = Date.now();
	Game.level = Utils.randomElement(Game.levels);
	while (Game.level.requiredScore > Game.score) {
		Game.level = Utils.randomElement(Game.levels);
	}
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
	Game.score += 1;
	Game.startLevel();
};

Game.failLevel = function () {
	Game.playSound('fail');
	clearInterval(Game.timerId);
	Game.level.clear();
	Game.level = null;
	Game.setTimer(0); 
	Game.music.pause();
	Game.surviveTime = Math.floor((Date.now() - Game.start) / 1000);
	$('#game-timer').removeClass('game-timer-alert');
	$('#game-level-instructions').html('Game over! The entire solar system exploded.<br>You performed ' + Game.score + ' ritual'+(Game.score===1?'':'s')+' and survived ' + Game.surviveTime + ' seconds.');
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
	this.requiredScore = 0;
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
	1, 6, 7, 9, 10, 11, 12
];

Game.ButtonLevel.SHAPE_NAMES = {
	1: 'Square',
	6: 'Octagon',
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
	'[button], maybe?',
	'Pressing the [button] is the only way to stop it.',
	'It is said that the [button] is able to delay the mechanism.',
	'If you press the [button], no explosion.',
	'Pressing the [button] is certainly gonna work.',
	'What you are looking for is the [button].',
	'Thou shalt press the [button]!',
	'Do NOT press anything other than the [button]!'
];

Game.ButtonLevel.prototype.start = function (onSuccess, onFailure) {
	this.colors = Game.ButtonLevel.COLORS.slice();
	this.shapes = Game.ButtonLevel.SHAPES.slice();
	this.uiButtons = [];
	for (var i = 0; i < Math.floor(Math.random() * 4) + 4; ++i) {
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
			this.uiButtons[i].click(function () {
				Game.playSound('click');
				onSuccess();
			});
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


Game.SequenceLevel = function () {
	this.requiredScore = 10;
	this.uiLevel = Game.createLevelContainer('buttons');
};

Game.SequenceLevel.MESSAGES = [
	'Press the [1] first, then the [2] and finish with the [3].',
	'The [2] comes after the [1] and the [3] is the last.',
	'I think you should press the [3]. No, wait, press the [1] then the [2] first.',
	'The [2] comes between the [3] and the [1], the [1] being the beginning.',
	'Thou shalt press the [3] only after pressing the [2] and the [2] only after pressing the [1].',
	'Activate the [2] after pressing [1], then push the [3]',
	'The manual says the [1] must be pressed first and the [3] last.',
	'We do not know the first button you should press, but you should press the [2] and the [3] after.',
	'Do not panic! The [1], the [2], the [3]! Go!'
];

Game.SequenceLevel.prototype.start = function (onSuccess, onFailure) {
	this.onSuccess = onSuccess;
	this.colors = Game.ButtonLevel.COLORS.slice();
	this.shapes = Game.ButtonLevel.SHAPES.slice();
	this.uiButtons = [];
	for (var i = 0; i < 3; ++i) {
		var button = this.pickRandomButton();
		this.uiButtons.push($('<img>')
			.attr('src', 'assets/images/shapes/tile'+button.color+'_'+(button.shape<10?'0':'')+button.shape+'.png')
			.addClass('game-image-button')
			.data('button', button)
			.data('index', i)
			.appendTo(this.uiLevel)
		);
	};
	
	this.validIndexes = Utils.shuffleArray([0, 1, 2]);
	this.sequence = [];
	
	for (var i = 0; i < this.uiButtons.length; ++i) {
		var self = this;
		this.uiButtons[i].click(function () {
			self.onButtonClick($(this).data('index'));
		});
	}
	
	var instructionText = Utils.randomElement(Game.SequenceLevel.MESSAGES);
	for (var i = 0; i < this.validIndexes.length; ++i) {
		var index = this.validIndexes[i];
		var buttonText = '';
		var rnd = Math.floor(Math.random() * 3);
		if (rnd === 0) {
			buttonText = '<b>' + this.uiButtons[index].data('button').name + '</b>';
		} else if (rnd === 1) {
			var index = this.uiButtons[index].data('index');
			var pos = '';
			rnd = Math.floor(Math.random() * 3);
			if (rnd === 0) {
				if (index === 0) {
					pos = 'the 1st';
				} else if (index === 1) {
					pos = 'the 2nd';
				} else {
					pos = 'the 3rd';
				}
			} else {
				if (index === 0) {
					pos = 'the first';
				} else if (index === 1) {
					pos = 'the second';
				} else {
					pos = 'the third';
				}
			}
			buttonText = '<b>' + pos + '</b> button';
		} else {
			buttonText = '<b>' + this.uiButtons[index].data('button').color + '</b> button';
		}
		instructionText = instructionText.replace('['+(i+1)+']', buttonText).replace('['+(i+1)+']', buttonText);
	}
	$('#game-level-instructions').html(instructionText);
};

Game.SequenceLevel.prototype.onButtonClick = function (index) {
	if (!this.uiButtons[index].hasClass('game-image-button-on')) {
		Game.playSound('click');
		this.sequence.push(index);
		console.log(this.sequence, this.validIndexes);
		if (this.sequence.length === this.validIndexes.length) {
			var valid = true;
			for (var i = 0; i < this.validIndexes.length; ++i) {
				if (this.sequence[i] !== this.validIndexes[i]) {
					valid = false;
					break;
				}
			}
			if (valid) {
				this.onSuccess();
			} else {
				this.sequence = [];
				for (var i = 0; i < this.uiButtons.length; ++i) {
					this.uiButtons[i].removeClass('game-image-button-on').addClass('game-image-button');
				}
			}
		} else {
			this.uiButtons[index].removeClass('game-image-button').addClass('game-image-button-on');
		}
	}
};

Game.SequenceLevel.prototype.pickRandomButton = Game.ButtonLevel.prototype.pickRandomButton;
Game.SequenceLevel.prototype.pickRandomColor = Game.ButtonLevel.prototype.pickRandomColor;
Game.SequenceLevel.prototype.pickRandomShape = Game.ButtonLevel.prototype.pickRandomShape;
Game.SequenceLevel.prototype.clear = Game.ButtonLevel.prototype.clear;

$(function () {
	Game.initialize();
});
