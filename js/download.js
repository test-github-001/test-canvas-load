'use strict';

/*****************
 * 
 *   ЗАГРУЗЧИК
 */

const SOUNDS_PATH = './src/sounds/';
const IMAGES_PATH = './src/images/';

const SOUNDS_UPLOAD_ARR = [ ];

const IMAGES_UPLOAD_ARR = [
    'bg-space.jpg',
    'ball.png',
    'platform.png',
    'block-0.png',
    'block-1.png',
    'block-2.png',
    'block-3.png',
    'block-4.png',
    'block-5.png',
    'block-bonus-128x64-32f.png',
    'bonus_balls.png',
    'bonus_slow.png',
    'bonus_speed.png',
    ];

let uploadSize = SOUNDS_UPLOAD_ARR.length + IMAGES_UPLOAD_ARR.length;
let loadingStep = 100 / uploadSize;

let loadingProgress = 0;

class GameSound {
    constructor (sound_name) {
        this.name = sound_name;
        this.audio = new Audio();
        this.audio.src = SOUNDS_PATH + sound_name;
        this.isLoaded = false;
        this.audio.oncanplaythrough = () => {
            this.isLoaded = true;
            SOUNDS_ARR.push(this);
            updateLoadingProgress();
        };
    }
}

class GameImage {
    constructor(image_name) {
        this.name = image_name;
        this.img = new Image();
        this.img.src = IMAGES_PATH + image_name;
        this.isLoaded = false;
        this.img.onload = () => {
            this.isLoaded = true;
            this.width = this.img.width;
            this.height = this.img.height;
            IMAGES_ARR.push(this);
            updateLoadingProgress();
        };
    }
}

function updateLoadingProgress() {
    uploadSize--;
    loadingProgress += loadingStep;
    loadingStatusText.innerText = 'Loading ' + loadingProgress.toFixed() + ' %';
    loadingStatusLine.style.width = loadingProgress.toFixed(1) * 2 + '%';
    if (uploadSize < 1) loadingDone();
}

const SOUNDS_ARR = [];
const IMAGES_ARR = [];

IMAGES_UPLOAD_ARR.forEach( data => new GameImage(data) );
SOUNDS_UPLOAD_ARR.forEach( data => new GameSound(data) );

const loadingStatusBar = document.createElement('div');
loadingStatusBar.id = 'loadingStatusBar';

const loadingStatusText = document.createElement('div');
loadingStatusText.id = 'loadingStatusText';
loadingStatusText.innerText = 'Loading 0 %';

const loadingStatusLine = document.createElement('div');
loadingStatusLine.id = 'loadingStatusLine';

loadingStatusBar.prepend(loadingStatusLine);
loadingStatusBar.prepend(loadingStatusText);
document.body.prepend(loadingStatusBar);

function loadingDone() {
    loadingStatusBar.remove();

    const loadingReadyButton = document.createElement('button');
    loadingReadyButton.id = 'loadingReadyButton';
    loadingReadyButton.innerText = 'START';
    loadingReadyButton.onclick = () => loadingReadyButton.remove();
    document.body.prepend(loadingReadyButton);
}