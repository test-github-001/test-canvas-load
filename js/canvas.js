'use strict';

/*************
 * 
 *   ХОЛСТ
 */

let vw, vh, vcx, vcy;
const canvas = document.createElement('canvas');
canvas.width = vw = 900;
canvas.height = vh = 900;
vcx = Math.floor(vw / 2);
vcy = Math.floor(vh / 2);
const ctx = canvas.getContext('2d');
document.body.prepend(canvas);

/**********************************
 * 
 *   БАЗОВЫЕ ИГРОВЫЕ ОБЪЕКТЫ
 */

let spritesArr = [];

class GameObject {
    constructor(sprite_name, x, y, fps) {
        let sprite = SPRITES_ARR.find(sprite => sprite.name === sprite_name);

        this.x = x;
        this.y = y;

        this.fps = fps || 60;
        this.frameUpdateTimeout = Math.floor(1000/this.fps);
        this.lastFrameUpdateTimeout = 0;

        this.img = sprite.img;
        this.sw = sprite.width;
        this.sh = sprite.height;
        this.fx = 0; // current frame x
        this.fy = 0; // current frame y
        this.fc = 0; // current frame (frame number)
        this.fs = sprite.frames; // frames in sprite (start from index 0)
        this.fw = sprite.frameWidth;
        this.fh = sprite.frameHeight;
        this.hw = Math.floor(sprite.frameWidth / 2);
        this.hh = Math.floor(sprite.frameHeight / 2);

        /*    y0    y0
            x0 *----* x1
              | xy |
          x0 *----* x1
            y1    y1    */

        this.x0 = this.x - this.hw;
        this.y0 = this.y - this.hh;

        this.x1 = this.x0 + this.fw;
        this.y1 = this.y0 + this.fh;

        this.isExist = true;
    }

    draw(timeout) {
        // DRAW
        if (this.x1 > gameMap.x && this.x0 < gameMap.x + vw && this.y1 > gameMap.y && this.y0 < gameMap.y + vh) {
            ctx.drawImage(
                this.img, // image
                this.fx, this.fy, // frame [x, y] on sprite image
                this.fw, this.fh, // frame width and height
                this.x0 - gameMap.x, this.y0 - gameMap.y, // start point[x, y] to draw on canvas
                this.fw, this.fh // frame width and height to draw on canvas
            );
        }

        // UPDATE FRAME
        this.lastFrameUpdateTimeout += timeout;
        if (this.lastFrameUpdateTimeout > this.frameUpdateTimeout) {
            this.lastFrameUpdateTimeout = 0;

            this.fc++;
            if (this.fc < this.fs) {
                this.fx += this.fw;
                if (this.fx >= this.sw) {
                    this.fx = 0;
                    this.fy += this.fh;
                    if (this.fy >= this.sh)
                        this.fy = 0;
                }
            } else {
                this.fc = 0; this.fx = 0; this.fy = 0;
            }
        }
    }
}

class Cursor extends GameObject {
    constructor(sprite_name, x, y, fps) {
        super(sprite_name, x, y, fps);
        console.log('Cursor ready');
    }

    draw(timeout) {

        this.x = mouseX;
        this.y = mouseY;

        // DRAW
        ctx.drawImage(
            this.img, // image
            this.fx, this.fy, // frame [x, y] on sprite image
            this.fw, this.fh, // frame width and height
            this.x - this.hw, this.y - this.hh, // start point[x, y] to draw on canvas
            this.fw, this.fh // frame width and height to draw on canvas
        );

        // UPDATE FRAME
        this.lastFrameUpdateTimeout += timeout;
        if (this.lastFrameUpdateTimeout > this.frameUpdateTimeout) {
            this.lastFrameUpdateTimeout = 0;

            this.fc++;
            if (this.fc < this.fs) {
                this.fx += this.fw;
                if (this.fx >= this.sw) {
                    this.fx = 0;
                    this.fy += this.fh;
                    if (this.fy >= this.sh)
                        this.fy = 0;
                }
            } else {
                this.fc = 0; this.fx = 0; this.fy = 0;
            }
        }

        // UPDATE MAP POSITION
        if (mouseX < gameMap.scrollAreaSize && gameMap.x > 0) {
            gameMap.x -= gameMap.speedScrolling;
            if (gameMap.x < 0) gameMap.x = 0;
        }

        if (mouseY < gameMap.scrollAreaSize && gameMap.y > 0) {
            gameMap.y -= gameMap.speedScrolling;
            if (gameMap.y < 0) gameMap.y = 0;
        }

        if (mouseX > vw - gameMap.scrollAreaSize && gameMap.x < gameMap.w - vw) {
            gameMap.x += gameMap.speedScrolling;
            if (gameMap.x > gameMap.w - vw) gameMap.x = gameMap.w - vw;
        }

        if (mouseY > vh - gameMap.scrollAreaSize && gameMap.y < gameMap.h - vh) {
            gameMap.y += gameMap.speedScrolling;
            if (gameMap.y > gameMap.h - vh) gameMap.y = gameMap.h - vh;
        }
    }
}

function gameMapGenerate(map) {
    const areaImage = IMAGES_ARR.find(image => image.name === map.tileName);
    const holeImage = IMAGES_ARR.find(image => image.name === 'bg_texture_hole_100x100.png');
    const crystalsImage = IMAGES_ARR.find(image => image.name === 'bg_texture_crystals_100x100.png');
    const baseImages = SPRITES_ARR.find(sprite => sprite.name === 'bases_100x100_12f.png');

    const mapImage = document.createElement('canvas');
    const mapImageContext = mapImage.getContext('2d');

    mapImage.width = map.areaArr[0].length * areaImage.width;
    mapImage.height = map.areaArr.length * areaImage.height;

    for (let row = 0; row < map.areaArr.length; row++) {
        for (let col = 0; col < map.areaArr[0].length; col++) {
            // add background tile
            if (col % 2 === 0 && row % 2 === 0) {
                mapImageContext.drawImage(areaImage.img, 0, 0, 200, 200, col * 100, row * 100, 200, 200);
            }
            
            // add tile under background
            if ( map.areaArr[row][col] !== ' ') {
                switch( map.areaArr[row][col] ) { 
                    case 'w' : mapImageContext.drawImage( crystalsImage.img, 0, 0, 100, 100, 100 * col, 100 * row, 100, 100 ); break;
                    case '0' : mapImageContext.drawImage( holeImage.img, 0, 0, 100, 100, 100 * col, 100 * row, 100, 100 ); break;
                    case 'x' : mapImageContext.drawImage( baseImages.img, 0, 0, 100, 100, 100 * col, 100 * row, 100, 100 ); break;
                    case '/' : mapImageContext.drawImage( baseImages.img, 100, 0, 100, 100, 100 * col, 100 * row, 100, 100 ); break;
                    case '$' : mapImageContext.drawImage( baseImages.img, 200, 0, 100, 100, 100 * col, 100 * row, 100, 100 ); break;
                    case '#' : mapImageContext.drawImage( baseImages.img, 0, 100, 100, 100, 100 * col, 100 * row, 100, 100 ); break;
                    case '=' : mapImageContext.drawImage( baseImages.img, 100, 100, 100, 100, 100 * col, 100 * row, 100, 100 ); break;
                    case '*' :
                        mapImageContext.drawImage( baseImages.img, 200, 100, 100, 100, 100 * col, 100 * row, 100, 100 );
                        gameMapSpritesArr.push( new GameObject('base_vent_52x52_12f.png', 100 * col + 50, 100 * row + 50) );
                        break;
                }
            }
            
        }
    }console.log(gameMapSpritesArr);
    return mapImage;
}

/*      GAME MAP

        ' ' - empty tile
        '0' - enemy hole
        'w' - crystals
        'x' - wall
        '#' - venting wall
        '*' - venting wall with blower
        '=' - empty wall
        '/' - gun wall closed
        '$' - gun wall opened with .... gun
*/
const gameMapInit = {
    tileName : 'bg_texture_blue_200x200.png',
    areaArr : [
        [ 'w', 'w', 'w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w', 'w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w', 'w', 'w' ],
        [ 'w', '0', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '0', 'w' ],
        [ 'w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '*', '$', ' ', '/', '/', ' ', '$', '*', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '$', '=', ' ', 'x', 'x', ' ', '=', '$', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ 'w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '/', 'x', ' ', '#', '#', ' ', 'x', '/', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w' ],
        [ 'w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '/', 'x', ' ', '#', '#', ' ', 'x', '/', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '$', '=', ' ', 'x', 'x', ' ', '=', '$', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '*', '$', ' ', '/', '/', ' ', '$', '*', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ' ],
        [ 'w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w' ],
        [ 'w', '0', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '0', 'w' ],
        [ 'w', 'w', 'w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w', 'w', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', 'w', 'w', 'w' ]
    ]
}

const gameMap = {
    w: gameMapInit.areaArr[0].length * 100,
    h: gameMapInit.areaArr.length * 100,
    x: Math.floor( ( gameMapInit.areaArr[0].length * 100 - vw ) / 2 ),
    y: Math.floor( ( gameMapInit.areaArr.length * 100 - vh ) / 2 ),
    speedScrolling: 10,
    scrollAreaSize: 200
}

let gameMapSpritesArr = [];
/******************************************
 * 
 *  ОТСЛЕЖИВАНИЕ ПОЛОЖЕНИЯ КУРСОРА МЫШИ
 */

let mouseX = canvas.width / 2;
let mouseY = canvas.height / 2;

canvas.addEventListener('mousemove', function(event) {
    let rect = canvas.getBoundingClientRect();
    mouseX = (event.clientX - rect.left) / (rect.right - rect.left) * canvas.width;
    mouseY = (event.clientY - rect.top) / (rect.bottom - rect.top) * canvas.height;
    console.log(`x: ${mouseX}; y: ${mouseY}`);
}, false);

function loadingDone() {
    gameMap.img = gameMapGenerate(gameMapInit);
    //spritesArr.push( new GameObject('alien_74x144_6f.png', vcx, vcy, 18) );
    //spritesArr.push( new GameObject('base_vent_100x100_12f.png', 50, 50) );
    //spritesArr.push( new GameObject('base_vent_52x52_12f.png', vw - 52, vh - 52) );
    //spritesArr.push( new GameObject('base_open_gun_100x100_48f.png', 50, vh - 50) );
    spritesArr.push( new Cursor('cursor_96x96_14f.png', vcx, vcy, 30) );

    requestAnimationFrame( animation );
}

/**************
 * 
 *  АНИМАЦИЯ
 */

// проверка производительности
let testPerformanceArray = [];

// номер текущего кадра
let frame = 0;
// временная метка последнего кадра
let previousTimeStamp = 0;

function animation( timeStamp ) {
    // обновляем временные метки
    const frameTimeout = timeStamp - previousTimeStamp;
    previousTimeStamp = timeStamp;

    // обновляем номер кадра
    frame++;

    // чистим холст
    ctx.clearRect(0, 0, vw, vh);

    // update map
    ctx.drawImage( gameMap.img, gameMap.x, gameMap.y, vw, vh, 0, 0, vw, vh );

    /*
    // обнавляем астеройды и уровень
    if (frame % ( levelToWin * 5 - level * 4 ) === 0) addNewAsteroid();
    rocksArr.forEach( rock => rock.draw( frameTimeout, frame ) );
    asteroidsArr.forEach( asteroid => asteroid.draw( frameTimeout, frame ) );   
    */
    // ОТРИСОВКА
    gameMapSpritesArr.forEach( sprite => sprite.draw( frameTimeout ) );
    spritesArr.forEach( sprite => sprite.draw( frameTimeout ) );

    // удаляем ненужные объекты
    /*
    asteroidsArr = asteroidsArr.filter( asteroid => asteroid.isExist );
    */
    
    /*
    // обновляем данные по производительности
    testPerformanceArray.push( frameTimeout );
    // выводим в консоль инвормацию производительности и о количестве снежинок на экране каждеы 60 кадров
    if (frame % 60 === 0) {
        let maxTimeout = Math.max( ...testPerformanceArray );
        let sumTimeout = testPerformanceArray.reduce((sum, data) => data + sum, 0);
        let midTimeout = sumTimeout / testPerformanceArray.length;
        testPerformanceArray = [];

        // console.clear(); // очистка старой информации
        console.group('ПРОИЗВОДИТЕЛЬНОСТЬ')
        console.log('мин.FPS:', (1000 / maxTimeout).toFixed(3) + ' (из 60)');
        console.log(' ср.FPS:', (1000 / midTimeout).toFixed(3) + ' (из 60)');
        console.log('(средняя задержка между кадрами =', midTimeout,'миллисекунд)');
        console.log('Астеройдов :', asteroidsArr.length);
        console.groupEnd();

        console.log( asteroidsArr );
    }
    */

    // запускаем занова анимацию с 60 fps
    requestAnimationFrame( animation );
}
