'use strict'

var rows = 5;
var cols = 10;
var scl = 25;
var spdScl = 2;
var cThresh = 5;
var lives = 5;
var invaders = [];
var playerDead = false;
var pauseGame = false;
var paddle;
var ball;
var score = 0;
var oldScore = 0;
var highScore = (getCookie("highscore") === "") ? 0 : getCookie("highscore");

var automated = false;

function setCookie(cname, cvalue) {
    document.cookie = cname + "=" + cvalue + ";path=/";
}

function getCookie(cname) {
    var name = cname + "=";
    var ca = document.cookie.split(';');
    for(var i = 0; i < ca.length; i++) {
        var c = ca[i];
        while (c.charAt(0) == ' ') {
            c = c.substring(1);
        }
        if (c.indexOf(name) == 0) {
            return c.substring(name.length, c.length);
        }
    }
    return "";
}

function windowResized(){
	resizeCanvas((1.5 * (cols + 2)) * scl, (1.5 * (rows + 2)) * scl + 100);
	$("canvas").css("left", ((windowWidth - width)/2) + "px");
	$("canvas").css("top", ((windowHeight - height)/2) + "px");
}

function Invader(x, y, hue){
	this.x = x;
	this.y = y;
	this.fill = hue;
	this.dead = false;
	
	this.show = function(){
		this.rawX = (scl * 1.5) * this.x + (width - (cols * (scl * 1.5)))/2 + scl * 0.25
		this.rawY = (scl * 1.5) * this.y + (height - (rows * (scl * 1.5)))/2;
		colorMode(HSB);
		fill(this.fill, 100, 100);
		colorMode(RGB);
		if(!this.dead){
			var killed = ball.bounce([this.rawX, this.rawY, scl, scl]);
			if(killed){
				this.dead = true;
				score += 1;
			}else{
				rect(this.rawX, this.rawY, scl, scl, scl/5);
			}
		}
	}
	
}

function addInvaders(){
	var x = 0;
	var y = 0;
	var hue = 0;
	for(var i = 0; i < rows; i++){
		var row = [];
		x = 0;
		hue = map(i, 0, rows - 1, 0, 320);
		for(var j = 0; j < cols; j++){
			row.push(new Invader(x, y, hue));
			x += 1;
		}
		invaders.push(row);
		y += 1;
	}
}

function Paddle(){
	this.x = width/2 - scl;
	
	this.collisionTest = function(){
		ball.bounce([this.x, height - 30, scl * 2, scl / 2]);
	}
	
	this.move = function(x){
		x = constrain(x - scl, 20, width - scl * 2 - 20);
		this.x = x;
	}
	
	this.show = function(){
		noStroke();
		fill(0, 255, 100);
		rect(this.x, height - 30, scl * 2, scl / 2, scl / 4);
	}
}

function Ball(){
	this.w = scl * 0.8;
	this.h = scl * 0.8;
	this.speed = [0, 0];
	this.x = width/2;
	this.y = height - 30 - this.h/2 - 10;
	
	this.bounce = function(obj){
		var collision = false;
		if(this.x >= obj[0] - this.w/2 && this.x <= obj[0] + obj[2] + this.w/2 && this.y + this.h/2 >= obj[1] - cThresh && this.y + this.h/2 <= obj[1] + cThresh && this.speed[1] > 0){
			collision = true;
			this.speed[1] += 0.1;
			this.speed[1] = constrain(this.speed[1], -2, 2);
			this.speed[1] *= -1;
			if(this.x - obj[0] < scl/4 && this.speed[0] > 0){
				this.speed[0] *= -1
			}else if(this.x - obj[0] > obj[2] - scl/4 && this.speed[0] < 0){
				this.speed[0] *= -1;
			}
		}else if(this.x >= obj[0] - this.w/2 && this.x <= obj[0] + obj[2] + this.w/2 && this.y - this.h/2 >= obj[1] + obj[3] - cThresh && this.y - this.h/2 <= obj[1] + obj[3] + cThresh && this.speed[1] < 0){
			collision = true;
			this.speed[1] -= 0.1;
			this.speed[1] = constrain(this.speed[1], -2, 2);
			this.speed[1] *= -1;
			if(this.x - obj[0] < scl/4 && this.speed[0] > 0){
				this.speed[0] *= -1
			}else if(this.x - obj[0] > obj[2] - scl/4 && this.speed[0] < 0){
				this.speed[0] *= -1;
			}
		}else if(this.y >= obj[1] - this.h/2 && this.y <= obj[1] + obj[3] + this.h/2 && this.x + this.w/2 >= obj[0] - cThresh && this.x + this.w/2 <= obj[0] + cThresh && this.speed[0] > 0){
			collision = true;
			this.speed[0] += 0.1;
			this.speed[0] = constrain(this.speed[0], -2, 2);
			this.speed[0] *= -1;
			if(this.y - obj[1] < scl/4 && this.speed[1] > 0){
				this.speed[1] *= -1
			}else if(this.y - obj[1] > obj[3] - scl/4 && this.speed[1] < 0){
				this.speed[1] *= -1;
			}
		}else if(this.y >= obj[1] - this.h/2 && this.y <= obj[1] + obj[3] + this.h/2 && this.x - this.w/2 >= obj[0] + obj[2] - cThresh && this.x - this.w/2 <= obj[0] + obj[2] + cThresh && this.speed[0] < 0){
			collision = true;
			this.speed[0] -= 0.1;
			this.speed[0] = constrain(this.speed[0], -2, 2);
			this.speed[0] *= -1;
			if(this.y - obj[1] < scl/4 && this.speed[1] > 0){
				this.speed[1] *= -1
			}else if(this.y - obj[1] > obj[3] - scl/4 && this.speed[1] < 0){
				this.speed[1] *= -1;
			}
		}
		return collision;
	}
	this.update = function(){
		this.x += spdScl * this.speed[0];
		this.y += spdScl * this.speed[1];
		if(this.y + this.h/2 >= height){
			die();
		}else if(this.x - this.w/2 < 0){
			this.x = this.w/2;
			this.speed[0] *= -1;
		}else if(this.x + this.w/2 > width){
			this.x = width - this.w/2;
			this.speed[0] *= -1;
		}else if(this.y - this.h/2 < 0){
			this.y = this.h/2;
			this.speed[1] *= -1;
		}
	}
	this.show = function(){
		noStroke();
		fill(255)
		ellipse(this.x, this.y, this.w, this.h);
	}
}

function setup(){
	createCanvas((1.5 * (cols + 2)) * scl, (1.5 * (rows + 2)) * scl + 100);
	$("canvas").css("left", ((windowWidth - width)/2) + "px");
	$("canvas").css("top", ((windowHeight - height)/2) + "px");
	paddle = new Paddle();
	addInvaders();
	ball = new Ball();
}

function draw(){
	background(10);
	for(var i = 0; i < invaders.length; i++){
		for(var j = 0; j < invaders[i].length; j++){
			if(invaders[i][j]){
				invaders[i][j].show();
			}
		}
	}
	if(score - oldScore === rows * cols){
		restart();
	}
	paddle.collisionTest();
	paddle.show();
	ball.update();
	ball.show();
	
	if(automated){
		paddle.move(ball.x);
	}
	
	if(playerDead){
		dead();
	}
	
	fill(255);
	noStroke();
	textFont("monospace");
	textSize(20);
	textAlign(LEFT, TOP);
	text("SCORE: " + score, 10, 10);
	textAlign(RIGHT, TOP);
	text("LIVES: " + lives, width - 10, 10);
	if(score > highScore){
		highScore = score;
	}
	textSize(12);
	textAlign(LEFT, BOTTOM);
	text("HIGHSCORE: " + highScore, 10, height - 10);
}

function keyPressed(){
	console.log(keyCode);
	if(keyCode === 32){
		if(pauseGame){
			pauseGame = false;
			loop();
		}else{
			pauseGame = true;
			noLoop();
		}
	}else if(keyCode === 73){
		automated = (automated) ? false : true;
	}
	return false;
}

function mouseMoved(){
	if(!automated){
		paddle.move(mouseX);
	}
	return false;
}

function mousePressed(){
	if(!playerDead){
		if(ball.speed[0] === 0 && ball.speed[1] === 0){
			ball.speed = [(round(random(2)) === 1) ? 1 : -1, 1];
		}
	}else{
		if(mouseX > width/2 - 75 && mouseX < width/2 + 75 && mouseY > height/2 && mouseY < height/2 + 50){
			rows = 5;
			cols = 10;
			spdScl = 2;
			lives = 5;
			invaders = [];
			playerDead = false;
			pauseGame = false;
			automated = false;
			score = 0;
			oldScore = 0;
			paddle = new Paddle();
			addInvaders();
			resizeCanvas((1.5 * (cols + 2)) * scl, (1.5 * (rows + 2)) * scl + 100);
			$("canvas").css("left", ((windowWidth - width)/2) + "px");
			$("canvas").css("top", ((windowHeight - height)/2) + "px");
			ball = new Ball();
			loop();
		}
	}
	return false;
}

function dead(){
	if(score > highScore){
		highScore = score;
	}
	noLoop();
	background(10)
	fill(255);
	noStroke();
	textFont("monospace");
	textSize(40);
	textAlign(CENTER, CENTER);
	text("game over", width/2, height/2 - 50);
	textSize(25);
	text("restart", width/2, height/2 + 25);
	noFill();
	stroke(255);
	rect(width/2 - 75, height/2, 150, 50, 5);
	setCookie("highscore", highScore);
}

function die(){
	if(lives > 0){
		spdScl = 2;
		lives -= 1;
		ball.speed = [0, 0];
		ball.x = width/2;
		ball.y = height - 30 - ball.h/2 - 10;
	}else{
		playerDead = true;
	}
}
function restart(){
	oldScore = score;
	console.log(oldScore)
	spdScl = 2;
	lives += 1;
	playerDead = false;
	pauseGame = false;
	paddle = new Paddle();
	rows += 1;
	cols += 1;
	invaders = [];
	addInvaders();
	resizeCanvas((1.5 * (cols + 2)) * scl, (1.5 * (rows + 2)) * scl + 100);
	$("canvas").css("left", ((windowWidth - width)/2) + "px");
	$("canvas").css("top", ((windowHeight - height)/2) + "px");
	ball = new Ball();
	invaders = [];
	addInvaders();
}