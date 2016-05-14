var game = new Phaser.Game(1024, window.innerHeight, Phaser.AUTO, 'html_game', 
{ preload: preload, create: create,  update: update, render: render });

var bunny = 'bunny2'

WebFontConfig = {

    active: function() { game.time.events.add(Phaser.Timer.SECOND, createText, this); },

    google: {
      families: ['Chango']
    }

};
var fragile = [];
var allow_move = true;
var last_checkpoint;
var score = 0;
var lifes = 3;
var scoreText;
var lifes_bonus;
var checkpoints;
var checkpoint_text;
var bonus_audio;
var lifeText;
var coin_audio;
var audio;
var jump_audio;
var map,
    player,
    layerDie,
    layerFloor,
    layerFloor_bump;
    
var jumpTimer = 0;

function preload() { 
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    game.load.tilemap('map', 'map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'tiles.png');
    game.load.image('score_icon', 'PNG/HUD/coin_gold.png');
    game.load.image('life_icon', 'PNG/HUD/lifes.png');    
    game.load.image('ground_grass_small', 'PNG/Environment/ground_grass_small.png');
    game.load.image('ground_cake_small', 'PNG/Environment/ground_cake_small.png');    
    game.load.image('ground_grass_small_broken', 'PNG/Environment/ground_grass_small_broken.png');    
    game.load.image('spikes_top', 'PNG/Environment/spikes_top.png');
    game.load.atlasJSONArray('coin', 'coins.png', 'coins.json');
    game.load.atlasJSONArray('coinB', 'coins_b.png', 'coins_b.json');
    
    game.load.image('life', 'PNG/Items/powerup_bunny.png');    
    
    //players
    game.load.atlasJSONArray('bunny', bunny + '.png', bunny + '.json');
    game.load.audio('coin_audio', 'coin.wav');
    game.load.audio('jump_audio', 'jump.wav');
    game.load.audio('audio', 'audio.mp3');
    game.load.audio('bonus_audio', 'bonus.wav');
    
    
    game.load.image('check', 'PNG/Environment/check.png');
    game.load.image('check_done', 'PNG/Environment/check_done.png');    
}

// 816X56
function create() {
    
    initializeFragile();
    
    coin_audio = game.add.audio('coin_audio');
    jump_audio = game.add.audio('jump_audio');    
    bonus_audio = game.add.audio('bonus_audio');    
    audio = game.add.audio('audio');        
    
    //audio.play();
    
    scoreIcon = game.add.sprite(200, 200, 'score_icon');
    scoreIcon.fixedToCamera = true;
    scoreIcon.cameraOffset.setTo(10, game.camera.height - 80);
    
    lifeIcon = game.add.sprite(200, 200, 'life_icon');
    lifeIcon.fixedToCamera = true;
    lifeIcon.cameraOffset.setTo(game.camera.width - 200, game.camera.height - 80);
    
    scoreText = game.add.text(16, 16, 'SCORE: ' + score, { fontSize: '25px', fill: '#000' });
    scoreText.fixedToCamera = true;
    scoreText.fill = '#FFFFFF';
    scoreText.strokeThickness = 5
    scoreText.stroke = '#B67B3F';
    scoreText.font = 'Arial';
    scoreText.cameraOffset.setTo(80, game.camera.height - 65);
    
    lifeText = game.add.text(16, 16, 'VIE: ' + lifes, { fontSize: '25px', fill: '#000' });
    lifeText.fixedToCamera = true;
    lifeText.fill = '#FFFFFF';
    lifeText.strokeThickness = 5
    lifeText.stroke = '#B67B3F';
    lifeText.font = 'Arial';
    lifeText.cameraOffset.setTo(game.camera.width - 140, game.camera.height - 65);
    
    game.physics.startSystem(Phaser.Physics.ARCADE);
    // game.physics.arcade.gravity.y =  700;
    game.stage.backgroundColor = "#ADE6FF";

    // initiliaze Map
    initializeMap();
    
    //initialize layers
    initializeLayers();
        
    //initialize player
    initializePlayer();
    //initialize collide
    initializeCollide();
    game.camera.follow(player);

    levels = game.add.group();
    levels.enableBody = true;
    map.createFromObjects('levels', 'level', null, 0, true, false, levels);
    levels.setAll('body.allowGravity', false);
    
    checkpoints = game.add.group();
    checkpoints.enableBody = true;
    map.createFromObjects('checkpoints', 'check', 'check', 0, true, false, checkpoints);
    checkpoints.setAll('body.allowGravity', false);
    
    lifes_bonus = game.add.group();
    lifes_bonus.enableBody = true;
    map.createFromObjects('lifes', 'life', 'life', 0, true, false, lifes_bonus);
    lifes_bonus.setAll('body.allowGravity', false);
    
    coins = game.add.group();
    coins.enableBody = true;
    
    map.createFromObjects('coins', 2097, 'coin', 0, true, false, coins);
    
    coins.setAll('body.allowGravity', false);
    
    coins.callAll('animations.add', 'animations', 'spin', Phaser.Animation.generateFrameNames('gold_', 1, 6, '.png' ), 10, true, true);
    coins.callAll('animations.play', 'animations', 'spin');
    
    coinsB = game.add.group();
    coinsB.enableBody = true;
    
    map.createFromObjects('coinsB', 2106, 'coinB', 0, true, false, coinsB);
    
    coinsB.setAll('body.allowGravity', false);
    
    coinsB.callAll('animations.add', 'animations', 'spin', Phaser.Animation.generateFrameNames('bronze_', 1, 6, '.png' ), 10, true, true);
    coinsB.callAll('animations.play', 'animations', 'spin');
    
    scoreIcon.bringToTop();
    scoreText.bringToTop();
    lifeText.bringToTop();    
    player.bringToTop();        
    lifeIcon.bringToTop();    
}

function collectCoin(player, coin) {
    if (coin.gid == '2106') {
        score += 10;
    } else {
        score += 50;
    }
    coin_audio.play();
    coin.kill();
    scoreText.text = 'SCORE: ' + score;
}

function dead(player, spike) {
    if (!allow_move) {
        return;
    }
    console.log(player, spike);
    player.animations.play('hurt');
    allow_move = false;
    lifes--;
    game.time.events.add(Phaser.Timer.SECOND * 1, function() {
        if (!lifes) {
            alert('GAME OVER'); 
        } else {
            allow_move = true;
            lifeText.text = 'VIE: ' + lifes;
            player.x = last_checkpoint[0];
            player.y = last_checkpoint[1] - 80;    
        }
    }, this);
}

function checkpointsOver(player, checkpoint) {
    if (checkpoint.key != 'check_done') {
        last_checkpoint = [checkpoint.x, checkpoint.y];
        checkpoint.loadTexture('check_done', 0);
        checkpoint_text = game.add.text(50, 50, "Checkpoint saved ...");    
        checkpoint_text.font = 'Arial';
        checkpoint_text.fixedToCamera = true;
        checkpoint_text.cameraOffset.setTo(game.camera.width - 265, 50);
        checkpoint_text.alpha = 1;
        game.time.events.add(2000, function() {
            game.add.tween(checkpoint_text).to({y: 0}, 1500, Phaser.Easing.Linear.None, true);
            game.add.tween(checkpoint_text).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true);
        }, this);
    }
}

function bump(player, plat) {
    console.log(plat.faceTop);
    if (((plat.faceTop && plat.faceLeft ) || (plat.faceTop && plat.faceRight) || (plat.faceTop)) && !plat.faceBottom ) {
        jump_audio.play();
        
        player.body.velocity.y = -1500;
        jumpTimer = game.time.now + 750;      
    }
}

function bonusLife(player, bonus) {
    bonus.kill();
    bonus_audio.play();
    lifes++;
    lifeText.text = 'VIE: ' + lifes;
}

function update(){    
    // collide player to layer
    game.physics.arcade.collide(player, layerFloor);
    game.physics.arcade.collide(player, layerFloor_bump, bump);   
    game.physics.arcade.collide(player, layerSpike, dead);
    game.physics.arcade.collide(player, fragile[0], function() { console.log('fdp'); }); 
    player.body.velocity.x = 0;
    
    game.physics.arcade.overlap(player, coins, collectCoin, null, this);
    game.physics.arcade.overlap(player, coinsB, collectCoin, null, this);
    game.physics.arcade.overlap(player, checkpoints, checkpointsOver, null, this);
    game.physics.arcade.overlap(player, lifes_bonus, bonusLife, null, this);
    
    game.physics.arcade.overlap(player, levels, level, null, this);
    if (allow_move) {
        if(game.input.keyboard.isDown(Phaser.Keyboard.A)){
            attack();
        }
        
        if (game.input.keyboard.isDown(Phaser.Keyboard.LEFT))
        {
            player.animations.play('walk_left');
            player.body.velocity.x = -450;
        }
        else if (game.input.keyboard.isDown(Phaser.Keyboard.RIGHT))
        {
            player.animations.play('walk_right');
            player.body.velocity.x = 450;
        }

        if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR) && player.body.onFloor() && game.time.now > jumpTimer)
        {
            jump_audio.play();
            player.body.velocity.y = -1000;
            jumpTimer = game.time.now + 750;
        }
        else if (game.input.keyboard.isDown(Phaser.Keyboard.DOWN))
        {
            // DOWN
            // player.y += 4;
        }
        
        if (!player.body.onFloor()) {
            player.animations.play('jump');
        }
    }
}

function level (player, level) {    
    text = game.add.text(50, 50, "LEVEL " + level.level);
    
    level.kill();
    
    text.font = 'Chango';
    
    text.fixedToCamera = true;
    text.cameraOffset.setTo(50, 50);
    
    text.fontSize = 60;

    text.fill = '#B67B3F';

    text.align = 'center';
    text.stroke = '#B67B3F';
    text.strokeThickness = 2;
    text.setShadow(5, 5, 'rgba(0,0,0,0.5)', 60);

    text.inputEnabled = true;
    game.time.events.add(2000, function() {
        game.add.tween(text).to({y: 0}, 1500, Phaser.Easing.Linear.None, true);
        game.add.tween(text).to({alpha: 0}, 1500, Phaser.Easing.Linear.None, true);
    }, this);
}

function render(){
     game.debug.body(player);
     game.debug.body(coins);
     game.debug.bodyInfo(player, 16, 24);
}

function attack(){
   player.animations.play('attack');
}

function initializePlayer() {
    player = game.add.sprite(2, 3048, 'bunny',  bunny + '_jump1.png');
    // player.scale.setTo(0.5,0.5);
    game.physics.arcade.gravity.y = 900;
    //physic player
    game.physics.enable(player, Phaser.Physics.ARCADE);
    player.body.collideWorldBounds = true;
    player.body.gravity.y = 900;
    player.body.maxVelocity.y = 1500;
    //This adjusts the collision body size.
    player.body.setSize(120, 201, 0, 0);
    player.body.immovable = true;
    
    player.scale.x = 0.6;
    player.scale.y = 0.6;
    
    player.animations.add('walk_right',  Phaser.Animation.generateFrameNames( bunny + '_walk', 1, 2, '.png' ), 15, false, true).onComplete.add(animationStopped);
    player.animations.add('walk_left',  Phaser.Animation.generateFrameNames( bunny + 'L_walk', 1, 2, '.png' ), 15, false, true).onComplete.add(animationStopped);
    player.animations.add('jump',  Phaser.Animation.generateFrameNames( bunny + '_jump', 1, 1, '.png' ), 10, false, true).onComplete.add(animationStopped);
    player.animations.add('hurt', Phaser.Animation.generateFrameNames( bunny + '_hurt', 1, 1, '.png' ), 10, false, true);
}

function initializeCollide() {
    map.setCollisionByExclusion([0],true, layerFloor);
    map.setCollisionByExclusion([0],true, layerFloor_bump);
    map.setCollisionByExclusion([0],true, layerSpike);
}

function initializeMap() {
    map = game.add.tilemap('map');
    map.addTilesetImage('ground_grass_small', 'ground_grass_small');
    map.addTilesetImage('ground_cake_small', 'ground_cake_small');    
    map.addTilesetImage('spikes_top', 'spikes_top');
    map.addTilesetImage('tiles', 'tiles');
}

function initializeFragile() {
    fragile[0] = game.add.sprite(610, 3300, 'ground_grass_small_broken', 3);
    game.physics.enable(fragile[0], Phaser.Physics.ARCADE);
	fragile[0].body.allowGravity = false;
	fragile[0].body.immovable = true;
}

function initializeLayers(){
    layerBack = map.createLayer('Back');
    layerBack.resizeWorld();
    
    layerFloor = map.createLayer('Floor');
    layerFloor.resizeWorld();
    
    layerFloor_bump = map.createLayer('Floor_bump');
    layerFloor_bump.resizeWorld();
    
    layerSpike = map.createLayer('spikes');
    layerSpike.resizeWorld();
}

function animationStopped(){
    player.frame = 5;
}