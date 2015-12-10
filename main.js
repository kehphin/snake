  $(document).ready(function () {
  //your code here

  //sprites
  Crafty.sprite(15, 'images/snake.svg', {
    snake: [0, 0]  
 
  }); 
  Crafty.sprite(15, 'images/snakehead.svg', {
    head1: [0, 0],  
    head2: [1, 0],  
    head3: [2, 0],  
    head4: [3, 0],  
 
  }); 
  Crafty.sprite(15, 'images/heart.svg', {
    heart: [0, 0]  
 
  }); 
  Crafty.sprite(23, 'images/big.svg', {
    big: [0, 0]  
 
  }); 
  Crafty.sprite(15, 'images/egg.svg', {
    egg: [0, 0]  
 
  }); 

  // MUSIC

  Crafty.audio.add({
    main: ["sounds/main.mp3"]
  });

  Crafty.audio.add({
    win: ["sounds/win.wav"]
  });

  Crafty.audio.add({
    lose: ["sounds/lose.wav"]
  });

  Crafty.audio.add({
    eat: ["sounds/eat.wav"]
  });

  COLORS = [
    'rgb(255, 0, 0)',
    'rgb(255, 0, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 255, 0)',
    'rgb(0, 0, 255)',
    'rgb(255, 255, 0)',
    'rgb(0, 255, 255)',
    'rgb(0, 255, 255)',
    'rgb(0, 255, 255)',
    'rgb(255, 0, 255)',
    'rgb(100, 100, 100)'
  ];
  
  //generate a random color
  var randColor = function(){
    return 'rgb(' + Crafty.math.randomInt(10, 255) + ',' + Crafty.math.randomInt(100, 255) + ',' + Crafty.math.randomInt(10, 255) + ')';
  };

  var randFeedColor = function(){
    var rand = Crafty.math.randomInt(0, COLORS.length - 1);
    return COLORS[rand];
  };

var hiscores = [];
$.ajax({
  type:"GET",
  dataType: "json",
  crossDomain: true,
  url:"http://snake-kyang.rhcloud.com/hiscores",
  success: function(data){
    hiscores = data;
  }
});


/*
 *
 *
 *BORDER
 *
 *
 *
 */  

 //set border
  var setBorder = function(){
    Crafty.e('2D, Canvas, Color, Border')
          .attr({x: -15, y: 0, w: 15, h: Crafty.viewport.height})
          .color('white');
    Crafty.e('2D, Canvas, Color, Border')
          .attr({x: 0, y: -15, w: Crafty.viewport.width, h: 15})
          .color('white');
    Crafty.e('2D, Canvas, Color, Border')
          .attr({x: Crafty.viewport.width, y: 0, w: 15, h: Crafty.viewport.height})
          .color('white');
    Crafty.e('2D, Canvas, Color, Border')
          .attr({x: 0, y: Crafty.viewport.height, w: Crafty.viewport.width, h: 15})
          .color('white');
  };


/******************************************************************************
 *
 *FOR SNAKE
 *
 *
 *****************************************************************************
 */

  //make a snake
  var startSnake = function(){
    Crafty.e('snakeHead').makeBlock(150, 150, 'e', 'e', randColor()).addPic('head1');  
    Crafty.e('block').makeBlock(150 - BLOCKSIZE, 150, 'e', 'e', randColor());
    Crafty.e('block').makeBlock(150 - BLOCKSIZE * 2, 150, 'e', 'e', randColor());
    Crafty.e('block').makeBlock(150 - BLOCKSIZE * 3, 150, 'e', 'e', randColor());
    Crafty.e('block, tail').makeBlock(150 - BLOCKSIZE * 4, 150, 'e', 'e', randColor());
  }

  //move the snake
  var moveSnake = function(){
      var blocks = Crafty('block');

      var head = Crafty(blocks[0]);
      var last = Crafty(blocks[blocks.length - 1]);


      if (head.x < 15 || head.x > WIDTH || head.y < 15 || head.y > HEIGHT - 15) {
        gameOver();
      }

      if (blocks.length != 0) {
    
        head.moveTo();
        for (var i = 1; i < blocks.length; i++){
          Crafty(blocks[i]).moveTo().eating();
          Crafty(blocks[i]).next_feedColor = Crafty(blocks[i - 1]).current_feedColor;
          Crafty(blocks[i]).next_dir = Crafty(blocks[i - 1]).current_dir;
          Crafty(blocks[i]).x = Crafty(blocks[i - 1]).old_x;
          Crafty(blocks[i]).y = Crafty(blocks[i - 1]).old_y;
        };
      };
  };



/****************************************************************************
 *
 *
 *SNAKE COLORED BLOCKS
 *
 *
 ****************************************************************************
 */

 
 //same colored blocks in range [Num position in Crafty('block')]
  var sameColored = function(color, n){
    var blocks = Crafty('block');
    var acc = [];//store the reference position of blocks
    
    for (var i = 5; i < blocks.length; i++) {
        if (Crafty(blocks[i]).COLOR === color) {
          acc.push(i); };
    };
    //detect range in acc helper function for reduce below
    var detectRange = function(res, el) {
      var subArr = res[res.length - 1];
      if (subArr && (subArr[subArr.length - 1] + 1 == el)) {
        subArr.push(el);
      } else {
        res.push([el]);
      };

      return res;
    };
    
    return acc.reduce(detectRange, [])
              .filter(function(el){
                return el.length >= n;
              });
  };
  
  //make same colored blocks bigger
  var boost = function(color){
    var s = sameColored(color, 2);
    var blocks = Crafty('block');
    var helper = function(arr) {
        arr.map(function(i){
          var b = Crafty(blocks[i]);
          var big = Crafty.e('2D, Canvas, Color, Tween, big, block')
                          .attr({w: b.w + 8, h: b.h + 8, x: b.old_x - 4, y: b.old_y - 4, current_dir: b.current_dir, next_dir: b.next_dir})
                          .color(b.COLOR)
                          .tween({alpha: 0.0}, 20);
          setTimeout(function(){ big.destroy(); }, 200);
        });
    }; 
    s.map(helper);
  };

/****************************************************************************
 *
 *
 *FEEDS
 *
 *
 ****************************************************************************
 */
  var generateFeedStatistic = function(){
    var statistic = {};
    COLORS.map(function(c){
      if (!statistic[c]) {return statistic[c] = 0; };
    });
    return statistic;
  };
//feed statistic
  STATISTIC = generateFeedStatistic();
  

//generate feed
  var generateFeed = function(){
    //detect if snake ate same colored feeds
    var blocks = Crafty('snake');
    var head = Crafty(Crafty('snakeHead')[0]);
    var b1 = Crafty(blocks[blocks.length - 1]);
    var b2 = Crafty(blocks[blocks.length - 2]);
    /*
    for (var i = 0; i < blocks.length; i++){
      var c = Crafty(blocks[i]).COLOR;
      acc.push(c);
    };
    var same = acc.reduce(function(res, el){ });
    */

    var randX = Crafty.math.randomInt(1, GRIDWIDTH - BLOCKSIZE) * BLOCKSIZE;
    var randY = Crafty.math.randomInt(1, GRIDHEIGHT - BLOCKSIZE) * BLOCKSIZE;
    var randTime = Crafty.math.randomInt(3, 10) * 10;
    var feed = Crafty.e('feed').makeFeed(randX, randY, randFeedColor(), randTime);

    if (feed.hit('block') || feed.hit('feed') || feed.hit('Border')) {
      feed.destroy();
      generateFeed();
    }; 
  };

//feed timeout
  var timeOutFeed = function(){
    var feeds = Crafty('feed');
    for (var i = 0; i < feeds.length; i++){
      Crafty(feeds[i]).timeOut -= 1
      Crafty(feeds[i]).setTimeOut(); 
    };
  };

//collision snake && feed
  var collide = function(feed){
    var first = Crafty(Crafty('snake')[0]);
    
    if (!feed.eaten && !feed.timeOuted && feed.hit('snakeHead')) {
      Crafty.audio.play('eat');
      first.next_feedColor = feed.COLOR;
      
      STATISTIC[feed.COLOR] += 1;
      feed.eaten = true;
      boost(feed.COLOR);
      
      feed.destroy();
      
      generateFeed();


      createScore(SCORE += 1)


    } else {
      first.next_feedColor = false;
    };
  }


//gameover
  var gameOver = function(){
    GAMEOVER = true;
    Crafty.audio.play('lose');

    Crafty.e("2D, DOM, Text")
          .attr({ w: 300, h: 20, x: 150, y: 80})
          .text("GAME OVER!")
          .css({ "text-align": "center", "color": "white", "font-size": "300%", "font-style": "bold", "font-family": "Impact"});
    
    if ((hiscores.length < 5) || (SCORE > hiscores[hiscores.length - 1].score)) {
      var name = prompt("Congrats! You have reached the top 5 in Angry Snake! Please enter your name:");   
      Crafty.audio.play('win');
      $.ajax({
        type:"POST",
        dataType: "json",
        crossDomain: true,
        url:"http://snake-kyang.rhcloud.com/hiscores",
        data: {
          username: name,
          score: parseInt(SCORE)
        },
        success: function(data){
          hiscores = data;
          renderScores(hiscores);
        }
      });
    } else {
      renderScores(hiscores);
    }
 }

var renderScores = function(hiscores) {
  yheight = 230
  Crafty.e("2D, DOM, Text")
          .attr({ w: 300, h: 20, x: 150, y: 170})
          .text("HIGH SCORES")
          .css({ "text-align": "center", "color": "white", "font-size": "250%", "font-style": "bold", "font-family": "Impact"});
    
  for (var i=0; i<hiscores.length; i++) {
    var player = hiscores[i];

    Crafty.e("2D, DOM, Text")
          .attr({ w: 300, h: 20, x: 150, y: yheight})
          .text(i+1 + ". " + player.username + ": " + player.score)
          .css({ "text-align": "center", "color": "white", "font-size": "150%", "font-style": "bold", "font-family": "Impact"});
    yheight += 40;
  }
}

 var createScore = function(score) {
  var scores = Crafty('Score');

  if (scores.length) {
    Crafty(scores[0]).destroy();
  }

  Crafty.e("2D, DOM, Text, Score")
          .attr({ w: 300, h: 20, x: 150, y: 20})
          .text(score.toString())
          .css({ "text-align": "center", "color": "white", "font-size": "200%", "font-style": "bold", "font-family": "Impact"}); 
 }
 var SCORE = 0;
 var GAMEOVER = false;

//main scene
Crafty.scene('main', function(){
  Crafty.background("black");
  //Initialize Timer
  var Timer = Crafty.e("Timer").reset(); 

  //set Border
  setBorder(); 

  //create a snake
  startSnake();

  //create feed
  generateFeed();

  Crafty.audio.play('main', -1, 0.3)

  createScore(SCORE);
  
  //make a palette
  var makePalette = function() {
    var palette = {};
    COLORS.map(function(c) {
      var randTime = Crafty.math.randomInt(10, 30);
      if (!palette[c]){
        palette[c] = {timer: randTime, counter: 0};
      }
    });
    return palette;
  };


  //create a world
  var world = Crafty.e('2D, Canvas')
    .attr({score: 0, lives: 3, palette: makePalette()})
    .bind('timerTick', function(e){
      if (!GAMEOVER) {
        //move Snake
        moveSnake();
        //feeds
        timeOutFeed();

        //detect collision
        var blocks = Crafty('block');
        var feeds = Crafty('feed');

        for (var i = 0; i < feeds.length; i++){
          collide(Crafty(feeds[i]));
        };

        var biteSelf = Crafty(blocks[0]).hit('block');
        if (biteSelf) {
          gameOver();
        }
      }
    })  
    .bind('KeyDown', function(e){
      var blocks = Crafty('block');
      var head = Crafty(blocks[0]);
      var _changeDir = function(dir){
         head.removeComponent(head.pic);
         head.current_dir = dir;
         head.next_dir = dir;
         for (var i = 1; i < blocks.length; i++){
           Crafty(blocks[i]).next_dir = Crafty(blocks[i-1]).current_dir;
         };
      }
      if (!Timer.STOP) {
        switch(e.keyCode){
          case Crafty.keys.RIGHT_ARROW:
            if (head.current_dir != "w"){
              _changeDir('e');
              head.addComponent('head1');
            }
          break;

          case Crafty.keys.LEFT_ARROW:
            if (head.current_dir != "e"){
              _changeDir('w');
              head.addComponent('head3');
            }
          break;

          case Crafty.keys.UP_ARROW:
            if (head.current_dir != "s"){
              _changeDir('n');
              head.addComponent('head4');
            }
          break;

          case Crafty.keys.DOWN_ARROW:
            if (head.current_dir != "n"){
              _changeDir('s');
              head.addComponent('head2');
            }
          break;

          case Crafty.keys.SPACE:
              Timer.stop();
          break;

          default:
            return;
          break;
        }

      } else {
          if (e.keyCode == Crafty.keys.SPACE) {Timer.resume();};
      }
    })
})

  //component block
      Crafty.c("block", {
          init: function(){
            this.addComponent("2D,Canvas,Color,Tween, Collision, snake")
                .attr({w: BLOCKSIZE, h: BLOCKSIZE});  
          },
          makeBlock: function(x, y, current_dir, next_dir, color){
            this.attr({x: x, y: y, current_dir: current_dir, next_dir: next_dir, COLOR: color, current_feedColor: false, next_feedColor: false})
                .color(color);
            return this;
          },
          moveTo: function(){
            if (this.hit('Border')) {
              this.x = this.old_x;
              this.y = this.old_y;
              return this;
            } else {
              this.attr({old_x: this.x, old_y: this.y})
                  .move(this.current_dir, BLOCKSIZE);
              this.current_dir = this.next_dir; 
              return this;
            }
          },
          eating: function(){
            if (this.current_feedColor){
              var big = Crafty.e('2D, Canvas, Color, Tween, big')
                              .attr({w: this.w + 8, h: this.h + 8, x: this.x - 4, y: this.y - 4})
                              .color(this.COLOR)
                              .tween({alpha: 0.0}, 20);
              window.setTimeout(function(){big.destroy(); }, 200);
              if (this.has('tail')){
                Crafty.e('block, tail').makeBlock(this.x, this.y, "", this.current_dir, this.current_feedColor);
                this.removeComponent('tail');
              }
            };
              this.current_feedColor = this.next_feedColor;
              return this;
          },
      });
    //snake head
      Crafty.c('snakeHead', {
        init: function(){
           this.requires('block')
               .addComponent('Collision')
               .removeComponent('snake')
        },

        addPic: function(pic) {
           this.attr({pic: pic})
               .addComponent(pic);
        return this;
        }
/*
        makeHead: function(x, y, current_dir, next_dir, color){
          this.attr({x: x, y: y, current_dir: current_dir, next_dir: next_dir, COLOR: color})
              .color(color);
          return this;
        },
*/
      });

 //feed
    Crafty.c('feed', {
      init: function(){
        this.addComponent('2D, Canvas, Color, Tween, Collision, egg')
            .attr({w: BLOCKSIZE, h: BLOCKSIZE});
      },

      makeFeed: function(x, y, color, timeOut){
        this.attr({x: x, y: y, COLOR: color, timeOut: timeOut, eaten: false, timeOuted: false})
            .color(color);
        return this;
      },
      
      fadeOut: function(){
            this.removeComponent('Collision')
                .tween({alpha: 0.0}, 20);
            return this;
      },

      setTimeOut: function(){
            if (this.timeOut == 0 && !this.timeOuted) {
              this.fadeOut();
              this.timeOuted = true;
              Crafty.e('2D, Canvas, Color, Tween, Gravity, Collision, Border')
                    .attr({w: this.w, h: this.h, x: this.x, y: this.y})
                    .color(this.COLOR)
                    .gravity('2D')
                    .color('white');
              this.destroy();
              generateFeed();
            };
      },


    });
 //achievements
    Crafty.c('Achievement',{
      init: function(){
        this._image = Crafty.e('2D, DOM, Image, Tween').image('images/achievement.png').attr({x: 30, y: 30});
        this._text = "Set the Text";
        this._center = WIDTH / 2 - ((this._text.length * 15) / 2);
        this._textElement = Crafty.e('2D, DOM, Text, Tween').text(this._text).textColor('#dacfca').attr({x: this._center, y: 110, w:400}).textFont({weight: 'bold', size: '20px', family: 'Arial'});

        this._image.tween({alpha: 0.0}, 200);
        this._textElement.tween({alpha: 0.0}, 200);
      },

      text: function(newText) {
        this._text = newText;
        this._center = WIDTH / 2 - ((this._text.length * 12) / 2) ;
        this._textElement.attr({x: this._center}).text(this._text);
      }
     
    });

  });

