var Splash = function () {};

Splash.prototype = {

  loadScripts: function () {
    game.load.script('webfont', '//ajax.googleapis.com/ajax/libs/webfont/1.4.7/webfont.js');
    game.load.script('style', 'lib/style.js');
    game.load.script('mixins', 'lib/mixins.js');
    game.load.script('WebFont', 'vendor/webfontloader.js');
    game.load.script('gamemenu','states/GameMenu.js');
    game.load.script('game', 'states/Game.js');
    game.load.script('gameover','states/GameOver.js');
    game.load.script('credits', 'states/Credits.js');
    game.load.script('options', 'states/Options.js');
    
    game.load.atlasJSONArray('p1', 'assets/json/p1.png', 'assets/json/p1.json');
    game.load.atlasJSONArray('gold', 'assets/json/gold.png', 'assets/json/gold.json');
    game.load.atlasJSONArray('bronze', 'assets/json/bronze.png', 'assets/json/bronze.json');
    game.load.atlasJSONArray('light', 'assets/json/light.png', 'assets/json/light.json');    
  },

  loadBgm: function () {
    // thanks Kevin Macleod at http://incompetech.com/
    game.load.audio('dangerous', 'assets/bgm/Dangerous.mp3');
    game.load.audio('exit', 'assets/bgm/Exit the Premises.mp3');
    game.load.audio('coin_audio', 'assets/bgm/coin.wav');
    game.load.audio('jump_audio', 'assets/bgm/jump.wav');
    game.load.audio('audio', 'assets/bgm/audio.mp3');
    game.load.audio('bonus_audio', 'assets/bgm/bonus.wav');
  },
  // varios freebies found from google image search
  loadImages: function () {
    game.load.image('menu-bg', 'assets/images/menu-bg.jpg');
    game.load.image('options-bg', 'assets/images/options-bg.jpg');
    game.load.image('gameover-bg', 'assets/images/gameover-bg.jpg');
    game.load.tilemap('map', 'assets/json/map.json', null, Phaser.Tilemap.TILED_JSON);
    game.load.image('tiles', 'assets/images/tiles.png');
    game.load.image('score_icon', 'assets/images/hud_coins.png');
    game.load.image('life_icon', 'assets/images/hud_p1.png');    
    game.load.image('check', 'assets/images/check.png');
    game.load.image('spikes', 'assets/images/spikes.png');    
    game.load.image('check_done', 'assets/images/check_done.png');  
    game.load.image('bounce', 'assets/images/bounce.png');
    game.load.image('bounce_up', 'assets/images/bounce_up.png');    
    game.load.image('box', 'assets/images/box.png');   
    game.load.image('water', 'assets/images/water.png');        
    game.load.image('water_top', 'assets/images/water_top.png');   
    game.load.image('fire', 'assets/images/fire.png');                 
    game.load.image('star', 'assets/images/star.png');        
    game.load.image('lave_body', 'assets/images/lave_body.png');        
    game.load.image('lave_top', 'assets/images/lave_top.png');   
    game.load.image('exit', 'assets/images/exit.png');        
    game.load.image('right', 'assets/images/right.png');        
    game.load.image('wall', 'assets/images/wall.png');  
    game.load.image('moving_platform', 'assets/images/moving_platform.png');              
    game.load.image('stop1', 'assets/images/stop1.png');  
    game.load.image('stop2', 'assets/images/stop2.png');  
    game.load.image('stop3', 'assets/images/stop3.png');  
    game.load.image('stop4', 'assets/images/stop4.png');         
    game.load.image('key1', 'assets/images/key1.png');  
    game.load.image('key2', 'assets/images/key2.png');  
    game.load.image('key3', 'assets/images/key3.png');  
    game.load.image('key4', 'assets/images/key4.png');      
  },

  loadFonts: function () {
    WebFontConfig = {
      custom: {
        families: ['TheMinion'],
        urls: ['assets/style/theminion.css']
      }
    }
  },

  init: function () {
    this.loadingBar = game.make.sprite(game.world.centerX-(387/2), 400, "loading");
    this.logo       = game.make.sprite(game.world.centerX, 200, 'brand');
    this.status     = game.make.text(game.world.centerX, 380, 'Loading...', {fill: 'white'});
    utils.centerGameObjects([this.logo, this.status]);
  },
  
  preload: function () {
    game.add.sprite(0, 0, 'stars');
    game.add.existing(this.logo).scale.setTo(0.5);
    game.add.existing(this.loadingBar);
    game.add.existing(this.status);
    this.load.setPreloadSprite(this.loadingBar);

    this.loadScripts();
    this.loadImages();
    this.loadFonts();
    this.loadBgm();

  },

  addGameStates: function () {

    game.state.add("GameMenu",GameMenu);
    game.state.add("Game",Game);
    game.state.add("GameOver",GameOver);
    game.state.add("Credits",Credits);
    game.state.add("Options",Options);
  },

  addGameMusic: function () {
    music = game.add.audio('dangerous');
    music.loop = true;
    music.play();
  },

  create: function() {
    this.status.setText('Ready!');
    this.addGameStates();
    this.addGameMusic();

    coin_audio = game.add.audio('coin_audio');
    jump_audio = game.add.audio('jump_audio');    
    bonus_audio = game.add.audio('bonus_audio');    
    audio = game.add.audio('audio');   

    setTimeout(function () {
      game.state.start("Game");
    }, 1000);
  }
};
