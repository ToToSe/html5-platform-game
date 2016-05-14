var Game = function(game) {};

Game.prototype = {
  
  preload: function () {
    this.optionCount = 1;
  },

  update: function() {
    player.body.velocity.x = 0;  
    this.checkCollide();
    this.moving_platformsPosition();
    this.controls();
  },
  
  create: function () {
    game.physics.startSystem(Phaser.Physics.ARCADE);
    game.stage.backgroundColor = "#ADE6FF";
    this.initMap();
    this.initLayers();
    this.initPlayer();
    game.camera.follow(player);
    this.initObjects();
    this.initHud();
    this.showLevel(0);
  },
  
  controls: function () {
    if (allow_move) {
        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
        {
            facing = 'left';
            player.animations.play('walk_left');
            player.body.velocity.x = -450 * speed;
        } else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT)) {
            facing = 'right';
            player.animations.play('walk_right');
            player.body.velocity.x = 450 * speed;
        }

        var standing = player.body.blocked.down || player.body.touching.down;

        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && ((standing && game.time.now > jumpTimer) || inWater)) {
            jump_audio.play();
            player.body.velocity.y = -800;
            jumpTimer = game.time.now + 750;
        }
        
        if (!standing) {
            if(facing == 'left') {
                player.animations.play('jump_left');
            } else {
                player.animations.play('jump_right');
            }
        }
        if (standing && !game.input.keyboard.isDown(Phaser.Keyboard.RIGHT) && !game.input.keyboard.isDown(Phaser.Keyboard.LEFT)) {
            player.animations.play('stand_' + facing);
        }
    }  
  },
  
  checkCollide: function () {
    game.physics.arcade.collide(player, layerFloor);
    game.physics.arcade.collide(player, layerLave, this.dead);
    
    game.physics.arcade.overlap(player, keys1, this.collideKey, null, this);
    game.physics.arcade.overlap(player, keys2, this.collideKey, null, this);
    game.physics.arcade.overlap(player, keys3, this.collideKey, null, this);
    game.physics.arcade.overlap(player, keys4, this.collideKey, null, this);    
    
    game.physics.arcade.collide(keys1, layerFloor);
    game.physics.arcade.collide(keys2, layerFloor);
    game.physics.arcade.collide(keys3, layerFloor);
    game.physics.arcade.collide(keys4, layerFloor);
    
    game.physics.arcade.collide(player, layerStop1, this.collideStop, null, this);
    game.physics.arcade.collide(player, layerStop2, this.collideStop, null, this);
    game.physics.arcade.collide(player, layerStop3, this.collideStop, null, this);
    game.physics.arcade.collide(player, layerStop4, this.collideStop, null, this);    
    
    game.physics.arcade.overlap(player, golds, this.collideCoin, null, this);
    game.physics.arcade.overlap(player, bronzes, this.collideCoin, null, this);
    game.physics.arcade.overlap(player, fires, this.collideBonus, null, this);
    game.physics.arcade.overlap(player, stars, this.collideBonus, null, this);
    
    game.physics.arcade.overlap(player, checkpoints, this.collideCheckpoint, null, this);
    game.physics.arcade.collide(checkpoints, layerFloor);  
    
    game.physics.arcade.collide(player, spikes, this.dead, null, this);    
    game.physics.arcade.collide(spikes, layerFloor);  
          
    game.physics.arcade.collide(player, bounces, this.collideBounce);
    game.physics.arcade.collide(bounces, layerFloor);
    
    game.physics.arcade.collide(player, moving_platforms);
    
    game.physics.arcade.overlap(player, lifes_bonus, this.collideLife, null, this);
    
    game.physics.arcade.collide(player, boxs);
    game.physics.arcade.collide(boxs, boxs);   
     
    game.physics.arcade.collide(boxs, layerFloor);
    game.physics.arcade.overlap(player, layerWater, function(player, window) {
        if (window.collideDown) {
            inWater = true;
            player.body.gravity.y = 5000;
        } else {
            inWater = false;
            player.body.gravity.y = 1500;
        }
    });  
  },
  
  moving_platformsPosition: function () {
    moving_platforms.forEach(function(item) {
        if(item.body.x >= (item.begin * 70) + (item.distance * 70)){
            item.body.velocity.x = -120;
        }
    
        if(item.body.x <= (item.begin * 70)){
            item.body.velocity.x = 120;
        }
    });
  },
  
  initPlayer: function () {
    player = game.add.sprite(50, 200, 'p1', 'p1_jump1.png');
    game.physics.arcade.gravity.y = 900;
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
    player.body.gravity.y = 1500;
    player.body.maxVelocity.y = 1500;
    
    player.animations.add('walk_right',  Phaser.Animation.generateFrameNames('p1_walk', 1, 11, '.png' , 2), 35, false, false);
    player.animations.add('walk_left',  Phaser.Animation.generateFrameNames('p1_walkL', 1, 11, '.png' , 2), 35, false, false);
    player.animations.add('jump_right',  Phaser.Animation.generateFrameNames('p1_jump', 1, 1, '.png' ), 10, false, false);
    player.animations.add('jump_left',  Phaser.Animation.generateFrameNames('p1L_jump', 1, 1, '.png' ), 10, false, false)
    player.animations.add('hurt_right', Phaser.Animation.generateFrameNames('p1_hurt', 1, 1, '.png' ), 10, false, false);
    player.animations.add('hurt_left', Phaser.Animation.generateFrameNames('p1L_hurt', 1, 1, '.png' ), 10, false, false);
    player.animations.add('stand_right', Phaser.Animation.generateFrameNames('p1_walk', 1, 1, '.png', 2), 10, false, false);
    player.animations.add('stand_left', Phaser.Animation.generateFrameNames('p1_walkL', 1, 1, '.png', 2), 10, false, false);
    
  },
  
  initMap: function () {
    map = game.add.tilemap('map');
    map.addTilesetImage('tiles', 'tiles');
    map.addTilesetImage('water', 'water'); 
    map.addTilesetImage('water_top', 'water_top');   
    map.addTilesetImage('lave_body', 'lave_body');           
    map.addTilesetImage('lave_top', 'lave_top');    
    map.addTilesetImage('right', 'right');           
    map.addTilesetImage('exit', 'exit');           
    map.addTilesetImage('wall', 'wall');
    map.addTilesetImage('stop1', 'stop1');                      
    map.addTilesetImage('stop2', 'stop2');                      
    map.addTilesetImage('stop3', 'stop3');                      
    map.addTilesetImage('stop4', 'stop4');                                                
  },
  
  initLayers: function () {
    layerFloor = map.createLayer('floor');
    layerFloor.resizeWorld();
    map.setCollisionByExclusion([0],true, layerFloor);
    
    layerWater = map.createLayer('water');
    layerWater.resizeWorld();
    map.setCollisionByExclusion([0],true, layerWater);
    
    layerLave = map.createLayer('lave');
    layerLave.resizeWorld();
    map.setCollisionByExclusion([0],true, layerLave);
    
    layerBack = map.createLayer('back');
    layerBack.resizeWorld();
    
    layerStop1 = map.createLayer('stop1');
    layerStop1.resizeWorld();
    map.setCollisionByExclusion([0],true, layerStop1);
    
    layerStop2 = map.createLayer('stop2');
    layerStop2.resizeWorld();
    map.setCollisionByExclusion([0],true, layerStop2);
    
    layerStop3 = map.createLayer('stop3');
    layerStop3.resizeWorld();
    map.setCollisionByExclusion([0],true, layerStop3);
    
    layerStop4 = map.createLayer('stop4');
    layerStop4.resizeWorld();
    map.setCollisionByExclusion([0],true, layerStop4);
  },

  initObjects: function() {
    levels = game.add.group();
    levels.enableBody = true;
    map.createFromObjects('levels', 'level', null, 0, true, false, levels);
    levels.setAll('body.allowGravity', false);
    
    golds = game.add.group();
    golds.enableBody = true;
    map.createFromObjects('golds', 'gold', 'gold', 0, true, false, golds);
    golds.setAll('body.allowGravity', false);
    golds.callAll('animations.add', 'animations', 'spin', Phaser.Animation.generateFrameNames('gold_', 1, 6, '.png' ), 10, true, false);
    golds.callAll('animations.play', 'animations', 'spin');
    
    lights = game.add.group();
    lights.enableBody = true;
    map.createFromObjects('lights', 'light', 'light', 0, true, false, lights);
    lights.setAll('body.allowGravity', false);
    lights.callAll('animations.add', 'animations', 'bulp', Phaser.Animation.generateFrameNames('tochLit', 1, 2, '.png'), 5, true, false);
    lights.callAll('animations.play', 'animations', 'bulp');
    
    fires = game.add.group();
    fires.enableBody = true;
    map.createFromObjects('fires', 'fire', 'fire', 0, true, false, fires);
    fires.setAll('body.allowGravity', false);
    
    stars = game.add.group();
    stars.enableBody = true;
    map.createFromObjects('stars', 'star', 'star', 0, true, false, stars);
    stars.setAll('body.allowGravity', false);
    
    bronzes = game.add.group();
    bronzes.enableBody = true;
    map.createFromObjects('bronzes', 'bronze', 'bronze', 0, true, false, bronzes);
    bronzes.setAll('body.allowGravity', false);
    bronzes.callAll('animations.add', 'animations', 'spin', Phaser.Animation.generateFrameNames('bronze_', 1, 6, '.png' ), 10, true, false);
    bronzes.callAll('animations.play', 'animations', 'spin');
    
    checkpoints = game.add.group();
    checkpoints.enableBody = true;
    map.createFromObjects('checkpoints', 'check', 'check', 0, true, false, checkpoints);
    checkpoints.setAll('body.allowGravity', true);
    checkpoints.setAll('body.immovable', true);  
    checkpoints.setAll('physics.arcade.gravity.y', 900);      
    game.physics.enable(checkpoints, Phaser.Physics.ARCADE);
    
    keys1 = game.add.group();
    keys1.enableBody = true;
    map.createFromObjects('key1', 'key', 'key1', 0, true, false, keys1);
    keys1.setAll('body.allowGravity', true);
    keys1.setAll('body.immovable', true);  
    keys1.setAll('physics.arcade.gravity.y', 900);      
    game.physics.enable(keys1, Phaser.Physics.ARCADE);
    
    keys2 = game.add.group();
    keys2.enableBody = true;
    map.createFromObjects('key2', 'key', 'key2', 0, true, false, keys2);
    keys2.setAll('body.allowGravity', true);
    keys2.setAll('body.immovable', true);  
    keys2.setAll('physics.arcade.gravity.y', 900);      
    game.physics.enable(keys2, Phaser.Physics.ARCADE);
    
    keys3 = game.add.group();
    keys3.enableBody = true;
    map.createFromObjects('key3', 'key', 'key3', 0, true, false, keys3);
    keys3.setAll('body.allowGravity', true);
    keys3.setAll('body.immovable', true);  
    keys3.setAll('physics.arcade.gravity.y', 900);      
    game.physics.enable(keys3, Phaser.Physics.ARCADE);
    
    keys4 = game.add.group();
    keys4.enableBody = true;
    map.createFromObjects('key4', 'key', 'key4', 0, true, false, keys4);
    keys4.setAll('body.allowGravity', true);
    keys4.setAll('body.immovable', true);  
    keys4.setAll('physics.arcade.gravity.y', 900);      
    game.physics.enable(keys4, Phaser.Physics.ARCADE);
    
    spikes = game.add.group();
    spikes.enableBody = true;
    map.createFromObjects('spikes', 'spike', 'spikes', 0, true, false, spikes);
    spikes.setAll('body.allowGravity', true);
    spikes.setAll('body.immovable', true);  
    spikes.setAll('physics.arcade.gravity.y', 900);      
    game.physics.enable(spikes, Phaser.Physics.ARCADE);
    
    moving_platforms = game.add.group();
    moving_platforms.enableBody = true;
    map.createFromObjects('moving_platforms', 'moving_platform', 'moving_platform', 0, true, false, moving_platforms);
    moving_platforms.setAll('body.allowGravity', false);
    moving_platforms.setAll('body.immovable', true);  
    moving_platforms.setAll('body.velocity.x', 120);   
    game.physics.enable(moving_platforms, Phaser.Physics.ARCADE);
    
    bounces = game.add.group();
    bounces.enableBody = true;
    map.createFromObjects('bounces', 'bounce', 'bounce', 0, true, false, bounces);
    bounces.setAll('body.allowGravity', true);
    bounces.setAll('body.immovable', true);  
    bounces.setAll('physics.arcade.gravity.y', 900);      
    game.physics.enable(bounces, Phaser.Physics.ARCADE);
    
    boxs = game.add.group();
    boxs.enableBody = true;
    map.createFromObjects('boxs', 'box', 'box', 0, true, false, boxs);
    boxs.setAll('body.allowGravity', true);
    boxs.setAll('body.immovable', true);  
    game.physics.enable(boxs, Phaser.Physics.ARCADE);
    
    lifes_bonus = game.add.group();
    lifes_bonus.enableBody = true;
    map.createFromObjects('lifes', 'life', 'life_icon', 0, true, false, lifes_bonus);
    lifes_bonus.setAll('body.allowGravity', false);
    
    player.bringToTop();
  },
  
  initHud: function () {
    scoreIcon = game.add.sprite(200, 200, 'score_icon');
    scoreIcon.fixedToCamera = true;
    scoreIcon.cameraOffset.setTo(10, game.camera.height - 71);
    
    lifeIcon = game.add.sprite(200, 200, 'life_icon');
    lifeIcon.fixedToCamera = true;
    lifeIcon.cameraOffset.setTo(game.camera.width - 120, game.camera.height - 71);
    
    scoreText = game.add.text(16, 16, score, { fontSize: '25px', fill: '#000' });
    scoreText.fixedToCamera = true;
    scoreText.fill = '#FFFFFF';
    scoreText.font = 'Arial';
    scoreText.cameraOffset.setTo(75, game.camera.height - 62);
    
    lifeText = game.add.text(16, 16, lifes, { fontSize: '25px', fill: '#000' });
    lifeText.fixedToCamera = true;
    lifeText.fill = '#FFFFFF';
    lifeText.font = 'Arial';
    lifeText.cameraOffset.setTo(game.camera.width - 60, game.camera.height - 62);
  },
    
    collideCoin: function (player, coin) {
        console.log(coin.key);
        if (coin.key == 'bronze') {
            score += 10;
        } else {
            score += 50;
        }
        coin_audio.play();
        coin.kill();
        scoreText.text = score;
    },
    
    collideCheckpoint: function (player, checkpoint) {
        if (checkpoint.key != 'check_done') {
            last_checkpoint = [checkpoint.x, checkpoint.y];
            checkpoint.loadTexture('check_done', 0);
            checkpoint_text = game.add.text(50, 50, "Checkpoint saved ...");    
            checkpoint_text.font = 'Arial';
            checkpoint_text.fill = '#FFFFFF';
            checkpoint_text.fixedToCamera = true;
            checkpoint_text.cameraOffset.setTo(game.camera.width - 300, 20);
            checkpoint_text.alpha = 1;
            game.time.events.add(2000, function() {
                game.add.tween(checkpoint_text).to({y: 0}, 1500, Phaser.Easing.Linear.None, true);
                game.add.tween(checkpoint_text).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true);
            }, this);
        }
    },
    
    collideStop: function (player, stop) {
          if (gotKey.indexOf(stop.layer.properties.key) > -1) {
              stop.collideDown = false;
              stop.collideUp = false;
              stop.collideRight = false;
              stop.collideLeft = false;              
              eval('game.add.tween(layerStop'+stop.layer.properties.keyNb+').to({alpha: 0}, 700, Phaser.Easing.Linear.None, true);');
              this.showLevel(stop.layer.properties.keyNb);
          }
    },
    
    collideKey: function (player, key) {
        gotKey.push(key.key);
        key.kill();
    },
    
    collideLife: function (player, life) {
        life.kill();
        bonus_audio.play();
        lifes++;
        lifeText.text = lifes;
    },
    
    dead: function (player, spike) {
        if (!allow_move) {
            return;
        }
        allow_move = false;
        player.animations.play('hurt_right');
        lifes--; 
        deadTo = player.y + (game.camera.height - player.y) + 70;
        tween = game.add.tween(player).to({y: deadTo}, 1000, Phaser.Easing.Back.In, true);
        tween.onComplete.add(function() {
            if (!lifes) {
                alert('GAME OVER');
            }
            allow_move = true;
            lifeText.text = lifes;
            player.x = last_checkpoint[0];
            player.y = last_checkpoint[1] - 80;  
        }, this);
    },
    
    collideBounce: function (player, bounce) {
        if (!bounce.body.touching.up) {
            return;
        }
        bounce.loadTexture('bounce_up', 0);
        jump_audio.play();
        player.body.velocity.y = -1200;
        jumpTimer = game.time.now + 750;
        
        setTimeout(function() {
            bounce.loadTexture('bounce', 0);
        }, 500);
    },
    
    collideBonus: function (player, bonus) {
        switch (bonus.key) {
            case 'fire':
                console.log('fire');
                player.body.x = 257 * 70;
                player.body.y = 0 * 70;                
                break;
            case 'star':
                speed = 2;
                setTimeout(function() {
                   speed = 1; 
                }, 5000);
                break;
        }
        bonus.kill();
        bonus_audio.play();
    },
    
    showLevel: function (level) {
        level++;
        if (gotLevel.indexOf(level) > -1) {
            return;
        }
        
        gotLevel.push(level);
        text = game.add.text(50, 50, "LEVEL " + level);
        text.font = 'Arial';
        
        text.fixedToCamera = true;
        text.cameraOffset.setTo(50, 50);
                        
        text.fontSize = 60;
        
        text.fill = '#FFFFFF';

        text.align = 'center';
        text.stroke = '#FFFFFF';
        text.strokeThickness = 2;
        text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 5);

        text.inputEnabled = true;
        setTimeout(function () {
            game.add.tween(text).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true);
        }, 2000);
    }
};