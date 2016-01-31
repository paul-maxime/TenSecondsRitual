/*
 * Global Game Jam 2016 | Paul-Maxime
 * Ten Seconds Ritual
 * Memory Level
 */

Game.MemoryLevel = function () {
	this.requiredScore = 30;
	this.uiLevel = Game.createLevelContainer('memory');
};

Game.MemoryLevel.MESSAGES = [
	'Press the button with the same [type] as the last button you pressed.',
	'Remember the last [type] you pushed? Push the same!',
	'You pressed a [type] last turn. Which one was it?',
	'Push the same [type] you pushed during the previous ritual.',
	'The last button you pressed had a [type]. Press the same one.',
	'I hope you remember the last [type] you pressed. Because that\'s the same one.'
];

Game.MemoryLevel.prototype.start = function (onSuccess, onFailure) {
	this.onSuccess = onSuccess;
	this.onFailure = onFailure;
	this.colors = Game.ButtonLevel.COLORS.slice();
	this.shapes = Game.ButtonLevel.SHAPES.slice();
	
	var type = Utils.nextInt(0, 3);
	var buttonsCount = Utils.nextInt(2, 5);
	
	this.validIndex = Utils.nextInt(0, buttonsCount);
	
	if (type === 0) {
		var index = this.shapes.indexOf(Game.MemoryLevel.lastButton.shape)
		this.shapes.splice(index, 1);
	} else {
		var index = this.colors.indexOf(Game.MemoryLevel.lastButton.color)
		this.colors.splice(index, 1);
	}
	
	this.uiButtons = [];
	for (var i = 0; i < buttonsCount; ++i) {
		var button;
		if (i === this.validIndex) {
			if (type === 0) {
				button = { shape: Game.MemoryLevel.lastButton.shape, color: this.pickRandomColor() };				
			} else {
				button = { color: Game.MemoryLevel.lastButton.color, shape: this.pickRandomShape() };
			}
		} else {
			button = this.pickRandomButton();
		}
		this.uiButtons.push($('<img>')
			.attr('src', 'assets/images/shapes/tile'+button.color+'_'+(button.shape<10?'0':'')+button.shape+'.png')
			.addClass('game-image-button')
			.data('button', button)
			.data('index', i)
			.appendTo(this.uiLevel)
		);
	};
	
	for (var i = 0; i < this.uiButtons.length; ++i) {
		var self = this;
		this.uiButtons[i].click(function () {
			self.onButtonClick($(this).data('index'));
		});
	}
	
	var instructionText = Utils.randomElement(Game.MemoryLevel.MESSAGES);
	var typeText = (type === 0 ? 'shape' : 'color');
	$('#game-level-instructions').html(instructionText.replace('[type]', typeText));
};

Game.MemoryLevel.prototype.onButtonClick = function (index) {
	Game.MemoryLevel.lastButton = this.uiButtons[index].data('button');
	if (index === this.validIndex) {
		Game.playSound('click');
		this.onSuccess();
	} else {
		this.onFailure();
	}
};

Game.MemoryLevel.prototype.pickRandomButton = Game.ButtonLevel.prototype.pickRandomButton;
Game.MemoryLevel.prototype.pickRandomColor = Game.ButtonLevel.prototype.pickRandomColor;
Game.MemoryLevel.prototype.pickRandomShape = Game.ButtonLevel.prototype.pickRandomShape;
Game.MemoryLevel.prototype.clear = Game.ButtonLevel.prototype.clear;
