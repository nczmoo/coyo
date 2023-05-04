class Config {
    defaultPkgAP = 5;
    defaultPlayerAP = 8;
    fog = [];
    keys = [];
    local = new Array(this.maxLocalX);
    localMigra = {x: 0, y: 0, movingTo: {} };
    localPlayer = { x: null, y: null, ap: this.defaultPlayerAP };
    maxLocalX = 10;
    maxLocalY = 25;
    maxRockSize = 3;
    maxVision = 10;
    maxWorldX = 10; 
    maxWorldY = 20; 
    minDistance = 1;
    minRockSize = 2;
    numOfPackages = 3;
    numOfPigs = null;
    numOfRocks = 15;
    packages = [];
    pigCent = .15;
    pigs = [];
    worldPlayer = {};
    searched = [];
    worldSize = null;
    world = new Array(this.maxWorldX);

	constructor(){
        this.keys[37] = 'left';
        this.keys[38] = 'up';
        this.keys[39] = 'right';        
        this.keys[40] = 'down';
        this.worldPlayer.x = randNum(0, this.maxWorldX - 1);
        this.worldPlayer.y = this.maxWorldY - 1;
        this.localPlayer.x = this.maxLocalX - 1; 
        this.localPlayer.y = this.maxLocalY - 1;
        this.worldSize = this.maxWorldX * this.maxWorldY;
        this.numOfPigs = (this.worldSize * this.pigCent);
        for (let i = 0; i < this.numOfPackages; i ++){
            this.packages.push( { x: this.maxLocalX - i - 2, y: this.maxLocalY - 1, ap: this.defaultPkgAP, home: false, caught: false });
        }
        for (let x = 0; x < this.maxWorldX; x ++){
            this.world[x] = new Array(this.maxWorldY);
        }
        for (let x = 0; x < this.maxLocalX; x ++){
            this.local[x] = new Array(this.maxLocalY);
        }   
        this.resetWorld();
        this.generatePigs();        
        this.resetLocal(true);
        this.generateRocks();
        this.drawPigVision();
        this.fetchLaMigraMoveTo();

    }

    addSearched(x, y){
		this.searched.push('x-' + x + "-y-" + y);
	}

    areAnyWithinDistance(x, y){
        for (let pig of this.pigs){
            let distanceBtw = distance(x, pig.x, y, pig.y);
            if (distanceBtw <= this.minDistance){
                return true;
            }
        }
        return false;
    }


    buildRocksFrom(startX, startY, i){  
        let n = 64;
        this.local[startX][startY] = 1;
        i--;
        if (i < 1){
            return;
        }
        while(n > 0){
            n--;
            let randX = randNum(startX - 1, startX + 1);
            let randY = randNum(startY - 1, startY + 1);
            let inRange = this.isInRange(randX, randY, 'local');            
            if (!inRange || randX == 0 || randX == this.maxLocalX - 1){
                continue;
            }
            if (this.local[randX][randY] == 0){
                this.buildRocksFrom(randX, randY, i);
                return;
            }
            
        }
    }

    canYouMakeItThrough(){
        let cleared = [];
        for (let x = 0; x < this.maxWorldX - 1; x ++){
            cleared[x] = this.routeClear(x, this.maxWorldY);
        }
        for (let x = 0; x < this.maxWorldX - 1; x++){
            if (cleared[x]){
                return true;
            }
        }
        return false;
    }

    drawPigVision(){
        let delta = [-1, 1];
        let n = 0;
        let x = this.localMigra.x;
        let y = this.localMigra.y;
        let pX = 0, pY = 0;
        this.local[this.localMigra.x][this.localMigra.y] = 3;
        while (pX < delta.length && n < this.maxVision){
            let newX = x + delta[pX];
            if (!this.isInRange(newX, y, 'local') || this.local[newX][y] != 0 ){
                x = this.localMigra.x;
                pX++;
                continue;
            }

            this.local[newX][y] = 3;
            x = newX;
            n++;
        }
        x = this.localMigra.x;
        n = 0;
        while (pY < delta.length && n < this.maxVision){
            let newY = y + delta[pY];
            if (!this.isInRange(x, newY, 'local') || this.local[x][newY] != 0 ){
                y = this.localMigra.y;
                pY++;
                continue;
            }
            this.local[x][newY] = 3;
            y = newY;
            n ++;
        }      
        x = this.localMigra.x;
        y = this.localMigra.y; 
        pX = 0;
        pY = 0; 
        while (pY < delta.length){
            let newX = x + delta[pX];
            let newY = y + delta[pY];            
            if (!this.isInRange(newX, newY, 'local') || this.local[newX][newY] != 0 ){
                x = this.localMigra.x;
                y = this.localMigra.y;
                pX ++;
                if (pX > delta.length){
                    pX = 0;
                    pY++;
                }
                continue;
            }
            this.local[newX][newY] = 3;
            y = newY;
            x = newX;            
        }
        for (x = 0; x < this.maxLocalX; x ++ ){
            for (y = 0; y < this.maxLocalY; y ++ ){
                let visions = this.howManyVisions(x, y);
                if (this.local[x][y] == 0 && visions > 3){
                    this.local[x][y] = 3;
                }
            }
        }

    }

    fetchLaMigraMoveTo(){
        while (1){
            let randX = randNum(this.localMigra.x - this.maxVision, this.localMigra.x + this.maxVision);
            let randY = randNum(this.localMigra.y - this.maxVision, this.localMigra.y + this.maxVision);
            if (this.isInRange(randX, randY, 'local') 
                && this.local[randX][randY] == 3 
                && distance(this.localMigra.x, randX, this.localMigra.y, randY) >= 5){
                this.localMigra.movingTo = { x: randX, y: randY };
                this.local[randX][randY] = 4;
                return;
            }
        }
    }

    generatePigs(){
        for (let i = 0; i < this.numOfPigs; i ++){
            while(1){
                let randX = randNum(0, this.maxWorldX - 1);
                let randY = randNum(0, this.maxWorldY - 2);
                if (this.areAnyWithinDistance(randX, randY)){
                    continue;
                }
                this.pigs.push({ x: randX, y: randY   });
                this.world[randX][randY] = 2;

                break;
            }
        }
    }

    generateRocks(){
        for (let i = 0; i < this.numOfRocks; i ++){
            while(1){
                let randX = randNum(1, this.maxLocalX - 2);
                let randY = randNum(3, this.maxLocalY - 4); 
                if (this.local[randX][randY] != 0){
                    continue;
                }

                this.buildRocksFrom(randX, randY, randNum(this.minRockSize, this.maxRockSize));
                break; 
                
            }
        }
    }

    howManyNeighbors(startX, startY){
        let n = 0;
        for (let x = startX - 1; x <= startX + 1; x ++){
            for (let y = startY - 1; y <= startY + 1; y ++){
                if (x == startX && y == startY){
                    continue;
                }
                if (this.isInRange(x, y, 'world') && this.world[x][y] == 2){
                    n++;
                }
            }
        }
        return n;
    }

    howManyPackagesLeft(){
        let n = 0;
        for (let i in this.packages){
            let pkg = this.packages[i];
            if (!pkg.caught && !pkg.home){
                n++;
            }
        }
        return n;
    }

    howManyVisions(startX, startY){
        let n = 0;
        for (let x = startX - 1; x <= startX + 1; x ++){
            for (let y = startY - 1; y <= startY + 1; y ++){
                if (x == startX && y == startY){
                    continue;
                }
                if (this.isInRange(x, y, 'local') && this.local[x][y] == 3){
                    n++;
                }
            }
        }
        return n;
    }

    isInRange(x, y, where){
        let maxX = { world: 'maxWorldX', local: 'maxLocalX' };
        let maxY = { world: 'maxWorldY', local: 'maxLocalY' };
        
        return x >= 0 && x < this[maxX[where]]
            && y >= 0 && y < this[maxY[where]];

    }

    isPackageHere(x, y){
        for (let i of this.packages){
            if (i.home || i.caught){
                continue;
            }
            if (i.x == x && i.y == y){
                return true;
            }
        }
        return false;
    }

    isPlayerHere(x, y, where){
		let wheres = { local: 'localPlayer', world: 'worldPlayer' };
		return x == this[wheres[where]].x && y == this[wheres[where]].y;
	}

    isInSearched(x, y){
		return this.searched.includes('x-' + x + "-y-" + y);
	}

    isLaMigraHere(x, y){
        return x == this.localMigra.x && y == this.localMigra.y;
    }

    moveLaMigra(){
        
        let pig = this.localMigra;
        this.resetLocal(false);
        this.local[pig.x][pig.y] = 0;
        this.localMigra.x = pig.movingTo.x;
        this.localMigra.y = pig.movingTo.y;
        this.local[pig.movingTo.x][pig.movingTo.y] = 2;
        this.drawPigVision();
        this.fetchLaMigraMoveTo();
    }

    resetLocal(first){
        for (let x = 0; x < this.maxLocalX; x ++){
            for (let y = 0; y < this.maxLocalY; y ++){       
                if (this.isPlayerHere(x, y, 'local') || this.isPackageHere(x, y)){
                    continue;
                }
                if (first || this.local[x][y] > 2){
                    this.local[x][y] = 0;
                }
                

            }
        }
    }

    resetWorld(){
        for (let x = 0; x < this.maxWorldX; x ++){
            for (let y = 0; y < this.maxWorldY; y ++){                
                this.world[x][y] = 0;

            }
        }
    }    

    routeClear(startX, startY){
        if (this.isInSearched(startX, startY)){
            return false;
        }
        this.addSearched(startX, startY);
        if (startY  == 0){
            return true;
        }
        for (let x = startX - 1; x <= startX + 1; x ++){
			if (!this.isInRange(x, startY, 'world') || this.world[x][startY] == 2){
				continue;
			}			
            if (this.world[x][startY] == 0){
				this.routeClear(x, startY);
			}
        }	
		for (let y = startY - 1; y <= startY + 1; y ++){				
			if (!this.isInRange(startX, y, 'world') || this.world[startX][y] == 2){
				continue;
			}
			if (this.world[startX][y] == 0){
				this.routeClear(startX, y);
			}
		}		
    }

    whichPackage(x, y){
        for (let i in this.packages){
            let pkg = this.packages[i];
            if (pkg.x == x && pkg.y == y){
                return i;
            }
        }
        return null;
    }
}