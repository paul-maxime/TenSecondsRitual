/*
 * Global Game Jam 2016 | Paul-Maxime
 * Ten Seconds Ritual
 * Button Level
 */

Game.ButtonLevel = function () {
	this.requiredScore = 0;
	this.uiLevel = Game.createLevelContainer('buttons');
};

Game.ButtonLevel.COLORS = [
	'Black',
	'Blue',
	'Green',
	'White',
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
	'Do NOT press anything other than the [button]!',
	'I have good faith in the [button].',
	'The [button] will increase our lifespan by 10 seconds.'
];

Game.ButtonLevel.prototype.start = function (onSuccess, onFailure) {
	this.colors = Game.ButtonLevel.COLORS.slice();
	this.shapes = Game.ButtonLevel.SHAPES.slice();
	this.uiButtons = [];
	
	var buttonsCount = Utils.nextInt(3, 7);
	for (var i = 0; i < buttonsCount; ++i) {
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
				Game.MemoryLevel.lastButton = $(this).data('button');
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
