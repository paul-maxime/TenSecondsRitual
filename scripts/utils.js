/*
 * Global Game Jam 2016 | Paul-Maxime
 * Ten Seconds Ritual
 * Utils
 */

Utils = {};

Utils.randomElement = function (array) {
	return array[Math.floor(Math.random() * array.length)];
};

Utils.nextInt = function (min, max) {
	return Math.floor(Math.random() * (max - min)) + min;
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
