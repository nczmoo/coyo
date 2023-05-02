class Game{
	config = new Config();
	loop = new Loop();
	loopInterval = null;
	
	constructor(){		
		this.loopInterval = setInterval(this.loop.looping, 1000);
	}
}
