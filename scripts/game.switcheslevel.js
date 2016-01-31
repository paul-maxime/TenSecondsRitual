/*
 * Global Game Jam 2016 | Paul-Maxime
 * Ten Seconds Ritual
 * Switches Level
 */

Game.SwitchesLevel = function () {
	this.requiredScore = 10;
	this.uiLevel = Game.createLevelContainer('switches');
};

Game.SwitchesLevel.MESSAGES = {
	2: [
		'Activate the [1] and the [2].',
		'You need to switch the [1] and the [2] on!',
		'It says the [1] and the [2] in my book.'
	],
	3: [
		'Activate the [1], the [2] and the [3].',
		'You need to switch the [1], the [2] and the [3] on!',
		'Just activate the [1], the [2] and the [3] and we won\'t die.',
	],
	4: [
		'Activate the [1], the [2], the [3] and the [4].',
		'You need to switch the [1], the [2], the [3] and [4] on!'
	]
};

Game.SwitchesLevel.prototype.start = function (onSuccess, onFailure) {
	this.onSuccess = onSuccess;
	this.colors = Game.ButtonLevel.COLORS.slice();
	this.shapes = Game.ButtonLevel.SHAPES.slice();
	this.uiButtons = [];
	
	var buttonsCount = Utils.nextInt(4, 8);
	for (var i = 0; i < buttonsCount; ++i) {
		var button = this.pickRandomButton();
		this.uiButtons.push($('<img>')
			.attr('src', 'assets/images/shapes/tile'+button.color+'_'+(button.shape<10?'0':'')+button.shape+'.png')
			.addClass('game-image-button')
			.data('button', button)
			.data('index', i)
			.data('valid', false)
			.appendTo(this.uiLevel)
		);
	};
	
	this.remainings = [];
	this.errors = 0;
	var size = Utils.nextInt(2, 5);
	while (this.remainings.length < size) {
		var index = Utils.nextInt(0, buttonsCount);
		if (this.remainings.indexOf(index) === -1) {
			this.remainings.push(index);
			this.uiButtons[index].data('valid', true);
		}
	}
	this.remainings.sort();
	
	for (var i = 0; i < this.uiButtons.length; ++i) {
		var self = this;
		this.uiButtons[i].click(function () {
			self.onButtonClick($(this).data('index'));
		});
	}
	
	var instructionText = Utils.randomElement(Game.SwitchesLevel.MESSAGES[size]);
	for (var i = 0; i < this.remainings.length; ++i) {
		var index = this.remainings[i];
		var buttonText = '';
		var rnd = Math.floor(Math.random() * 2);
		if (rnd === 0) {
			buttonText = '<b>' + this.uiButtons[index].data('button').name + '</b>';
		} else {
			buttonText = '<b>' + this.uiButtons[index].data('button').color + '</b> button';
		}
		instructionText = instructionText.replace('['+(i+1)+']', buttonText);
	}
	$('#game-level-instructions').html(instructionText);
};

Game.SwitchesLevel.prototype.onButtonClick = function (index) {
	Game.playSound('click');
	if (!this.uiButtons[index].hasClass('game-image-button-on')) {
		this.uiButtons[index].removeClass('game-image-button').addClass('game-image-button-on');
		if (this.uiButtons[index].data('valid') === true) {
			var k = this.remainings.indexOf(index);
			this.remainings.splice(k, 1);
			if (this.remainings.length === 0 && this.errors === 0) {
				this.onSuccess();
			}
		} else {
			this.errors += 1;
		}
	} else {
		this.uiButtons[index].removeClass('game-image-button-on').addClass('game-image-button');
		if (this.uiButtons[index].data('valid') === true) {
			this.remainings.push(index);			
		} else {
			this.errors -= 1;
			if (this.remainings.length === 0 && this.errors === 0) {
				this.onSuccess();
			}
		}
	}
};

Game.SwitchesLevel.prototype.pickRandomButton = Game.ButtonLevel.prototype.pickRandomButton;
Game.SwitchesLevel.prototype.pickRandomColor = Game.ButtonLevel.prototype.pickRandomColor;
Game.SwitchesLevel.prototype.pickRandomShape = Game.ButtonLevel.prototype.pickRandomShape;
Game.SwitchesLevel.prototype.clear = Game.ButtonLevel.prototype.clear;
