/*
 * Ten Seconds Ritual
 */

Game = {
    timer: 0,
    now: 0,
};

Game.initialize = function () {
    Game.startLevel();
};

Game.startLevel = function () {
    Game.setTimer(12000);
    Game.now = Date.now();
    setInterval(function () {
	var now = Date.now();
	var delta = now - Game.now;
	Game.now = now;
	Game.setTimer(Game.timer - delta);
    }, 70);
};

Game.setTimer = function (value) {
    Game.timer = value;
    var seconds = Math.floor(value / 1000) + "";
    var milliseconds = Math.floor((value / 10) % 100) + "";
    if (seconds.length < 2) {
	seconds = "0" + seconds;
    }
    if (milliseconds.length < 2) {
	milliseconds = "0" + milliseconds;
    }
    var text = seconds + ":" + milliseconds;
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

$(function () {
    Game.initialize();
});
