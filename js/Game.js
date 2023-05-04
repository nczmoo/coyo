class Game{
	config = new Config();
	loop = new Loop();
	loopInterval = null;
	maxY = 3;
	startY = null;

	constructor(){		
		this.loopInterval = setInterval(this.loop.looping, 1000);
	}

	endTurn(){
		for (let i in this.config.packages){
			this.config.packages[i].ap = this.config.defaultPkgAP;			
		}
		this.config.localPlayer.ap = this.config.defaultPlayerAP;
		this.config.moveLaMigra();
	}

	fetchZeroNeighbors(startX, startY, minVal){		
		let neighbors = [];
		for (let x = startX - 1; x <= startX + 1; x ++){
			if (!this.config.isInRange(x, startY, 'world') || this.config.world[x][startY] == 2){
				continue;
			}
			
            if (this.config.world[x][startY] == 0 && ui.neighbors[x][startY] <= minVal + 1){
				neighbors.push({ x: x, y: startY });
			}
        }	
		for (let y = startY - 1; y <= startY + 1; y ++){				
			if (!this.config.isInRange(startX, y, 'world') || this.config.world[startX][y] == 2){
				continue;
			}
			if (this.config.world[startX][y] == 0 && ui.neighbors[startX][y] <= minVal + 1){
				neighbors.push({ x: startX, y: y });
			}
		}		
		return neighbors;
	}


	isItSwallowed(startX, startY){
		for (let x = startX - 1; x <= startX + 1; x ++){         	
			for (let y = startY - 1; y <= startY + 1; y ++){				
				if (this.config.isInRange(x, y, 'world') && this.config.world[x][y] == 0 && ui.neighbors[x][y] == 0){
					return false;
				}
			}
		}
		return true;
	}



	libertad(){
		alert("FREEDOM");
	}

	meetPig(x, y){
		console.log(x, y);
		ui.what = 'local';
		
	}

	move(dir){
		
		let dirX = {left: -1, right: 1, up: 0, down: 0};
		let dirY = {left: 0, right: 0, up: -1, down: 1};
		let newX = this.config.worldPlayer.x + dirX[dir];
		let newY = this.config.worldPlayer.y + dirY[dir];
		if (!this.config.isInRange(newX, newY, 'world')){
			return;
		}
		
		this.config.worldPlayer.x = newX;
		this.config.worldPlayer.y = newY;
		if (ui.fog[newX][newY] == 1){
			this.open(newX, newY);
		}		
		if (this.config.world[newX][newY] == 2){
			this.meetPig(newX, newY);
		} else if (newY == 0){
			this.libertad();
		}
		ui.refresh();
	}

	moving (x, y){
		let moving = ui.inMovingRange(x, y);
		if (moving == false){
			console.log('no moving');
			return;
		}
		let thing = null;
		if (moving.includes('playerMoving')){
			thing = this.config.localPlayer;
		} else if (moving.includes('packagesMoving')){
			thing = this.config.packages[ui.moving.id];
		}
		let distanceBtw = distance(thing.x, x, thing.y, y);
		if (thing.ap < distanceBtw - 1){
			console.log('not enough ap', thing.ap, distanceBtw);
			return;
		}
		thing.ap -= distanceBtw;
		thing.x = x;
		thing.y = y;

		if (ui.moving.which == 'player' && thing.y == 0){
			let pkgsLeft = this.config.howManyPackagesLeft();
			ui.what = 'world';
			if (pkgsLeft == 0){
				alert('freedom');
			} else if (pkgsLeft > 0){
				confirm("You still have packages here. Do you want to leave them behind?")
			}
			
		} else if (ui.moving.which == 'packages' && thing.y == 0){
			this.config.packages[ui.moving.id].home = true;
		}

		ui.moving.which = null;
		ui.moving.id = null;
		ui.refresh();
	}

	open(x, y){
		
		if (!this.config.isInSearched(x, y)){ // &&  Math.abs(this.startY - y) <= this.maxY){
			this.config.addSearched(x, y);
			ui.fog[x][y] = 0;	
			if (!this.isItSwallowed(x, y)){
				this.revealAllEmptySpace(x, y);
			}

		}
		
	}

	package(x, y){
		let id = this.config.whichPackage(x, y);
		if (id == null){
			console.log('pkg null');
			return;
		}
		ui.moving.which = 'packages';
		ui.moving.id = id;
		ui.refresh();
	}

	player (x, y){
		ui.moving.which = 'player';
		ui.refresh();
	}

	reveal(x, y){
		x = Number(x);
		y = Number(y);
		if (ui.fog[x][y] == 0){
			return;
		}
		if (this.config.world[x][y] == 2){
			this.meetPig(x, y);
			ui.fog[x][y] = 0;
			ui.refresh();
			return;
		}
		this.open(x, y);
		ui.refresh();
	}



	revealAllEmptySpace(x, y){				
		for (let i of this.fetchZeroNeighbors(x, y, ui.neighbors[x][y])){
			this.open(i.x, i.y);
		}
	}
}
