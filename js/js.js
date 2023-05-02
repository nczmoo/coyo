game = new Game()
ui = new UI()
ui.refresh()

function distance(x1, x2, y1, y2){
	return Math.floor(Math.sqrt(Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2)));
}

function randNum(min, max) {
	return Math.round(Math.random() * (max - min) + min);
}