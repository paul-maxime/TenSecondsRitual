/*
 * Global Game Jam 2016 | Paul-Maxime
 * Ten Seconds Ritual
 * Game
 */

$(function () {
	Game.initialize();
});

Game = {
	timer: 0,
	timerId: null,
	now: 0,
	start: 0,
	score: 0,
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

Game.RETRY_MESSAGES = [
	'Wanna try again? Click!',
	'Click here to do better than that.',
	'Do not lose hope! Try again here!',
	'You can do it. You are underestimating yourself. Click here.',
	'If you click here, you\'ll get free imaginary cake for trying again.',
	'Is this how you want people to remember you? No? Then click!'
];

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
	$('#game-level-restart').click(Game.startGame);
	
	Game.introduction();
};

Game.introduction = function () {
	Game.introductionMessage = '';
	$('#game-introduction-button').click(function () {
		Game.playSound('click');
		$('#game-introduction-button').remove();
		$('#game-introduction-skip').remove();
		setTimeout(Game.introductionDialogA, 1000);
	});
	$('#game-introduction-skip').click(Game.endIntroduction);
};

Game.addIntroductionMessage = function (message) {
	Game.playSound('clock');
	Game.introductionMessage += '<br>' + message;
	$('#game-introduction-message').html(Game.introductionMessage);
};

Game.introductionDialogA = function () {
	Game.addIntroductionMessage('NO! WHAT HAVE YOU DONE?');
	setTimeout(Game.introductionDialogB, 2000);
};

Game.introductionDialogB = function () {
	Game.addIntroductionMessage('You pushed the button without even knowing what it does!?');
	setTimeout(Game.introductionDialogC, 3000);
};

Game.introductionDialogC = function () {
	Game.addIntroductionMessage('It is a secret mechanism, capable of destroying the entire universe!');
	setTimeout(Game.introductionDialogD, 3000);
};

Game.introductionDialogD = function () {
	Game.addIntroductionMessage('THERE IS NO WAY TO STOP IT!');
	setTimeout(Game.introductionDialogE, 2000);
};

Game.introductionDialogE = function () {
	Game.addIntroductionMessage('We have to use the snooze system.');
	setTimeout(Game.introductionDialogF, 2000);
};

Game.introductionDialogF = function () {
	Game.addIntroductionMessage('Each ritual performed will delay the explosion by 10 seconds.');
	setTimeout(Game.introductionDialogG, 3000);
};

Game.introductionDialogG = function () {
	Game.addIntroductionMessage('THERE IS NO TIME TO EXPLAIN, WE HAVE TO GO NOW!!!');
	setTimeout(Game.endIntroduction, 3000);
};

Game.endIntroduction = function () {
	$('#game-introduction').remove();
	$('#game-container').show();
	Game.startGame();
};

Game.startGame = function () {
	Game.music.currentTime = 0;
	if (Game.musicEnabled) {
		Game.music.play();
	}
	$('#game-level-restart').hide();
	Game.start = Date.now();
	Game.score = 0;
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
		new Game.SwitchesLevel(),
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
	clearInterval(Game.timerId);
	Game.level.clear();
	Game.playSound('fail');
	//Game.startLevel();
	Game.gameOver();
};

Game.gameOver = function () {
	Game.level = null;
	Game.setTimer(0); 
	Game.music.pause();
	var surviveTime = Math.floor((Date.now() - Game.start) / 1000);
	$('#game-timer').removeClass('game-timer-alert');
	$('#game-level-instructions').html('Game over! The entire solar system exploded.<br>You performed ' + Game.score + ' ritual'+(Game.score===1?'':'s')+' and survived ' + surviveTime + ' second'+(surviveTime===1?'':'s')+'.');
	$('#game-level-restart').text(Utils.randomElement(Game.RETRY_MESSAGES)).show();
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
