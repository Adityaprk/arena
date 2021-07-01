let canvas = document.getElementById("canvas");
let ctx = canvas.getContext("2d");

function Resize(){
  let scale = window.innerWidth/canvas.width;
  if(window.innerHeight/canvas.height < window.innerWidth/canvas.width){
    scale = window.innerHeight/canvas.height;
  }
  canvas.style.transform ="scale(" + scale +")";
  canvas.style.left = 1/2 * (window.innerWidth-canvas.width) + "px";
  canvas.style.top = 1/2 * (window.innerHeight-canvas.height) +"px";
}
Resize();

window.addEventListener('resize', function(){
  Resize();
});

/*
#entryDiv{
  position: fixed;
  top: 50%;
  left: 50%;
  margin-top: -50px;
  margin-left: -100px;
}
#inputText{
  color:white;
}
<div id="entryDiv">
<p id="inputText">Name:</p>
<input type="text" id="myText" value="">
<button id="enter">Enter</button>
</div>
*/

let enterBtn = document.getElementById("enter");
let mouseD = false;
let mouseOn = false;
let mouseOnCounter = 0;

document.getElementById("myText").focus();

enterBtn.addEventListener("click", function(){
  socket.emit('loginInfo',{inputId:'info',value:document.getElementById("myText").value});
  let elem = document.getElementById("entryDiv");
  elem.remove();
  mouseOn = false;
  mouseOnCounter = 0;
});

//canvas.width = window.innerWidth;
//canvas.height = window.innerHeight;
//socket.emit('screenSize',{inputId:'wid',value:window.innerWidth});
//socket.emit('keypress',{inputId:'hei',value:window.innerHeight});

let playerC = 0;

function Circle(x, y, s){
  ctx.beginPath();
  ctx.arc(x, y, s, 0, 2 * Math.PI);
  ctx.fill();
  ctx.closePath();
}

/*ctx.fillStyle = "white";
ctx.fillRect(0, 0, canvas.width, canvas.height);
ctx.textAlign = "center";
ctx.textBaseline = "middle";
ctx.font = "25px Comic Sans MS";
ctx.fillStyle = "black";
ctx.fillText("3 Players already in game, try again later", canvas.width/2, canvas.height/2);*/

var socket = io();

ctx.textAlign = "center";

//^^Connects to the server with socket.io

socket.on('newPositions',function(data){
  if(!document.hidden){
  ctx.fillStyle = "rgba(180,180,220,1)";
  ctx.fillRect(0,0,canvas.width,canvas.height)

  ctx.fillStyle = "rgba(210,120,120,1)";
  ctx.fillRect(0,0,50,canvas.height);
  ctx.fillRect(canvas.width-50,0,50,canvas.height);
  ctx.fillRect(0,0,canvas.width,50);
  ctx.fillRect(0,canvas.height-50,canvas.width,50);

  ctx.fillStyle = "rgba(100, 200, 100, 0.5)";
  ctx.fillRect(50, 50, 150, canvas.height-100)
  ctx.fillRect(canvas.width-200, 50, 150, canvas.height-100)
  
  ctx.fillStyle = "rgba(80,80,80,.1)";
  ctx.fillRect(canvas.width-300, 100, 200, 500);

  for(let i = 0; i < data.length; i++){
    
    if(data[i].pos){
      playerC++;
    
      if(data[i].inMatch == true){
        if(data[i].id == socket.id){
          ctx.fillStyle = "rgba(0,200,0,1)";
        }else{
          ctx.fillStyle = "rgba(0,255,0,1)";
        }
      }else{
        if(data[i].id == socket.id){
          ctx.fillStyle = "rgba(200,0,0,1)";
        }else{
          ctx.fillStyle = "rgba(255,0,0,1)";
        }
      }
      Circle(data[i].pos[0],data[i].pos[1], 25);
      
      ctx.font = "25px Comic Sans MS";
      ctx.fillStyle = "rgba(15,15,15, 1)";
      ctx.fillText(data[i].name, data[i].pos[0], data[i].pos[1]-35); 

      //ctx.fillStyle = "Red";
      ctx.fillText(data[i].name + ": " + data[i].wins + " wins", canvas.width-200, 150 + (50*playerC));

      ctx.font = "25px Comic Sans MS";
      ctx.textAlign = "center";
      ctx.fillStyle = "rgba(15,15,15, 1)";
      ctx.fillText(data[i].name, data[i].pos[0], data[i].pos[1]-35);
    } else if(data[i].ei){
      ctx.fillStyle = data[i].ei[3];
      Circle(data[i].ei[0], data[i].ei[1], data[i].ei[2]);
    } else if(data[i].beginBattleTimer){
      ctx.fillStyle = "rgba(15,15,15, 1)";
      ctx.font = "50px Comic Sans MS";
      if(data[i].beginBattleTimer == 15){
        ctx.fillText("Waiting for players...", canvas.width/2, canvas.height-100);
      }else{
        if(data[i].beginBattleTimer >= 0){
          ctx.fillText("Battle Starting in: " + Math.abs(data[i].beginBattleTimer), canvas.width/2, canvas.height-70);
        }else{
          ctx.fillText("Time elapsed: " + Math.abs(data[i].beginBattleTimer), canvas.width/2, canvas.height-70);
        }
      }
    }
  }

  ctx.textAlign = "center";
  ctx.fillText("Players", canvas.width-200, 150);

  ctx.fillStyle = "rgba(15,15,15, 1)";
  ctx.font = "50px Comic Sans MS";
  ctx.fillText("Players: " + playerC, canvas.width/2, 100);

  playerC = 0;
  }
});
//^^Once the client recieves the position data it clears the canvas and puts all the players and enemies in their new positions

let t = 0;

document.onkeydown = function(event){
  if(event.keyCode == 68 || event.keyCode == 39){	//d
    socket.emit('keyPress',{inputId:'right',state:true});
  }
  else if(event.keyCode == 83 || event.keyCode == 40){	//s
    socket.emit('keyPress',{inputId:'down',state:true});
  }
  else if(event.keyCode == 65 || event.keyCode == 37){ //a
    socket.emit('keyPress',{inputId:'left',state:true});
  }
  else if(event.keyCode == 87 || event.keyCode == 38){ // w
    socket.emit('keyPress',{inputId:'up',state:true});
  }
  else if(event.keyCode == 16){ // shift
    socket.emit('keyPress',{inputId:'shift',state:true});
  }
  else if(event.keyCode == 74 || event.keyCode == 90){ // j
  socket.emit('keyPress',{inputId:'j',state:true});
  }
  else if(event.keyCode == 82){ // r
  socket.emit('keyPress',{inputId:'r',state:true});
  }
  else if(event.keyCode == 84){ // t
    socket.emit('keyPress',{inputId:'t',state:true});
  }
  else if(event.keyCode == 79){ // `
    socket.emit('keyPress',{inputId:"o",state:true});
  }
  t=0;
};

document.onkeyup = function(event){
  if(event.keyCode == 68 || event.keyCode == 39){	//d
    socket.emit('keyPress',{inputId:'right',state:false});
  }
  else if(event.keyCode == 83 || event.keyCode == 40){	//s
    socket.emit('keyPress',{inputId:'down',state:false});
  }
  else if(event.keyCode == 65 || event.keyCode == 37){ //a
    socket.emit('keyPress',{inputId:'left',state:false});
  }
  else if(event.keyCode == 87 || event.keyCode == 38){ // w
    socket.emit('keyPress',{inputId:'up',state:false});
  }
  else if(event.keyCode == 16){ // shift
    socket.emit('keyPress',{inputId:'shift',state:false});
  }
  else if(event.keyCode == 74 || event.keyCode == 90){ // j
    socket.emit('keyPress',{inputId:'j',state:false});
  }
  else if(event.keyCode == 82){ // r
    socket.emit('keyPress',{inputId:'r',state:false});
  }
  else if(event.keyCode == 84){ // t
    socket.emit('keyPress',{inputId:'t',state:false});
  }
  else if(event.keyCode == 79){ // `
    socket.emit('keyPress',{inputId:"o",state:false});
  }
};

function getCursorPosition(canvas, event) {
  let rect = canvas.getBoundingClientRect(),
  scaleX = canvas.width / rect.width,
  scaleY = canvas.height / rect.height; 

  let x = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
  let y = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
  socket.emit('mouseInfo',{inputId:'mouseX',value:x});
  socket.emit('mouseInfo',{inputId:'mouseY',value:y});
  console.log(x,y,mouseOn);

  delete x;
  delete y;
}

window.addEventListener('mousedown', function(e) {
  mouseD = true;
  if(mouseOnCounter == 0){
    mouseOnCounter = 1;
  }
  if(mouseOnCounter == 2){
    mouseOnCounter = 3;
  }
  if(mouseOnCounter == 1){
    mouseOn = true;
  }else{
    mouseOn = false;
  }
})

window.addEventListener('mouseup', function(e) {
  mouseD = false;
  if(mouseOnCounter == 1){
    mouseOnCounter = 2;
  }else if(mouseOnCounter == 3){
    mouseOnCounter = 0;
  }
})

window.addEventListener('mousemove', function(e) {
  socket.emit('mouseInfo',{inputId:"mouseOn",value:mouseOn});
  if(mouseOn){
    getCursorPosition(canvas, e);
  }
})
