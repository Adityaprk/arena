let express = require('express');
let app = express();
let serv = require('http').Server(app);

app.get('/',function(req, res) {
	res.sendFile(__dirname + '/client/index.html');
});
//When the page is requested it sends the index.html file
app.use('/client',express.static(__dirname + '/client'));
//^^Routing for files
serv.listen(process.env.PORT);
console.log("Server started");

let SOCKET_LIST = {};
let PLAYER_LIST = {};
let ENEMY_LIST = [];
let pc = 0;
var beginBattleTimer = 20;

const SPAWN_RATE = 50;

//^^These are the lists that keep track of the players and connected clients
class Player {
  constructor(id){
    //this.pos = new Vector(100, 540);
    this.pos = [100, 540];
    this.s = 25;
    this.id = id;
    this.pressingLeft = false;
    this.pressingRight = false;
    this.pressingUp = false;
    this.pressingDown = false;
    this.shift = false;
    this.col = false;
    this.name = "";
    this.text = "";
    this.aura = false;
    this.res = false;
    this.area = 1;
    this.psave = false;
    this.dead = false;
    this.devCount = 0;
    this.dev = false;
    this.speedMult = 1;
    this.points = 0;
    this.speed = 12.5;
    this.mouseOn = false;
    this.mousePos = [0, 0];
    this.loggedIn = false;
    this.inMatch = false;
    this.wins = 0;
  }

  setup(){
    let conso = ['b', 'c', 'd', 'f', 'g', 'h', 'j', 'k', 'l', 'm', 'n', 'p', 'q', 'r', 's', 't', 'v', 'w', 'x', 'y', 'z'];
    let vowel = ['a', 'e', 'i', 'o', 'u'];
    
    for(let i = 0; i < 6; i++){
      if(i % 2 == 0){
        this.name += conso[Math.floor(Math.random() * 21)];
      }else{
        this.name += vowel[Math.floor(Math.random() * 5)];
      }
    }

    //let color = ['red', 'green', 'orange', 'purple', 'brown', 'magenta', 'pink'];
    //let rc = Math.floor(8* Math.random());
  }

  updatePosition() {
    if(this.name.length > 16){
      this.name = this.name.substring(0, 16);
    }
    if(this.devCount > 100){
      this.dev = true;
    }

    if((this.dead == false || this.dev == true) && this.loggedIn == true){
      if(this.shift){
        this.speedMult = 0.5;
      } else {
        this.speedMult = 1;
      }

      if(this.mouseOn == false){
        if(this.pressingRight){
          this.pos[0] += this.speed * this.speedMult;
        }
        if(this.pressingLeft){
          this.pos[0] -= this.speed * this.speedMult;
        }
        if(this.pressingUp){
          this.pos[1] -= this.speed * this.speedMult;
        }
        if(this.pressingDown){
          this.pos[1] += this.speed * this.speedMult;
        }
      }else{
        let ang = Math.atan2(this.mousePos[1]-this.pos[1], this.mousePos[0]-this.pos[0]);
        let dx = this.mousePos[0]-this.pos[0]; let dy = this.mousePos[1]-this.pos[1];
        let dist = Math.sqrt(dx*dx+dy*dy);
        if(dist > 55){dist = 55;}

        this.pos[0] += Math.cos(ang)*(dist/4)*this.speedMult;
        this.pos[1] += Math.sin(ang)*(dist/4)*this.speedMult;
      }
    }

    if(beginBattleTimer <= 3 && beginBattleTimer >= 1){
      this.inMatch = true;
      this.pos[0] = 1920/2; this.pos[1] = 1080/2;
    }else if(beginBattleTimer >= 20){
      this.inMatch = false;
    }

    if(this.pos[0]+this.s>1920-50){
      this.pos[0]=1920-50-this.s;
    }
    if(this.pos[0]-this.s<0+50){
      this.pos[0]=50+this.s;
    }
    if(this.pos[1]+this.s>1080-50){
      this.pos[1] = 1080-50-this.s;
    }
    if(this.pos[1]-this.s<0+50){
      this.pos[1]=50+this.s;
    }

    if(this.dev == true){
      this.dead = false;
      this.name = "Dev";
      this.wins = 100;
    }
    if(this.pos[0]+this.s<1920-200 && this.pos[0]-this.s>200 && this.inMatch == true){
      if(beginBattleTimer < 0){
        this.points = Math.abs(Math.ceil(beginBattleTimer*100)/100);
      }
    }else{
      //this.points = 0;
      this.inMatch = false;
    }
  }
}
//^^Function for generating players

class GreyEnemy{
	constructor(speed, size){
    this.randSpawnPos = Math.floor(Math.random()*4);
    this.info = [0, 0, size, "grey"];
    if(this.randSpawnPos == 0){
      this.info[0] = 150 + size;
      this.info[1] = 100 + size;
    }else if(this.randSpawnPos == 1){
      this.info[0] = 1920-150-size;
      this.info[1] = 100 + size;
    }else if(this.randSpawnPos == 2){
      this.info[0] = 150 + size;
      this.info[1] = 1080-100-size;
    }else{
      this.info[0] = 1920-150-size;
      this.info[1] = 1080-100-size;
    }
    this.speed = speed;

    this.xmul = 1;
    this.ymul = 1;
    this.ang = Math.random()*360;
    this.col = false;
  }

	updatePosition(){
		//Collisions
		if(this.info[0]+this.info[2]>1920-200){
      this.info[0]=1920-200-this.info[2];
      this.xmul *= -1;
    }
		if(this.info[0]-this.info[2] < 200){
      this.info[0]=200+this.info[2];
      this.xmul *= -1;
    }
		if(this.info[1]+this.info[2]>1080-50){
      this.info[1] = 1080-50-this.info[2];
      this.ymul *= -1;
		}
		if(this.info[1]-this.info[2]<50){
      this.info[1]=50+this.info[2];
      this.ymul *= -1;
		}

    this.info[0] += Math.cos(this.ang) * this.speed * this.xmul;
    this.info[1] += Math.sin(this.ang) * this.speed * this.ymul;
	};
}
class BorderEnemy{
	constructor(x, y, speed, size, phase){
    this.info = [x, y, size, "black"];
    this.speed = speed;

    this.phase = phase;
  }

	updatePosition(){
		//Collisions
		if(this.info[0]+this.info[2]>1920-200){
      this.info[0]=1920-200-this.info[2];
    }
		if(this.info[0]-this.info[2] < 200){
      this.info[0]=200+this.info[2];
    }
		if(this.info[1]+this.info[2]>1080-50){
      this.info[1] = 1080-50-this.info[2];
		}
		if(this.info[1]-this.info[2]<50){
      this.info[1]=50+this.info[2];
		}

    if(this.phase == 0){
      this.info[0]+=this.speed;
      if(this.info[0] + this.info[2] > 1920-200){
        this.info[0] = 1920-200-this.info[2];
        this.phase = 1;
      }
    }else if(this.phase == 1){
      this.info[1] += this.speed;
      if(this.info[1]+this.info[2] > 1080-50){
        this.info[1] = 1080-50-this.info[2];
        this.phase = 2;
      }
    }else if(this.phase == 2){
      this.info[0]-=this.speed;
      if(this.info[0]-this.info[2] < 200){
        this.info[0] = 200+this.info[2];
        this.phase = 3;
      }
    }else if(this.phase == 3){
      this.info[1]-=this.speed;
      if(this.info[1]-this.info[2] < 50){
        this.info[1] = 50+this.info[2];
        this.phase = 0;
      }
    }

    //this.info[0] += Math.cos(this.ang) * this.speed * this.xmul;
    //this.info[1] += Math.sin(this.ang) * this.speed * this.ymul;
	};
}

/*for(let ec = 0; ec < 15; ec++){
  ENEMY_LIST.push(new GreyEnemy(3, 20));
}*/

/*ENEMY_LIST.push(new BorderEnemy(450+15, 50+15, 15, 30, 0));
ENEMY_LIST.push(new BorderEnemy(1920-200-15, 150+15, 15, 30, 1));
ENEMY_LIST.push(new BorderEnemy(1920-450-15, 1080-50-15, 15, 30, 2));
ENEMY_LIST.push(new BorderEnemy(150+15, 1080-50-15, 15, 30, 3));*/
ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 15, 30, 0));
ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 8, 40, 1));
ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 15, 30, 2));
ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 8, 40, 3));

ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 6, 50, 0));
ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 10, 35, 1));
ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 6, 50, 2));
ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 10, 35, 3));


let io = require('socket.io')(serv,{});

io.sockets.on('connection', function(socket){
  pc += 1;

  SOCKET_LIST[socket.id] = socket;
  let player = new Player(socket.id);
  player.setup();
  PLAYER_LIST[socket.id] = player;

  if(pc > 15){
    delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
  }

  socket.on('disconnect',function(){
    pc -= 1;
		delete SOCKET_LIST[socket.id];
		delete PLAYER_LIST[socket.id];
		//When the client disconnects they get removed from the lists
	});

  //On connection adds the player and client to the lists of players and clients
	socket.on('keyPress',function(data){
		if(data.inputId == 'left')
			player.pressingLeft = data.state;
		else if(data.inputId == 'right')
			player.pressingRight = data.state;
		else if(data.inputId == 'up')
			player.pressingUp = data.state;
		else if(data.inputId == 'down')
			player.pressingDown = data.state;
    else if(data.inputId == 'shift')
      player.shift = data.state;
    else if(data.inputId == 'r'){
      //player.pos = [100, 540];
      player.dead = false;
    }
    else if(data.inputId == "o")
      player.devCount++;
  });

	socket.on('mouseInfo',function(data){
    if(data.inputId == 'mouseOn'){
      player.mouseOn = data.value;
    }
		else if(data.inputId == 'mouseX'){
      player.mousePos[0] = data.value;
    }
		else if(data.inputId == 'mouseY'){
      player.mousePos[1] = data.value;
    }
  });

  socket.on('loginInfo',function(data){
    if(data.inputId == 'info'){
      player.name = data.value;
      player.loggedIn = true;
      player.mouseOn = false;
    }
  });
	//^^Once the keys that the client is pressing are sent to the server the server saves that information
});

function checkAllOut(){
  count = 0;
  pl = Object.keys(PLAYER_LIST)[0];
  for (let i in PLAYER_LIST){
    if(PLAYER_LIST[i].inMatch == true){
      count++;
      pl = i;
    }
  }

  if(count == 1 || (count == 0 && beginBattleTimer < 0)){
    PLAYER_LIST[pl].wins++;
    beginBattleTimer = 15;
    for(let i in PLAYER_LIST){
      PLAYER_LIST[i].inMatch = false;
    }
    ENEMY_LIST = [];
    ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 15, 30, 0));
    ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 8, 40, 1));
    ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 15, 30, 2));
    ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 8, 40, 3));

    ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 6, 50, 0));
    ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 10, 35, 1));
    ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 6, 50, 2));
    ENEMY_LIST.push(new BorderEnemy(1920/2, 1080/2, 10, 35, 3));
  }

  delete count; delete pl;
}

let additioner = 0;

setInterval(function(){
  let pack = [];
  
  if(pc > 1){
    checkAllOut();
    
    beginBattleTimer-=15/1000;
  }else{
    beginBattleTimer = 15;
  }

  if(beginBattleTimer <= 0){
    additioner++;
    additioner = additioner % SPAWN_RATE;
    
    if(additioner % SPAWN_RATE == 0){
      ENEMY_LIST.push(new GreyEnemy(3+(Math.random()*5), 20+(Math.random()*20)));
    }
  }

  pack.push({
    beginBattleTimer:Math.floor(beginBattleTimer)
  });

	for(let i in PLAYER_LIST){
		let player = PLAYER_LIST[i];

    /*if(Object.keys(PLAYER_LIST).length > 1){
    }*/

    for(let j in ENEMY_LIST){
      let enemy = ENEMY_LIST[j];
      let distX = (player.pos[0] - enemy.info[0])*(player.pos[0] - enemy.info[0]);
      let distY = (player.pos[1] - enemy.info[1])*(player.pos[1] - enemy.info[1]);
      let distC = Math.sqrt(distX+distY);
      if(distC < player.s + enemy.info[2]){
        player.pos[0] = 100;
        player.pos[1] = 540;
        //player.dead = true;
      }

      delete enemy;
      delete distX;
      delete distY;
      delete distC;
    }

		player.updatePosition();
		pack.push({
			pos:player.pos,
      name:player.name,
      wins:player.wins,
      id:player.id,
      inMatch:player.inMatch
		});

    delete player;
  }

  for(let i in ENEMY_LIST){
    ENEMY_LIST[i].updatePosition();
    pack.push({
      ei:ENEMY_LIST[i].info
    });
  }

	for(let n in SOCKET_LIST){
		SOCKET_LIST[n].emit('newPositions',pack);
	}

  delete pack;

	//^^Loops through all the clients in the list and sends them the positions of all the players
},1000/60);
