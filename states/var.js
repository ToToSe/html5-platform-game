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
var gotLevel = [];
var jump_audio;
var speed = 1;
var inWater = false;
var gotKey = [];
var map,
    player,
    layerDie,
    layerFloor,
    layerStop1,
    layerStop2,
    layerStop3,
    layerStop4,
    layerBack,
    boxs,
    layerWater;
var facing = 'right';
var jumpTimer = 0;