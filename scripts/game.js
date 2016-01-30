/*
 * Ten Seconds Ritual
 */

Game = {
    timer: 0,
    timerId: null,
    now: 0,
    level: null,
    levels: null
};

Game.initialize = function () {
    Game.initializeLevels();
    Game.startLevel();
};

Game.initializeLevels = function () {
    Game.levels = [
	new Game.ButtonsLevel()
    ];
};

Game.startLevel = function () {
    Game.setTimer(12000);
    Game.now = Date.now();
    Game.level = Game.levels[0];
    Game.level.start(Game.successLevel, Game.failLevel);
    Game.timerId = setInterval(function () {
	var now = Date.now();
	var delta = now - Game.now;
	Game.now = now;
	var timer = Game.timer - delta;
	if (timer <= 0) {
	    Game.failLevel();
	} else {
	    Game.setTimer(Game.timer - delta);
	}
    }, 70);
};

Game.successLevel = function () {
    clearInterval(Game.timerId);
    Game.level.clear();
    Game.startLevel();
};

Game.failLevel = function () {
    clearInterval(Game.timerId);
    Game.level.clear();
    Game.setTimer(0); 
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

Game.ButtonsLevel = function () {
    this.uiLevel = Game.createLevelContainer('buttons');
};

Game.ButtonsLevel.prototype.start = function (onSuccess, onFailure) {
    this.onSuccess = onSuccess;
    this.onFailure = onFailure;
    this.uiButton = $('<img>')
	.attr('src', 'assets/images/shapes/tileRed_05.png')
	.addClass('game-image-button')
	.appendTo(this.uiLevel);
    this.uiButton.click(this.onSuccess);
    $('#game-level-instructions').text('Click the "hello" button now!');
};

Game.ButtonsLevel.prototype.clear = function () {    
    this.uiLevel.empty();
};

$(function () {
    Game.initialize();
});
