class Game {
    constructor() {
      this.resetTitle = createElement("h2");
      this.resetButton = createButton("");
  
      this.leadeboardTitle = createElement("h2");
  
      this.leader1 = createElement("h2");
      this.leader2 = createElement("h2");
    }
  
    getState() {
      var gameStateRef = database.ref("gameState");
      gameStateRef.on("value", function(data) {
        gameState = data.val();
      });
    }
    update(state) {
      database.ref("/").update({
        gameState: state
      });
    }
  
    start() {
      player = new Player();
      playerCount = player.getCount();
      form = new Form();
      form.display();

      player1 = createSprite(width / 2 - 300, height - 300);
      player1.addAnimation("player1", player1_img);
      player1.scale = 0.5;

      player2 = createSprite(width / 2 - 50, height - 100);
      player2.addAnimation("player2", player2_img);
      player2.scale = 0.5;

      players = [player1,player2];

      energyDrink = new Group();
      coins = new Group();
      obstacles = new Group();
      var obstaclesPositions = [
        { x: width - 80, y: height  - 250, image: obstacle2Image },
        { x: width  - 1500, y: height /2 -150, image: obstacle1Image },
        { x: width  + 2500, y: height /2- 180, image: obstacle1Image },
        { x: width  - 1800, y: height /2- 230, image: obstacle2Image },
        { x: width , y: height /2 - 280, image: obstacle2Image },
        { x: width  - 1800, y: height /2- 330, image: obstacle1Image },
        { x: width  + 1800, y: height /2- 330, image: obstacle2Image },
        { x: width  + 2500, y: height /2- 380, image: obstacle2Image },
        { x: width  - 1500, y: height /2- 430, image: obstacle1Image },
        { x: width  + 2500, y: height /2- 480, image: obstacle2Image },
        { x: width , y: height /2 - 530, image: obstacle1Image },
        { x: width  - 1800, y: height /2- 550, image: obstacle2Image }
      ];
      
      this.addSprites(energyDrink, 4, energyDrinkImg, 0.04);
      this.addSprites(obstacles, obstaclesPositions.length, obstacle2Image, 1, obstaclesPositions)
      this.addSprites(coins , 18, coinImage, 0.05);
    }

    addSprites(spriteGroup, numberOfSprites, spriteImage, scale, position = []) {
        for (var i = 0; i < numberOfSprites; i++) {
          var x, y;
          if (position.length>0){
            x = position[i].x
            y = position[i].y
            spriteImage = position [i].image
           }
           else{
           x = random(-width * 2 , width * 4- 200);
           y = random(height - 150, height / 2 + 30);
    
           var sprite = createSprite(x, y);
           sprite.addImage("sprite", spriteImage);
    
           sprite.scale = scale;
           spriteGroup.add(sprite);
        }
       }
      }
    
      handleElements() {
        form.hide();
        form.titleImg.position(40, 50);
        form.titleImg.class("gameTitleAfterEffect");

        this.resetTitle.html("Reset Game");
        this.resetTitle.class("resetText");
        this.resetTitle.position(width / 2 + 200, 40);

        this.resetButton.class("resetButton");
        this.resetButton.position(width / 2 + 230, 100);

        this.leadeboardTitle.html("Leaderboard");
        this.leadeboardTitle.class("resetText");
        this.leadeboardTitle.position(width / 3 - 60, 40);

        this.leader1.class("leadersText");
        this.leader1.position(width / 3 - 50, 80);

        this.leader2.class("leadersText");
        this.leader2.position(width / 3 - 50, 130);
      }

      play() {
        this.handleElements();
        this.handleResetButton();
    
        Player.getPlayersInfo();
     
        player.getCarsAtEnd();
        if (allPlayers !== undefined) {
          image(track, 0, height, width * 6, height);
          track.scale = 0.00005
          this.showLeaderboard();
    
          //index of the array
          var index = 0;
          for (var plr in allPlayers) {
            //add 1 to the index for every loop
            index = index + 1;
    
            //use data form the database to display the players in x and y direction
            var x = allPlayers[plr].positionX;
            var y = height - allPlayers[plr].positionY;
    
            players[index - 1].position.x = x;
            players[index - 1].position.y = y;
    
            if (index === player.index) {
              stroke(10);
              fill("red");
              ellipse(x, y, 50, 50);
              this.handleFuel(index);
              this.handlePowerCoins(index);
              // Changing camera position in y direction
              camera.position.x = players[index - 1].position.x;
            }
            if(this.playerMoving){
              player.positionX+=5;
              player.update();
            }
          }
          this.handlePlayerControls();
         
          const finshLine = width *4 - 100;

      if (player.positionX > finshLine) {
        gameState = 2;
        player.rank += 1;
        Player.updateCarsAtEnd(player.rank);
        player.update();
        this.showRank();
      }

          drawSprites();
        }
      }

      handleResetButton() {
        this.resetButton.mousePressed(() => {
          database.ref("/").set({
            playerCount: 0,
            gameState: 0,
            players: {}
          });
          window.location.reload();
        });
      }

      showLife() {
        push();
        image(lifeImage, width / 2 - 130, height - player.positionY - 150, 20, 20);
        fill("white");
        rect(width / 2 - 100, height - player.positionY - 150, 185, 20);
        fill("#f50057");
        rect(width / 2 - 100, height - player.positionY - 150, player.life, 20);
        noStroke();
        pop();
      }

      showFuelBar() {
        push();
        image(fuelImage, width / 2 - 130, height - player.positionY - 350, 20, 20);
        fill("white");
        rect(width / 2 - 100, height - player.positionY - 350, 185, 20);
        fill("#ffc400");
        rect(width / 2 - 100, height - player.positionY - 350, player.fuel, 20);
        noStroke();
        pop();
      }
      
      showLeaderboard() {
        var leader1, leader2;
        var players = Object.values(allPlayers);
        if (
          (players[0].rank === 0 && players[1].rank === 0) ||
          players[0].rank === 1
        ) {
          // &emsp;    This tag is used for displaying four spaces.
          leader1 =
            players[0].rank +
            "&emsp;" +
            players[0].name +
            "&emsp;" +
            players[0].score;
    
          leader2 =
            players[1].rank +
            "&emsp;" +
            players[1].name +
            "&emsp;" +
            players[1].score;
        }
    
        if (players[1].rank === 1) {
          leader1 =
            players[1].rank +
            "&emsp;" +
            players[1].name +
            "&emsp;" +
            players[1].score;
    
          leader2 =
            players[0].rank +
            "&emsp;" +
            players[0].name +
            "&emsp;" +
            players[0].score;
        }
    
        this.leader1.html(leader1);
        this.leader2.html(leader2);
      }
    
      handlePlayerControls() {
        if (keyIsDown(UP_ARROW)&& player.positionY < height / 2 - 60) {
          player.positionY += 5;
          player.update();
        }
    
        if (keyIsDown(DOWN_ARROW) && player.positionY > height / 2 - 200) {
          player.positionY -= 5;
          player.update();
        }
    
        if (keyIsDown(RIGHT_ARROW) ) {
          player.positionX += 10;
          player.update();
        }
      }
      handleFuel(index) {
        // Adding fuel
        players[index - 1].overlap(energyDrink, function(collector, collected) {
          player.energy = 185;
          //collected is the sprite in the group collectibles that triggered
          //the event
          collected.remove();
        });
    
        // Reducing Player car fuel
        if (energyDrink.isTouching(players[index-1])){
          player.positionX += 0.8
        }
      }
      
      handlePowerCoins(index) {
        players[index - 1].overlap(coins, function(collector, collected) {
          player.score += 21;
          player.update();
          //collected is the sprite in the group collectibles that triggered
          //the event
          collected.remove();
        });
      }
    
        handleObstacleCollision(index) {
        if (players[index - 1].collide(obstacles)) {
          if (this.leftKeyActive) {
            player.positionX += 100;
          } else {
            player.positionX -= 100;
          }
    
          //Reducing Player Life
          if (player.life > 0) {
            player.life -= 185 / 4;
          }
          
          player.update();
        }
      }
       
      collisionCars(index) {
        if (index === 1){
          if(players[index-1].collide(players[1])){
           if (this.leftKeyActive) {
            player.positionX += 100;
          } else {
            player.positionX -= 100;
          }
    
          //Reducing Player Life
          if (player.life > 0) {
            player.life -= 185 / 4;
          }
          
          player.update();
        }
        if (index === 2){
          if(players[index-1].collide(players[0])){
           if (this.leftKeyActive) {
            player.positionX += 100;
          } else {
            player.positionX -= 100;
          }
    
          //Reducing Player Life
          if (player.life > 0) {
            player.life -= 185 / 4;
          }
          
          player.update();
        }
        }
      }}
    
      showRank() { 
        swal({
          title: `Awesome!${"\n"}Rank${"\n"}${player.rank}`,
          text: "You reached the finish line successfully",
          imageUrl:
            "https://raw.githubusercontent.com/vishalgaddam873/p5-multiplayer-car-race-game/master/assets/cup.png",
          imageSize: "100x100",
          confirmButtonText: "Ok"
        });
      }
    
      gameOver() {
        swal({
          title: `Game Over`,
          text: "Oops you lost the race....!!!",
          imageUrl:
            "https://cdn.shopify.com/s/files/1/1061/1924/products/Thumbs_Down_Sign_Emoji_Icon_ios10_grande.png",
          imageSize: "100x100",
          confirmButtonText: "Thanks For Playing"
        });
      }
      end(){
        console.log("gO")
      }
}