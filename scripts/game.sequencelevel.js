/*
 * Global Game Jam 2016 | Paul-Maxime
 * Ten Seconds Ritual
 * Sequence Level
 */

Game.SequenceLevel = function () {
	this.requiredScore = 20;
	this.uiLevel = Game.createLevelContainer('sequence');
};

Game.SequenceLevel.MESSAGES = [
	'Press the [1] first, then the [2] and finish with the [3].',
	'The [2] comes after the [1] and the [3] is the last.',
	'I think you should press the [3]. No, wait, press the [1] then the [2] first.',
	'The [2] comes between the [3] and the [1], the [1] being the beginning.',
	'Thou shalt press the [3] only after pressing the [2] and the [2] only after pressing the [1].',
	'Activate the [2] after pressing the [1], then push the [3].',
	'The manual says the [1] must be pressed first and the [3] last.',
	'We do not know the first button you should press, but you should press the [2] and the [3] after.',
	'Do not panic! The [1], the [2], the [3]! Go!',
	'As long as you do not push the [3] before the [2] and press the [1] first, you shall be fine.'
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
					pos = '1st';
				} else if (index === 1) {
					pos = '2nd';
				} else {
					pos = '3rd';
				}
			} else {
				if (index === 0) {
					pos = 'first';
				} else if (index === 1) {
					pos = 'second';
				} else {
					pos = 'third';
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
