class UI{
	fog = new Array(game.config.maxWorldX);
	moving = {which: null , id: null };
	neighbors = new Array(game.config.maxWorldX);
	what = 'world';
	constructor(){
		for (let x = 0; x < game.config.maxWorldX; x ++){
            this.fog[x] = new Array(game.config.maxWorldY);
			this.neighbors[x]  = new Array(game.config.maxWorldY);
        }
		this.resetFog();
	}
	refresh(){
		$(".assoc").addClass('d-none');
		if (this.what == 'world'){	
			$(".world").removeClass('d-none');
			this.printWorldMap();			
			return;
		}
		$(".local").removeClass('d-none');
		this.printLocal();

		this.printLocalMap();

	}

	formatID(id){
		return Number(id) + 1;
	}

	areAdjacentToClear(startX, startY){
		for (let x = startX - 1; x <= startX + 1; x ++){
            for (let y = startY - 1; y <= startY + 1; y ++){
				let inRange = game.config.isInRange(x, y, 'world');
                if (inRange && this.fog[x][y] == 0){
                    return true;
                }
            }
        }
		return false;
	}

	inMovingRange(x, y){
		if (this.moving.which == null){
			return false;
		}
		
		let thing = game.config.localPlayer;
		if (this.moving.which == 'packages'){
			thing = game.config.packages[this.moving.id];
		}
		let distanceBtwn = distance(thing.x, x, thing.y, y);
		if (distanceBtwn < thing.ap + 1){
			return this.moving.which + "Moving moving";
		} 
		return false;
	}

	printLocal(){
		let txt = '';
		let player = game.config.localPlayer;
		$("#playerStatus").html("(" + player.x + ", " + player.y + ") ap: " + player.ap)
		for (let i in game.config.packages){
			let pkg = game.config.packages[i];
			txt += "<div>Package #" + this.formatID(i) + ": ";			
			let caption = " (" + pkg.x + ", " + pkg.y + ") ap: " + pkg.ap;
			if (pkg.caught){
				caption = "<span class='text-danger'>caught!</span>";
			} else if (pkg.home){
				caption = "<span class='fw-bold'>safe!</span>";
			}
			txt += caption + "</div>";
		}
		$("#packageStatus").html(txt);
	}

	printLocalMap(){
		let txt = '';
		for (let y = 0; y < game.config.maxLocalY; y ++){
			txt += "<div>";
			for (let x = 0; x < game.config.maxLocalX; x ++){
				let caption = '&nbsp;', divClass = '';
				let moving = this.inMovingRange(x, y);
				if (game.config.isPlayerHere(x, y, 'local')){
					divClass = ' player ';
				} else if (game.config.isLaMigraHere(x, y)){
					divClass = ' pig ';
				} else if (game.config.local[x][y] == 4){
					divClass = ' pigMoveTo ';

				} else if (game.config.isPackageHere(x, y)){
					divClass = ' package ';
				
				} else if (game.config.local[x][y] == 3){
					divClass= ' vision ';
				} else if (game.config.local[x][y] == 1){
					divClass = ' rock ';
				} else if (moving != false){
					divClass = " " + moving + " ";
				} else if ( y == 0){
					divClass = ' home ';
				} 
				
				txt += "<div id='local-" + x + "-" + y + "' class='cell " + divClass + "'>" + caption + "</div>";
			}
			txt += "</div>";
		}
		$("#map").html(txt);
	}

	printWorldMap(){
		let txt = '';
		
		for (let y = 0; y < game.config.maxWorldY; y ++){
			
			txt += "<div>";
			for (let x = 0; x < game.config.maxWorldX; x ++){
				let caption = '&nbsp;', divClass = '', howManyNeighbors = game.config.howManyNeighbors(x, y);
				if (game.config.isPlayerHere(x, y, 'world')){
					caption = 'O';
					divClass = ' player ';
				}
				if (howManyNeighbors > 0){
					caption = howManyNeighbors;
				}
				if (this.fog[x][y] == 1){
					divClass = ' fog ';
					caption = '&nbsp;'
				} else if (game.config.world[x][y] == 2){
					caption = 'x';
				}
				if (this.areAdjacentToClear(x, y) && this.fog[x][y] == 1){
					divClass = ' interact verb2 ';
				}

				txt += "<div id='reveal-" + x + "-" + y + "' class='cell " + divClass + "'>" + caption + "</div>";
			}
			txt += "</div>";
		}
		$("#map").html(txt);
	}



	resetFog(){
        for (let x = 0; x < game.config.maxWorldX; x ++){
            for (let y = 0; y < game.config.maxWorldY; y ++){   
				this.neighbors[x][y] = game.config.howManyNeighbors(x, y);
				if (y == game.config.maxWorldY - 1){
					this.fog[x][y] = 0;
					continue;
				}
                this.fog[x][y] = 1;
            }
        }		
	}
}
