
(function(){
var newChildObject = function(parentObj, newObj) {
    var x = function(){};
    x.prototype = parentObj;
    var resultObj = new x();
    if (newObj) {
        var hasProp = {}.hasOwnProperty;
        for (var name in newObj) {
            if (hasProp.call(newObj, name)) {
                resultObj[name] = newObj[name];
            }
        }
    }
    return resultObj;
};
var DEBUG = false;
/* Sound handlers added by Dr James Freeman who was sad such a great reverse was a silent movie  */
var audio = new preloadAudio();
function audioTrack(url, volume) {
    var audio = new Audio(url);
    if (volume) audio.volume = volume;
    audio.load();
    var looping = false;
    this.play = function(noResetTime) {
        playSound(noResetTime);
    };
    this.startLoop = function(noResetTime) {
        if (looping) return;
        audio.addEventListener('ended', audioLoop);
        audioLoop(noResetTime);
        looping = true;
    };
    this.stopLoop = function(noResetTime) {
        try{ audio.removeEventListener('ended', audioLoop) } catch (e) {};
        audio.pause();
        if (!noResetTime) audio.currentTime = 0;
        looping = false;
    };
    this.isPlaying = function() {
        return !audio.paused;
    };
    this.isPaused = function() {
        return audio.paused;
    };
    this.stop = this.stopLoop;
    function audioLoop(noResetTime) {
        playSound(noResetTime);
    }
    function playSound(noResetTime) {
        if(!audio.paused) {
            audio.pause();
            if (!noResetTime ) audio.currentTime = 0;
        }
        try{
            var playPromise = audio.play();
            if(playPromise) {
                playPromise.then(function(){}).catch(function(err){});
            }
        }
        catch(err){ console.error(err) }
    }
}
function preloadAudio() {
    this.credit            = new audioTrack('sounds/credit.mp3');
    this.coffeeBreakMusic  = new audioTrack('sounds/coffee-break-music.mp3');
    this.die               = new audioTrack('sounds/miss.mp3');
    this.ghostReturnToHome = new audioTrack('sounds/ghost-return-to-home.mp3');
    this.eatingGhost       = new audioTrack('sounds/eating-ghost.mp3');
    this.ghostTurnToBlue   = new audioTrack('sounds/ghost-turn-to-blue.mp3', 0.5);
    this.eatingFruit       = new audioTrack('sounds/eating-fruit.mp3');
    this.ghostSpurtMove1   = new audioTrack('sounds/ghost-spurt-move-1.mp3');
    this.ghostSpurtMove2   = new audioTrack('sounds/ghost-spurt-move-2.mp3');
    this.ghostSpurtMove3   = new audioTrack('sounds/ghost-spurt-move-3.mp3');
    this.ghostSpurtMove4   = new audioTrack('sounds/ghost-spurt-move-4.mp3');
    this.ghostNormalMove   = new audioTrack('sounds/ghost-normal-move.mp3');
    this.extend            = new audioTrack('sounds/extend.mp3');
    this.eating            = new audioTrack('sounds/eating.mp3', 0.5);
    this.startMusic        = new audioTrack('sounds/start-music.mp3');
    this.ghostReset = function(noResetTime) {
        for (var s in this) {
            if (s == 'silence' || s == 'ghostReset' ) return;
            if (s.match(/^ghost/)) this[s].stopLoop(noResetTime);
        }
    };
    this.silence = function(noResetTime) {
        for (var s in this) {
            if (s == 'silence' || s == 'ghostReset' ) return;
            this[s].stopLoop(noResetTime);
        }
    }
}
var getRandomColor = function() {
    return '#'+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6);
};
var getRandomInt = function(min,max) {
    return Math.floor(Math.random() * (max-min+1)) + min;
};
var GAME_PACMAN = 0;
var GAME_MSPACMAN = 1;
var GAME_COOKIE = 2;
var GAME_OTTO = 3;
var practiceMode = false;
var turboMode = false;
var gameMode = GAME_PACMAN;
var getGameName = (function(){
    var names = ["PAC-MAN", "MS PAC-MAN", "COOKIE-MAN","CRAZY OTTO"];
    return function(mode) {
        if (mode == undefined) {
            mode = gameMode;
        }
        return names[mode];
    };
})();
var getGameDescription = (function(){
    var desc = [
        [
            "ORIGINAL ARCADE:",
            "NAMCO (C) 1980",
            "",
            "REVERSE-ENGINEERING:",
            "JAMEY PITTMAN",
            "",
            "REMAKE:",
            "SHAUN WILLIAMS",
        ],
        [
            "ORIGINAL ARCADE ADDON:",
            "MIDWAY/GCC (C) 1981",
            "",
            "REVERSE-ENGINEERING:",
            "BART GRANTHAM",
            "",
            "REMAKE:",
            "SHAUN WILLIAMS",
        ],
        [
            "A NEW PAC-MAN GAME",
            "WITH RANDOM MAZES:",
            "SHAUN WILLIAMS (C) 2012",
            "",
            "COOKIE MONSTER DESIGN:",
            "JIM HENSON",
            "",
            "PAC-MAN CROSSOVER CONCEPT:",
            "TANG YONGFA",
        ],
        [
            "THE UNRELEASED",
            "MS. PAC-MAN PROTOTYPE:",
            "GCC (C) 1981",
            "",
            "SPRITES REFERENCED FROM",
            "STEVE GOLSON'S",
            "CAX 2012 PRESENTATION",
            "",
            "REMAKE:",
            "SHAUN WILLIAMS",
        ],
    ];
    return function(mode) {
        if (mode == undefined) {
            mode = gameMode;
        }
        return desc[mode];
    };
})();
var getGhostNames = function(mode) {
    if (mode == undefined) {
        mode = gameMode;
    }
    if (mode == GAME_OTTO) {
        return ["plato","darwin","freud","newton"];
    }
    else if (mode == GAME_MSPACMAN) {
        return ["blinky","pinky","inky","sue"];
    }
    else if (mode == GAME_PACMAN) {
        return ["blinky","pinky","inky","clyde"];
    }
    else if (mode == GAME_COOKIE) {
        return ["elmo","piggy","rosita","zoe"];
    }
};
var getGhostDrawFunc = function(mode) {
    if (mode == undefined) {
        mode = gameMode;
    }
    if (mode == GAME_OTTO) {
        return atlas.drawMonsterSprite;
    }
    else if (mode == GAME_COOKIE) {
        return atlas.drawMuppetSprite;
    }
    else {
        return atlas.drawGhostSprite;
    }
};
var getPlayerDrawFunc = function(mode) {
    if (mode == undefined) {
        mode = gameMode;
    }
    if (mode == GAME_OTTO) {
        return atlas.drawOttoSprite;
    }
    else if (mode == GAME_PACMAN) {
        return atlas.drawPacmanSprite;
    }
    else if (mode == GAME_MSPACMAN) {
        return atlas.drawMsPacmanSprite;
    }
    else if (mode == GAME_COOKIE) {
        return drawCookiemanSprite;
    }
};
var clearCheats, backupCheats, restoreCheats;
(function(){
    clearCheats = function() {
        pacman.invincible = false;
        pacman.ai = false;
        for (i=0; i<5; i++) {
            actors[i].isDrawPath = false;
            actors[i].isDrawTarget = false;
        }
        executive.setUpdatesPerSecond(60);
    };
    var i, invincible, ai, isDrawPath, isDrawTarget;
    isDrawPath = {};
    isDrawTarget = {};
    backupCheats = function() {
        invincible = pacman.invincible;
        ai = pacman.ai;
        for (i=0; i<5; i++) {
            isDrawPath[i] = actors[i].isDrawPath;
            isDrawTarget[i] = actors[i].isDrawTarget;
        }
    };
    restoreCheats = function() {
        pacman.invincible = invincible;
        pacman.ai = ai;
        for (i=0; i<5; i++) {
            actors[i].isDrawPath = isDrawPath[i];
            actors[i].isDrawTarget = isDrawTarget[i];
        }
    };
})();
var level = 1;
var extraLives = 0;
var savedLevel = {};
var savedExtraLives = {};
var savedHighScore = {};
var savedScore = {};
var savedState = {};
var saveGame = function(t) {
    savedLevel[t] = level;
    savedExtraLives[t] = extraLives;
    savedHighScore[t] = getHighScore();
    savedScore[t] = getScore();
    savedState[t] = state;
};
var loadGame = function(t) {
    level = savedLevel[t];
    if (extraLives != savedExtraLives[t]) {
        extraLives = savedExtraLives[t];
        renderer.drawMap();
    }
    setHighScore(savedHighScore[t]);
    setScore(savedScore[t]);
    state = savedState[t];
};
var scores = [
    0,0,
    0,0,
    0,0,
    0,0,
    0 ];
var highScores = [
    10000,10000,
    10000,10000,
    10000,10000,
    10000,10000,
    ];
var getScoreIndex = function() {
    if (practiceMode) {
        return 8;
    }
    return gameMode*2 + (turboMode ? 1 : 0);
};
var addScore = function(p) {
    var score = getScore();
    if (score < 10000 && score+p >= 10000) {
        extraLives++;
        renderer.drawMap();
    }
    score += p;
    setScore(score);
    if (!practiceMode) {
        if (score > getHighScore()) {
            setHighScore(score);
        }
    }
};
var getScore = function() {
    return scores[getScoreIndex()];
};
var setScore = function(score) {
    scores[getScoreIndex()] = score;
};
var getHighScore = function() {
    return highScores[getScoreIndex()];
};
var setHighScore = function(highScore) {
    highScores[getScoreIndex()] = highScore;
    saveHighScores();
};
var loadHighScores = function() {
    var hs;
    var hslen;
    var i;
    if (localStorage && localStorage.highScores) {
        hs = JSON.parse(localStorage.highScores);
        hslen = hs.length;
        for (i=0; i<hslen; i++) {
            highScores[i] = Math.max(highScores[i],hs[i]);
        }
    }
};
var saveHighScores = function() {
    if (localStorage) {
        localStorage.highScores = JSON.stringify(highScores);
    }
};
var DIR_UP = 0;
var DIR_LEFT = 1;
var DIR_DOWN = 2;
var DIR_RIGHT = 3;
var getClockwiseAngleFromTop = function(dirEnum) {
    return -dirEnum*Math.PI/2;
};
var rotateLeft = function(dirEnum) {
    return (dirEnum+1)%4;
};
var rotateRight = function(dirEnum) {
    return (dirEnum+3)%4;
};
var rotateAboutFace = function(dirEnum) {
    return (dirEnum+2)%4;
};
var getEnumFromDir = function(dir) {
    if (dir.x==-1) return DIR_LEFT;
    if (dir.x==1) return DIR_RIGHT;
    if (dir.y==-1) return DIR_UP;
    if (dir.y==1) return DIR_DOWN;
};
var setDirFromEnum = function(dir,dirEnum) {
    if (dirEnum == DIR_UP)         { dir.x = 0; dir.y =-1; }
    else if (dirEnum == DIR_RIGHT)  { dir.x =1; dir.y = 0; }
    else if (dirEnum == DIR_DOWN)  { dir.x = 0; dir.y = 1; }
    else if (dirEnum == DIR_LEFT) { dir.x = -1; dir.y = 0; }
};
var getTurnClosestToTarget = function(tile,targetTile,openTiles) {
    var dx,dy,dist;
    var minDist = Infinity;
    var dir = {};
    var dirEnum = 0;
    var i;
    for (i=0; i<4; i++) {
        if (openTiles[i]) {
            setDirFromEnum(dir,i);
            dx = dir.x + tile.x - targetTile.x;
            dy = dir.y + tile.y - targetTile.y;
            dist = dx*dx+dy*dy;
            if (dist < minDist) {
                minDist = dist;
                dirEnum = i;
            }
        }
    }
    return dirEnum;
};
var getOpenTiles = function(tile,dirEnum) {
    var openTiles = {};
    openTiles[DIR_UP] =    map.isFloorTile(tile.x, tile.y-1);
    openTiles[DIR_RIGHT] = map.isFloorTile(tile.x+1, tile.y);
    openTiles[DIR_DOWN] =  map.isFloorTile(tile.x, tile.y+1);
    openTiles[DIR_LEFT] =  map.isFloorTile(tile.x-1, tile.y);
    var numOpenTiles = 0;
    var i;
    if (dirEnum != undefined) {
        for (i=0; i<4; i++)
            if (openTiles[i])
                numOpenTiles++;
        var oppDirEnum = rotateAboutFace(dirEnum);
        if (numOpenTiles > 1)
            openTiles[oppDirEnum] = false;
    }
    return openTiles;
};
var isNextTileFloor = function(tile,dir) {
    return map.isFloorTile(tile.x+dir.x,tile.y+dir.y);
};
var tileSize = 8;
var midTile = {x:3, y:4};
var Map = function(numCols, numRows, tiles) {
    this.numCols = numCols;
    this.numRows = numRows;
    this.numTiles = numCols*numRows;
    this.widthPixels = numCols*tileSize;
    this.heightPixels = numRows*tileSize;
    this.tiles = tiles;
    this.doorTile = {x:13, y:14};
    this.doorPixel = {
        x:(this.doorTile.x+1)*tileSize-1,
        y:this.doorTile.y*tileSize + midTile.y
    };
    this.homeTopPixel = 17*tileSize;
    this.homeBottomPixel = 18*tileSize;
    this.timeEaten = {};
    this.resetCurrent();
    this.parseDots();
    this.parseTunnels();
    this.parseWalls();
};
Map.prototype.save = function(t) {
};
Map.prototype.eraseFuture = function(t) {
    var i;
    for (i=0; i<this.numTiles; i++) {
        if (t <= this.timeEaten[i]) {
            delete this.timeEaten[i];
        }
    }
};
Map.prototype.load = function(t,abs_t) {
    var firstTile,curTile;
    var refresh = function(i) {
        var x,y;
        x = i%this.numCols;
        y = Math.floor(i/this.numCols);
        renderer.refreshPellet(x,y);
    };
    var i;
    for (i=0; i<this.numTiles; i++) {
        firstTile = this.startTiles[i];
        if (firstTile == '.' || firstTile == 'o') {
            if (abs_t <= this.timeEaten[i]) {
                if (this.currentTiles[i] != firstTile) {
                    this.dotsEaten--;
                    this.currentTiles[i] = firstTile;
                    refresh.call(this,i);
                }
            }
            else if (abs_t > this.timeEaten[i]) {
                if (this.currentTiles[i] != ' ') {
                    this.dotsEaten++;
                    this.currentTiles[i] = ' ';
                    refresh.call(this,i);
                }
            }
        }
    }
};
Map.prototype.resetTimeEaten = function()
{
    this.startTiles = this.currentTiles.slice(0);
    this.timeEaten = {};
};
Map.prototype.resetCurrent = function() {
    this.currentTiles = this.tiles.split("");
    this.dotsEaten = 0;
};
Map.prototype.parseWalls = function() {
    var that = this;
    this.paths = [];
    var visited = {};
    var toIndex = function(x,y) {
        if (x>=-2 && x<that.numCols+2 && y>=0 && y<that.numRows)
            return (x+2)+y*(that.numCols+4);
    };
    var edges = {};
    var i=0,x,y;
    for (y=0;y<this.numRows;y++) {
        for (x=-2;x<this.numCols+2;x++,i++) {
            if (this.getTile(x,y) == '|' &&
                (this.getTile(x-1,y) != '|' ||
                this.getTile(x+1,y) != '|' ||
                this.getTile(x,y-1) != '|' ||
                this.getTile(x,y+1) != '|' ||
                this.getTile(x-1,y-1) != '|' ||
                this.getTile(x-1,y+1) != '|' ||
                this.getTile(x+1,y-1) != '|' ||
                this.getTile(x+1,y+1) != '|')) {
                edges[i] = true;
            }
        }
    }
    var makePath = function(tx,ty) {
        var dir = {};
        var dirEnum;
        if (toIndex(tx+1,ty) in edges)
            dirEnum = DIR_RIGHT;
        else if (toIndex(tx, ty+1) in edges)
            dirEnum = DIR_DOWN;
        else
            throw "tile shouldn't be 1x1 at "+tx+","+ty;
        setDirFromEnum(dir,dirEnum);
        tx += dir.x;
        ty += dir.y;
        var init_tx = tx;
        var init_ty = ty;
        var init_dirEnum = dirEnum;
        var path = [];
        var pad;
        var point;
        var lastPoint;
        var turn,turnAround;
        /*
           We employ the 'right-hand rule' by keeping our right hand in contact
           with the wall to outline an individual wall piece.
           Since we parse the tiles in row major order, we will always start
           walking along the wall at the leftmost tile of its topmost row.  We
           then proceed walking to the right.
           When facing the direction of the walk at each tile, the outline will
           hug the left side of the tile unless there is a walkable tile to the
           left.  In that case, there will be a padding distance applied.
        */
        var getStartPoint = function(tx,ty,dirEnum) {
            var dir = {};
            setDirFromEnum(dir, dirEnum);
            if (!(toIndex(tx+dir.y,ty-dir.x) in edges))
                pad = that.isFloorTile(tx+dir.y,ty-dir.x) ? 5 : 0;
            var px = -tileSize/2+pad;
            var py = tileSize/2;
            var a = getClockwiseAngleFromTop(dirEnum);
            var c = Math.cos(a);
            var s = Math.sin(a);
            return {
                x:(px*c - py*s) + (tx+0.5)*tileSize,
                y:(px*s + py*c) + (ty+0.5)*tileSize,
            };
        };
        while (true) {
            visited[toIndex(tx,ty)] = true;
            point = getStartPoint(tx,ty,dirEnum);
            if (turn) {
                lastPoint = path[path.length-1];
                if (dir.x == 0) {
                    point.cx = point.x;
                    point.cy = lastPoint.y;
                }
                else {
                    point.cx = lastPoint.x;
                    point.cy = point.y;
                }
            }
            turn = false;
            turnAround = false;
            if (toIndex(tx+dir.y, ty-dir.x) in edges) {
                dirEnum = rotateLeft(dirEnum);
                turn = true;
            }
            else if (toIndex(tx+dir.x, ty+dir.y) in edges) {
            }
            else if (toIndex(tx-dir.y, ty+dir.x) in edges) {
                dirEnum = rotateRight(dirEnum);
                turn = true;
            }
            else {
                dirEnum = rotateAboutFace(dirEnum);
                turnAround = true;
            }
            setDirFromEnum(dir,dirEnum);
            path.push(point);
            if (turnAround) {
                path.push(getStartPoint(tx-dir.x, ty-dir.y, rotateAboutFace(dirEnum)));
                path.push(getStartPoint(tx, ty, dirEnum));
            }
            tx += dir.x;
            ty += dir.y;
            if (tx==init_tx && ty==init_ty && dirEnum == init_dirEnum) {
                that.paths.push(path);
                break;
            }
        }
    };
    i=0;
    for (y=0;y<this.numRows;y++)
        for (x=-2;x<this.numCols+2;x++,i++)
            if (i in edges && !(i in visited)) {
                visited[i] = true;
                makePath(x,y);
            }
};
Map.prototype.parseDots = function() {
    this.numDots = 0;
    this.numEnergizers = 0;
    this.energizers = [];
    var x,y;
    var i = 0;
    var tile;
    for (y=0; y<this.numRows; y++) for (x=0; x<this.numCols; x++) {
        tile = this.tiles[i];
        if (tile == '.') {
            this.numDots++;
        }
        else if (tile == 'o') {
            this.numDots++;
            this.numEnergizers++;
            this.energizers.push({'x':x,'y':y});
        }
        i++;
    }
};
Map.prototype.dotsLeft = function() {
    return this.numDots - this.dotsEaten;
};
Map.prototype.allDotsEaten = function() {
    return this.dotsLeft() == 0;
};
Map.prototype.parseTunnels = (function(){
    var getTunnelEntrance = function(x,y,dx) {
        while (!this.isFloorTile(x,y-1) && !this.isFloorTile(x,y+1) && this.isFloorTile(x,y))
            x += dx;
        return x;
    };
    var marginTiles = 2;
    return function() {
        this.tunnelRows = {};
        var y;
        var i;
        var left,right;
        for (y=0;y<this.numRows;y++)
            if (this.isFloorTile(0,y) && this.isFloorTile(this.numCols-1,y))
                this.tunnelRows[y] = {
                    'leftEntrance': getTunnelEntrance.call(this,0,y,1),
                    'rightEntrance':getTunnelEntrance.call(this,this.numCols-1,y,-1),
                    'leftExit': -marginTiles*tileSize,
                    'rightExit': (this.numCols+marginTiles)*tileSize-1,
                };
    };
})();
Map.prototype.teleport = function(actor){
    var i;
    var t = this.tunnelRows[actor.tile.y];
    if (t) {
        if (actor.pixel.x < t.leftExit)       actor.pixel.x = t.rightExit;
        else if (actor.pixel.x > t.rightExit) actor.pixel.x = t.leftExit;
    }
};
Map.prototype.posToIndex = function(x,y) {
    if (x>=0 && x<this.numCols && y>=0 && y<this.numRows)
        return x+y*this.numCols;
};
Map.prototype.isTunnelTile = function(x,y) {
    var tunnel = this.tunnelRows[y];
    return tunnel && (x < tunnel.leftEntrance || x > tunnel.rightEntrance);
};
Map.prototype.getTile = function(x,y) {
    if (x>=0 && x<this.numCols && y>=0 && y<this.numRows)
        return this.currentTiles[this.posToIndex(x,y)];
    if ((x<0 || x>=this.numCols) && (this.isTunnelTile(x,y-1) || this.isTunnelTile(x,y+1)))
        return '|';
    if (this.isTunnelTile(x,y))
        return ' ';
};
Map.prototype.isFloorTileChar = function(tile) {
    return tile==' ' || tile=='.' || tile=='o';
};
Map.prototype.isFloorTile = function(x,y) {
    return this.isFloorTileChar(this.getTile(x,y));
};
Map.prototype.onDotEat = function(x,y) {
    this.dotsEaten++;
    var i = this.posToIndex(x,y);
    this.currentTiles[i] = ' ';
    this.timeEaten[i] = vcr.getTime();
    renderer.erasePellet(x,y);
};
/**
 * Converts an RGB color value to HSL. Conversion formula
 * adapted from http:
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and l in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSL representation
 */
function rgbToHsl(r, g, b){
    r /= 255, g /= 255, b /= 255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, l = (max + min) / 2;
    if(max == min){
        h = s = 0;
    }else{
        var d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, l];
}
/**
 * Converts an HSL color value to RGB. Conversion formula
 * adapted from http:
 * Assumes h, s, and l are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  l       The lightness
 * @return  Array           The RGB representation
 */
function hslToRgb(h, s, l){
    var r, g, b;
    if(s == 0){
        r = g = b = l;
    }else{
        function hue2rgb(p, q, t){
            if(t < 0) t += 1;
            if(t > 1) t -= 1;
            if(t < 1/6) return p + (q - p) * 6 * t;
            if(t < 1/2) return q;
            if(t < 2/3) return p + (q - p) * (2/3 - t) * 6;
            return p;
        }
        var q = l < 0.5 ? l * (1 + s) : l + s - l * s;
        var p = 2 * l - q;
        r = hue2rgb(p, q, h + 1/3);
        g = hue2rgb(p, q, h);
        b = hue2rgb(p, q, h - 1/3);
    }
    r *= 255;
    g *= 255;
    b *= 255;
    return [r,g,b];
}
/**
 * Converts an RGB color value to HSV. Conversion formula
 * adapted from http:
 * Assumes r, g, and b are contained in the set [0, 255] and
 * returns h, s, and v in the set [0, 1].
 *
 * @param   Number  r       The red color value
 * @param   Number  g       The green color value
 * @param   Number  b       The blue color value
 * @return  Array           The HSV representation
 */
function rgbToHsv(r, g, b){
    r = r/255, g = g/255, b = b/255;
    var max = Math.max(r, g, b), min = Math.min(r, g, b);
    var h, s, v = max;
    var d = max - min;
    s = max == 0 ? 0 : d / max;
    if(max == min){
        h = 0;
    }else{
        switch(max){
            case r: h = (g - b) / d + (g < b ? 6 : 0); break;
            case g: h = (b - r) / d + 2; break;
            case b: h = (r - g) / d + 4; break;
        }
        h /= 6;
    }
    return [h, s, v];
}
/**
 * Converts an HSV color value to RGB. Conversion formula
 * adapted from http:
 * Assumes h, s, and v are contained in the set [0, 1] and
 * returns r, g, and b in the set [0, 255].
 *
 * @param   Number  h       The hue
 * @param   Number  s       The saturation
 * @param   Number  v       The value
 * @return  Array           The RGB representation
 */
function hsvToRgb(h, s, v){
    var r, g, b;
    var i = Math.floor(h * 6);
    var f = h * 6 - i;
    var p = v * (1 - s);
    var q = v * (1 - f * s);
    var t = v * (1 - (1 - f) * s);
    switch(i % 6){
        case 0: r = v, g = t, b = p; break;
        case 1: r = q, g = v, b = p; break;
        case 2: r = p, g = v, b = t; break;
        case 3: r = p, g = q, b = v; break;
        case 4: r = t, g = p, b = v; break;
        case 5: r = v, g = p, b = q; break;
    }
    r *= 255;
    g *= 255;
    b *= 255;
    return [r,g,b];
}
function rgbString(rgb) {
    var r = Math.floor(rgb[0]);
    var g = Math.floor(rgb[1]);
    var b = Math.floor(rgb[2]);
    return 'rgb('+r+','+g+','+b+')';
}
var mapgen = (function(){
    var shuffle = function(list) {
        var len = list.length;
        var i,j;
        var temp;
        for (i=0; i<len; i++) {
            j = getRandomInt(0,len-1);
            temp = list[i];
            list[i] = list[j];
            list[j] = temp;
        }
    };
    var randomElement = function(list) {
        var len = list.length;
        if (len > 0) {
            return list[getRandomInt(0,len-1)];
        }
    };
    var UP = 0;
    var RIGHT = 1;
    var DOWN = 2;
    var LEFT = 3;
    var cells = [];
    var tallRows = [];
    var narrowCols = [];
    var rows = 9;
    var cols = 5;
    var reset = function() {
        var i;
        var c;
        for (i=0; i<rows*cols; i++) {
            cells[i] = {
                x: i%cols,
                y: Math.floor(i/cols),
                filled: false,
                connect: [false, false, false, false],
                next: [],
                no: undefined,
                group: undefined,
            };
        }
        for (i=0; i<rows*cols; i++) {
            var c = cells[i];
            if (c.x > 0)
                c.next[LEFT] = cells[i-1];
            if (c.x < cols - 1)
                c.next[RIGHT] = cells[i+1];
            if (c.y > 0)
                c.next[UP] = cells[i-cols];
            if (c.y < rows - 1)
                c.next[DOWN] = cells[i+cols];
        }
        i = 3*cols;
        c = cells[i];
        c.filled=true;
        c.connect[LEFT] = c.connect[RIGHT] = c.connect[DOWN] = true;
        i++;
        c = cells[i];
        c.filled=true;
        c.connect[LEFT] = c.connect[DOWN] = true;
        i+=cols-1;
        c = cells[i];
        c.filled=true;
        c.connect[LEFT] = c.connect[UP] = c.connect[RIGHT] = true;
        i++;
        c = cells[i];
        c.filled=true;
        c.connect[UP] = c.connect[LEFT] = true;
    };
    var genRandom = function() {
        var getLeftMostEmptyCells = function() {
            var x;
            var leftCells = [];
            for (x=0; x<cols; x++) {
                for (y=0; y<rows; y++) {
                    var c = cells[x+y*cols];
                    if (!c.filled) {
                        leftCells.push(c);
                    }
                }
                if (leftCells.length > 0) {
                    break;
                }
            }
            return leftCells;
        };
        var isOpenCell = function(cell,i,prevDir,size) {
            if (cell.y == 6 && cell.x == 0 && i == DOWN ||
                cell.y == 7 && cell.x == 0 && i == UP) {
                return false;
            }
            if (size == 2 && (i==prevDir || rotateAboutFace(i)==prevDir)) {
                return false;
            }
            if (cell.next[i] && !cell.next[i].filled) {
                if (cell.next[i].next[LEFT] && !cell.next[i].next[LEFT].filled) {
                }
                else {
                    return true;
                }
            }
            return false;
        };
        var getOpenCells = function(cell,prevDir,size) {
            var openCells = [];
            var numOpenCells = 0;
            for (i=0; i<4; i++) {
                if (isOpenCell(cell,i,prevDir,size)) {
                    openCells.push(i);
                    numOpenCells++;
                }
            }
            return { openCells: openCells, numOpenCells: numOpenCells };
        };
        var connectCell = function(cell,dir) {
            cell.connect[dir] = true;
            cell.next[dir].connect[rotateAboutFace(dir)] = true;
            if (cell.x == 0 && dir == RIGHT) {
                cell.connect[LEFT] = true;
            }
        };
        var gen = function() {
            var cell;
            var newCell;
            var firstCell;
            var openCells;
            var numOpenCells;
            var dir;
            var i;
            var numFilled = 0;
            var numGroups;
            var size;
            var probStopGrowingAtSize = [
                    0,
                    0,
                    0.10,
                    0.5,
                    0.75,
                    1];
            var singleCount = {};
            singleCount[0] = singleCount[rows-1] = 0;
            var probTopAndBotSingleCellJoin = 0.35;
            var longPieces = 0;
            var maxLongPieces = 1;
            var probExtendAtSize2 = 1;
            var probExtendAtSize3or4 = 0.5;
            var fillCell = function(cell) {
                cell.filled = true;
                cell.no = numFilled++;
                cell.group = numGroups;
            };
            for (numGroups=0; ; numGroups++) {
                openCells = getLeftMostEmptyCells();
                numOpenCells = openCells.length;
                if (numOpenCells == 0) {
                    break;
                }
                firstCell = cell = openCells[getRandomInt(0,numOpenCells-1)];
                fillCell(cell);
                if (cell.x < cols-1 && (cell.y in singleCount) && Math.random() <= probTopAndBotSingleCellJoin) {
                    if (singleCount[cell.y] == 0) {
                        cell.connect[cell.y == 0 ? UP : DOWN] = true;
                        singleCount[cell.y]++;
                        continue;
                    }
                }
                size = 1;
                if (cell.x == cols-1) {
                    cell.connect[RIGHT] = true;
                    cell.isRaiseHeightCandidate = true;
                }
                else {
                    while (size < 5) {
                        var stop = false;
                        if (size == 2) {
                            var c = firstCell;
                            if (c.x > 0 && c.connect[RIGHT] && c.next[RIGHT] && c.next[RIGHT].next[RIGHT]) {
                                if (longPieces < maxLongPieces && Math.random() <= probExtendAtSize2) {
                                    c = c.next[RIGHT].next[RIGHT];
                                    var dirs = {};
                                    if (isOpenCell(c,UP)) {
                                        dirs[UP] = true;
                                    }
                                    if (isOpenCell(c,DOWN)) {
                                        dirs[DOWN] = true;
                                    }
                                    if (dirs[UP] && dirs[DOWN]) {
                                        i = [UP,DOWN][getRandomInt(0,1)];
                                    }
                                    else if (dirs[UP]) {
                                        i = UP;
                                    }
                                    else if (dirs[DOWN]) {
                                        i = DOWN;
                                    }
                                    else {
                                        i = undefined;
                                    }
                                    if (i != undefined) {
                                        connectCell(c,LEFT);
                                        fillCell(c);
                                        connectCell(c,i);
                                        fillCell(c.next[i]);
                                        longPieces++;
                                        size+=2;
                                        stop = true;
                                    }
                                }
                            }
                        }
                        if (!stop) {
                            var result = getOpenCells(cell,dir,size);
                            openCells = result['openCells'];
                            numOpenCells = result['numOpenCells'];
                            if (numOpenCells == 0 && size == 2) {
                                cell = newCell;
                                result = getOpenCells(cell,dir,size);
                                openCells = result['openCells'];
                                numOpenCells = result['numOpenCells'];
                            }
                            if (numOpenCells == 0) {
                                stop = true;
                            }
                            else {
                                dir = openCells[getRandomInt(0,numOpenCells-1)];
                                newCell = cell.next[dir];
                                connectCell(cell,dir);
                                fillCell(newCell);
                                size++;
                                if (firstCell.x == 0 && size == 3) {
                                    stop = true;
                                }
                                if (Math.random() <= probStopGrowingAtSize[size]) {
                                    stop = true;
                                }
                            }
                        }
                        if (stop) {
                            if (size == 1) {
                            }
                            else if (size == 2) {
                                var c = firstCell;
                                if (c.x == cols-1) {
                                    if (c.connect[UP]) {
                                        c = c.next[UP];
                                    }
                                    c.connect[RIGHT] = c.next[DOWN].connect[RIGHT] = true;
                                }
                            }
                            else if (size == 3 || size == 4) {
                                if (longPieces < maxLongPieces && firstCell.x > 0 && Math.random() <= probExtendAtSize3or4) {
                                    var dirs = [];
                                    var dirsLength = 0;
                                    for (i=0; i<4; i++) {
                                        if (cell.connect[i] && isOpenCell(cell.next[i],i)) {
                                            dirs.push(i);
                                            dirsLength++;
                                        }
                                    }
                                    if (dirsLength > 0) {
                                        i = dirs[getRandomInt(0,dirsLength-1)];
                                        c = cell.next[i];
                                        connectCell(c,i);
                                        fillCell(c.next[i]);
                                        longPieces++;
                                    }
                                }
                            }
                            break;
                        }
                    }
                }
            }
            setResizeCandidates();
        };
        var setResizeCandidates = function() {
            var i;
            var c,q,c2,q2;
            var x,y;
            for (i=0; i<rows*cols; i++) {
                c = cells[i];
                x = i % cols;
                y = Math.floor(i/cols);
                q = c.connect;
                if ((c.x == 0 || !q[LEFT]) &&
                    (c.x == cols-1 || !q[RIGHT]) &&
                    q[UP] != q[DOWN]) {
                    c.isRaiseHeightCandidate = true;
                }
                c2 = c.next[RIGHT];
                if (c2 != undefined) {
                    q2 = c2.connect;
                    if (((c.x == 0 || !q[LEFT]) && !q[UP] && !q[DOWN]) &&
                        ((c2.x == cols-1 || !q2[RIGHT]) && !q2[UP] && !q2[DOWN])
                        ) {
                        c.isRaiseHeightCandidate = c2.isRaiseHeightCandidate = true;
                    }
                }
                if (c.x == cols-1 && q[RIGHT]) {
                    c.isShrinkWidthCandidate = true;
                }
                if ((c.y == 0 || !q[UP]) &&
                    (c.y == rows-1 || !q[DOWN]) &&
                    q[LEFT] != q[RIGHT]) {
                    c.isShrinkWidthCandidate = true;
                }
            }
        };
        var cellIsCrossCenter = function(c) {
            return c.connect[UP] && c.connect[RIGHT] && c.connect[DOWN] && c.connect[LEFT];
        };
        var chooseNarrowCols = function() {
            var canShrinkWidth = function(x,y) {
                if (y==rows-1) {
                    return true;
                }
                var x0;
                var c,c2;
                for (x0=x; x0<cols; x0++) {
                    c = cells[x0+y*cols];
                    c2 = c.next[DOWN]
                    if ((!c.connect[RIGHT] || cellIsCrossCenter(c)) &&
                        (!c2.connect[RIGHT] || cellIsCrossCenter(c2))) {
                        break;
                    }
                }
                var candidates = [];
                var numCandidates = 0;
                for (; c2; c2=c2.next[LEFT]) {
                    if (c2.isShrinkWidthCandidate) {
                        candidates.push(c2);
                        numCandidates++;
                    }
                    if ((!c2.connect[LEFT] || cellIsCrossCenter(c2)) &&
                        (!c2.next[UP].connect[LEFT] || cellIsCrossCenter(c2.next[UP]))) {
                        break;
                    }
                }
                shuffle(candidates);
                var i;
                for (i=0; i<numCandidates; i++) {
                    c2 = candidates[i];
                    if (canShrinkWidth(c2.x,c2.y)) {
                        c2.shrinkWidth = true;
                        narrowCols[c2.y] = c2.x;
                        return true;
                    }
                }
                return false;
            };
            var x;
            var c;
            for (x=cols-1; x>=0; x--) {
                c = cells[x];
                if (c.isShrinkWidthCandidate && canShrinkWidth(x,0)) {
                    c.shrinkWidth = true;
                    narrowCols[c.y] = c.x;
                    return true;
                }
            }
            return false;
        };
        var chooseTallRows = function() {
            var canRaiseHeight = function(x,y) {
                if (x==cols-1) {
                    return true;
                }
                var y0;
                var c;
                var c2;
                for (y0=y; y0>=0; y0--) {
                    c = cells[x+y0*cols];
                    c2 = c.next[RIGHT]
                    if ((!c.connect[UP] || cellIsCrossCenter(c)) &&
                        (!c2.connect[UP] || cellIsCrossCenter(c2))) {
                        break;
                    }
                }
                var candidates = [];
                var numCandidates = 0;
                for (; c2; c2=c2.next[DOWN]) {
                    if (c2.isRaiseHeightCandidate) {
                        candidates.push(c2);
                        numCandidates++;
                    }
                    if ((!c2.connect[DOWN] || cellIsCrossCenter(c2)) &&
                        (!c2.next[LEFT].connect[DOWN] || cellIsCrossCenter(c2.next[LEFT]))) {
                        break;
                    }
                }
                shuffle(candidates);
                var i;
                for (i=0; i<numCandidates; i++) {
                    c2 = candidates[i];
                    if (canRaiseHeight(c2.x,c2.y)) {
                        c2.raiseHeight = true;
                        tallRows[c2.x] = c2.y;
                        return true;
                    }
                }
                return false;
            };
            var y;
            var c;
            for (y=0; y<3; y++) {
                c = cells[y*cols];
                if (c.isRaiseHeightCandidate && canRaiseHeight(0,y)) {
                    c.raiseHeight = true;
                    tallRows[c.x] = c.y;
                    return true;
                }
            }
            return false;
        };
        var isDesirable = function() {
            var c = cells[4];
            if (c.connect[UP] || c.connect[RIGHT]) {
                return false;
            }
            c = cells[rows*cols-1];
            if (c.connect[DOWN] || c.connect[RIGHT]) {
                return false;
            }
            var isHori = function(x,y) {
                var q1 = cells[x+y*cols].connect;
                var q2 = cells[x+1+y*cols].connect;
                return !q1[UP] && !q1[DOWN] && (x==0 || !q1[LEFT]) && q1[RIGHT] &&
                       !q2[UP] && !q2[DOWN] && q2[LEFT] && !q2[RIGHT];
            };
            var isVert = function(x,y) {
                var q1 = cells[x+y*cols].connect;
                var q2 = cells[x+(y+1)*cols].connect;
                if (x==cols-1) {
                    return !q1[LEFT] && !q1[UP] && !q1[DOWN] &&
                           !q2[LEFT] && !q2[UP] && !q2[DOWN];
                }
                return !q1[LEFT] && !q1[RIGHT] && !q1[UP] && q1[DOWN] &&
                       !q2[LEFT] && !q2[RIGHT] && q2[UP] && !q2[DOWN];
            };
            var x,y;
            var g;
            for (y=0; y<rows-1; y++) {
                for (x=0; x<cols-1; x++) {
                    if (isHori(x,y) && isHori(x,y+1) ||
                        isVert(x,y) && isVert(x+1,y)) {
                        if (x==0) {
                            return false;
                        }
                        cells[x+y*cols].connect[DOWN] = true;
                        cells[x+y*cols].connect[RIGHT] = true;
                        g = cells[x+y*cols].group;
                        cells[x+1+y*cols].connect[DOWN] = true;
                        cells[x+1+y*cols].connect[LEFT] = true;
                        cells[x+1+y*cols].group = g;
                        cells[x+(y+1)*cols].connect[UP] = true;
                        cells[x+(y+1)*cols].connect[RIGHT] = true;
                        cells[x+(y+1)*cols].group = g;
                        cells[x+1+(y+1)*cols].connect[UP] = true;
                        cells[x+1+(y+1)*cols].connect[LEFT] = true;
                        cells[x+1+(y+1)*cols].group = g;
                    }
                }
            }
            if (!chooseTallRows()) {
                return false;
            }
            if (!chooseNarrowCols()) {
                return false;
            }
            return true;
        };
        var setUpScaleCoords = function() {
            var i,c;
            for (i=0; i<rows*cols; i++) {
                c = cells[i];
                c.final_x = c.x*3;
                if (narrowCols[c.y] < c.x) {
                    c.final_x--;
                }
                c.final_y = c.y*3;
                if (tallRows[c.x] < c.y) {
                    c.final_y++;
                }
                c.final_w = c.shrinkWidth ? 2 : 3;
                c.final_h = c.raiseHeight ? 4 : 3;
            }
        };
        var reassignGroup = function(oldg,newg) {
            var i;
            var c;
            for (i=0; i<rows*cols; i++) {
                c = cells[i];
                if (c.group == oldg) {
                    c.group = newg;
                }
            }
        };
        var createTunnels = function() {
            var singleDeadEndCells = [];
            var topSingleDeadEndCells = [];
            var botSingleDeadEndCells = [];
            var voidTunnelCells = [];
            var topVoidTunnelCells = [];
            var botVoidTunnelCells = [];
            var edgeTunnelCells = [];
            var topEdgeTunnelCells = [];
            var botEdgeTunnelCells = [];
            var doubleDeadEndCells = [];
            var numTunnelsCreated = 0;
            var y;
            var c;
            var upDead;
            var downDead;
            for (y=0; y<rows; y++) {
                c = cells[cols-1+y*cols];
                if (c.connect[UP]) {
                    continue;
                }
                if (c.y > 1 && c.y < rows-2) {
                    c.isEdgeTunnelCandidate = true;
                    edgeTunnelCells.push(c);
                    if (c.y <= 2) {
                        topEdgeTunnelCells.push(c);
                    }
                    else if (c.y >= 5) {
                        botEdgeTunnelCells.push(c);
                    }
                }
                upDead = (!c.next[UP] || c.next[UP].connect[RIGHT]);
                downDead = (!c.next[DOWN] || c.next[DOWN].connect[RIGHT]);
                if (c.connect[RIGHT]) {
                    if (upDead) {
                        c.isVoidTunnelCandidate = true;
                        voidTunnelCells.push(c);
                        if (c.y <= 2) {
                            topVoidTunnelCells.push(c);
                        }
                        else if (c.y >= 6) {
                            botVoidTunnelCells.push(c);
                        }
                    }
                }
                else {
                    if (c.connect[DOWN]) {
                        continue;
                    }
                    if (upDead != downDead) {
                        if (!c.raiseHeight && y < rows-1 && !c.next[LEFT].connect[LEFT]) {
                            singleDeadEndCells.push(c);
                            c.isSingleDeadEndCandidate = true;
                            c.singleDeadEndDir = upDead ? UP : DOWN;
                            var offset = upDead ? 1 : 0;
                            if (c.y <= 1+offset) {
                                topSingleDeadEndCells.push(c);
                            }
                            else if (c.y >= 5+offset) {
                                botSingleDeadEndCells.push(c);
                            }
                        }
                    }
                    else if (upDead && downDead) {
                        if (y > 0 && y < rows-1) {
                            if (c.next[LEFT].connect[UP] && c.next[LEFT].connect[DOWN]) {
                                c.isDoubleDeadEndCandidate = true;
                                if (c.y >= 2 && c.y <= 5) {
                                    doubleDeadEndCells.push(c);
                                }
                            }
                        }
                    }
                }
            }
            var numTunnelsDesired = Math.random() <= 0.45 ? 2 : 1;
            var c;
            var selectSingleDeadEnd = function(c) {
                c.connect[RIGHT] = true;
                if (c.singleDeadEndDir == UP) {
                    c.topTunnel = true;
                }
                else {
                    c.next[DOWN].topTunnel = true;
                }
            };
            if (numTunnelsDesired == 1) {
                if (c = randomElement(voidTunnelCells)) {
                    c.topTunnel = true;
                }
                else if (c = randomElement(singleDeadEndCells)) {
                    selectSingleDeadEnd(c);
                }
                else if (c = randomElement(edgeTunnelCells)) {
                    c.topTunnel = true;
                }
                else {
                    return false;
                }
            }
            else if (numTunnelsDesired == 2) {
                if (c = randomElement(doubleDeadEndCells)) {
                    c.connect[RIGHT] = true;
                    c.topTunnel = true;
                    c.next[DOWN].topTunnel = true;
                }
                else {
                    numTunnelsCreated = 1;
                    if (c = randomElement(topVoidTunnelCells)) {
                        c.topTunnel = true;
                    }
                    else if (c = randomElement(topSingleDeadEndCells)) {
                        selectSingleDeadEnd(c);
                    }
                    else if (c = randomElement(topEdgeTunnelCells)) {
                        c.topTunnel = true;
                    }
                    else {
                        numTunnelsCreated = 0;
                    }
                    if (c = randomElement(botVoidTunnelCells)) {
                        c.topTunnel = true;
                    }
                    else if (c = randomElement(botSingleDeadEndCells)) {
                        selectSingleDeadEnd(c);
                    }
                    else if (c = randomElement(botEdgeTunnelCells)) {
                        c.topTunnel = true;
                    }
                    else {
                        if (numTunnelsCreated == 0) {
                            return false;
                        }
                    }
                }
            }
            var exit,topy;
            for (y=0; y<rows; y++) {
                c = cells[cols-1+y*cols];
                if (c.topTunnel) {
                    exit = true;
                    topy = c.final_y;
                    while (c.next[LEFT]) {
                        c = c.next[LEFT];
                        if (!c.connect[UP] && c.final_y == topy) {
                            continue;
                        }
                        else {
                            exit = false;
                            break;
                        }
                    }
                    if (exit) {
                        return false;
                    }
                }
            }
            var len = voidTunnelCells.length;
            var i;
            var replaceGroup = function(oldg,newg) {
                var i,c;
                for (i=0; i<rows*cols; i++) {
                    c = cells[i];
                    if (c.group == oldg) {
                        c.group = newg;
                    }
                }
            };
            for (i=0; i<len; i++) {
                c = voidTunnelCells[i];
                if (!c.topTunnel) {
                    replaceGroup(c.group, c.next[UP].group);
                    c.connect[UP] = true;
                    c.next[UP].connect[DOWN] = true;
                }
            }
            return true;
        };
        var joinWalls = function() {
            var x,y;
            var c;
            for (x=0; x<cols; x++) {
                c = cells[x];
                if (!c.connect[LEFT] && !c.connect[RIGHT] && !c.connect[UP] &&
                    (!c.connect[DOWN] || !c.next[DOWN].connect[DOWN])) {
                    if ((!c.next[LEFT] || !c.next[LEFT].connect[UP]) &&
                        (c.next[RIGHT] && !c.next[RIGHT].connect[UP])) {
                        if (!(c.next[DOWN] && c.next[DOWN].connect[RIGHT] && c.next[DOWN].next[RIGHT].connect[RIGHT])) {
                            c.isJoinCandidate = true;
                            if (Math.random() <= 0.25) {
                                c.connect[UP] = true;
                            }
                        }
                    }
                }
            }
            for (x=0; x<cols; x++) {
                c = cells[x+(rows-1)*cols];
                if (!c.connect[LEFT] && !c.connect[RIGHT] && !c.connect[DOWN] &&
                    (!c.connect[UP] || !c.next[UP].connect[UP])) {
                    if ((!c.next[LEFT] || !c.next[LEFT].connect[DOWN]) &&
                        (c.next[RIGHT] && !c.next[RIGHT].connect[DOWN])) {
                        if (!(c.next[UP] && c.next[UP].connect[RIGHT] && c.next[UP].next[RIGHT].connect[RIGHT])) {
                            c.isJoinCandidate = true;
                            if (Math.random() <= 0.25) {
                                c.connect[DOWN] = true;
                            }
                        }
                    }
                }
            }
            var c2;
            for (y=1; y<rows-1; y++) {
                c = cells[cols-1+y*cols];
                if (c.raiseHeight) {
                    continue;
                }
                if (!c.connect[RIGHT] && !c.connect[UP] && !c.connect[DOWN] &&
                    !c.next[UP].connect[RIGHT] && !c.next[DOWN].connect[RIGHT]) {
                    if (c.connect[LEFT]) {
                        c2 = c.next[LEFT];
                        if (!c2.connect[UP] && !c2.connect[DOWN] && !c2.connect[LEFT]) {
                            c.isJoinCandidate = true;
                            if (Math.random() <= 0.5) {
                                c.connect[RIGHT] = true;
                            }
                        }
                    }
                }
            }
        };
        var genCount = 0;
        while (true) {
            reset();
            gen();
            genCount++;
            if (!isDesirable()) {
                continue;
            }
            setUpScaleCoords();
            joinWalls();
            if (!createTunnels()) {
                continue;
            }
            break;
        }
    };
    var getTiles = function() {
        var tiles = [];
        var tileCells = [];
        var subrows = rows*3+1+3;
        var subcols = cols*3-1+2;
        var midcols = subcols-2;
        var fullcols = (subcols-2)*2;
        var setTile = function(x,y,v) {
            if (x<0 || x>subcols-1 || y<0 || y>subrows-1) {
                return;
            }
            x -= 2;
            tiles[midcols+x+y*fullcols] = v;
            tiles[midcols-1-x+y*fullcols] = v;
        };
        var getTile = function(x,y) {
            if (x<0 || x>subcols-1 || y<0 || y>subrows-1) {
                return undefined;
            }
            x -= 2;
            return tiles[midcols+x+y*fullcols];
        };
        var setTileCell = function(x,y,cell) {
            if (x<0 || x>subcols-1 || y<0 || y>subrows-1) {
                return;
            }
            x -= 2;
            tileCells[x+y*subcols] = cell;
        };
        var getTileCell = function(x,y) {
            if (x<0 || x>subcols-1 || y<0 || y>subrows-1) {
                return undefined;
            }
            x -= 2;
            return tileCells[x+y*subcols];
        };
        var i;
        for (i=0; i<subrows*fullcols; i++) {
            tiles.push('_');
        }
        for (i=0; i<subrows*subcols; i++) {
            tileCells.push(undefined);
        }
        var c;
        var x,y,w,h;
        var x0,y0;
        for (i=0; i<rows*cols; i++) {
            c = cells[i];
            for (x0=0; x0<c.final_w; x0++) {
                for (y0=0; y0<c.final_h; y0++) {
                    setTileCell(c.final_x+x0,c.final_y+1+y0,c);
                }
            }
        }
        var cl, cu;
        for (y=0; y<subrows; y++) {
            for (x=0; x<subcols; x++) {
                c = getTileCell(x,y);
                cl = getTileCell(x-1,y);
                cu = getTileCell(x,y-1);
                if (c) {
                    if (cl && c.group != cl.group ||
                        cu && c.group != cu.group ||
                        !cu && !c.connect[UP]) {
                        setTile(x,y,'.');
                    }
                }
                else {
                    if (cl && (!cl.connect[RIGHT] || getTile(x-1,y) == '.') ||
                        cu && (!cu.connect[DOWN] || getTile(x,y-1) == '.')) {
                        setTile(x,y,'.');
                    }
                }
                if (getTile(x-1,y) == '.' && getTile(x,y-1) == '.' && getTile(x-1,y-1) == '_') {
                    setTile(x,y,'.');
                }
            }
        }
        var y;
        for (c=cells[cols-1]; c; c = c.next[DOWN]) {
            if (c.topTunnel) {
                y = c.final_y+1;
                setTile(subcols-1, y,'.');
                setTile(subcols-2, y,'.');
            }
        }
        for (y=0; y<subrows; y++) {
            for (x=0; x<subcols; x++) {
                if (getTile(x,y) != '.' && (getTile(x-1,y) == '.' || getTile(x,y-1) == '.' || getTile(x+1,y) == '.' || getTile(x,y+1) == '.' ||
                    getTile(x-1,y-1) == '.' || getTile(x+1,y-1) == '.' || getTile(x+1,y+1) == '.' || getTile(x-1,y+1) == '.')) {
                    setTile(x,y,'|');
                }
            }
        }
        setTile(2,12,'-');
        var getTopEnergizerRange = function() {
            var miny;
            var maxy = subrows/2;
            var x = subcols-2;
            var y;
            for (y=2; y<maxy; y++) {
                if (getTile(x,y) == '.' && getTile(x,y+1) == '.') {
                    miny = y+1;
                    break;
                }
            }
            maxy = Math.min(maxy,miny+7);
            for (y=miny+1; y<maxy; y++) {
                if (getTile(x-1,y) == '.') {
                    maxy = y-1;
                    break;
                }
            }
            return {miny:miny, maxy:maxy};
        };
        var getBotEnergizerRange = function() {
            var miny = subrows/2;
            var maxy;
            var x = subcols-2;
            var y;
            for (y=subrows-3; y>=miny; y--) {
                if (getTile(x,y) == '.' && getTile(x,y+1) == '.') {
                    maxy = y;
                    break;
                }
            }
            miny = Math.max(miny,maxy-7);
            for (y=maxy-1; y>miny; y--) {
                if (getTile(x-1,y) == '.') {
                    miny = y+1;
                    break;
                }
            }
            return {miny:miny, maxy:maxy};
        };
        var x = subcols-2;
        var y;
        var range;
        if (range = getTopEnergizerRange()) {
            y = getRandomInt(range.miny, range.maxy);
            setTile(x,y,'o');
        }
        if (range = getBotEnergizerRange()) {
            y = getRandomInt(range.miny, range.maxy);
            setTile(x,y,'o');
        }
        var eraseUntilIntersection = function(x,y) {
            var adj;
            while (true) {
                adj = [];
                if (getTile(x-1,y) == '.') {
                    adj.push({x:x-1,y:y});
                }
                if (getTile(x+1,y) == '.') {
                    adj.push({x:x+1,y:y});
                }
                if (getTile(x,y-1) == '.') {
                    adj.push({x:x,y:y-1});
                }
                if (getTile(x,y+1) == '.') {
                    adj.push({x:x,y:y+1});
                }
                if (adj.length == 1) {
                    setTile(x,y,' ');
                    x = adj[0].x;
                    y = adj[0].y;
                }
                else {
                    break;
                }
            }
        };
        x = subcols-1;
        for (y=0; y<subrows; y++) {
            if (getTile(x,y) == '.') {
                eraseUntilIntersection(x,y);
            }
        }
        setTile(1,subrows-8,' ');
        var i,j;
        var y;
        for (i=0; i<7; i++) {
            y = subrows-14;
            setTile(i, y, ' ');
            j = 1;
            while (getTile(i,y+j) == '.' &&
                    getTile(i-1,y+j) == '|' &&
                    getTile(i+1,y+j) == '|') {
                setTile(i,y+j,' ');
                j++;
            }
            y = subrows-20;
            setTile(i, y, ' ');
            j = 1;
            while (getTile(i,y-j) == '.' &&
                    getTile(i-1,y-j) == '|' &&
                    getTile(i+1,y-j) == '|') {
                setTile(i,y-j,' ');
                j++;
            }
        }
        for (i=0; i<7; i++) {
            x = 6;
            y = subrows-14-i;
            setTile(x, y, ' ');
            j = 1;
            while (getTile(x+j,y) == '.' &&
                    getTile(x+j,y-1) == '|' &&
                    getTile(x+j,y+1) == '|') {
                setTile(x+j,y,' ');
                j++;
            }
        }
        return (
            "____________________________" +
            "____________________________" +
            "____________________________" +
            tiles.join("") +
            "____________________________" +
            "____________________________");
    };
    var randomColor = function() {
        return '#'+('00000'+(Math.random()*(1<<24)|0).toString(16)).slice(-6);
    };
    var getShortestDistGraph = function(map,x0,y0,isNodeTile) {
        var graph = {};
        var x,y,i,j;
        for (y=0; y<36; y++) {
            for (x=0; x<28; x++) {
                if (isNodeTile(x,y)) {
                    i = x+y*28;
                    graph[i] = {'x':x, 'y':y, 'dist':Infinity, 'penult':undefined, 'neighbors':[], 'completed':false};
                    if (isNodeTile(x-1,y)) {
                        j = i-1;
                        graph[i].neighbors.push(graph[j]);
                        graph[j].neighbors.push(graph[i]);
                    }
                    if (isNodeTile(x,y-1)) {
                        j = i-28;
                        graph[i].neighbors.push(graph[j]);
                        graph[j].neighbors.push(graph[i]);
                    }
                }
            }
        }
        var node = graph[x0+y0*28];
        node.completed = true;
        node.dist = 0;
        var d;
        var next_node,min_dist,dist;
        while (true) {
            for (i=0; i<4; i++) {
                d = node.neighbors[i];
                if (d && !d.completed) {
                    dist = node.dist+1;
                    if (dist == d.dist) {
                        if (Math.random() < 0.5) {
                            d.penult = node;
                        }
                    }
                    else if (dist < d.dist) {
                        d.dist = dist;
                        d.penult = node;
                    }
                }
            }
            next_node = undefined;
            min_dist = Infinity;
            for (i=0; i<28*36; i++) {
                d = graph[i];
                if (d && !d.completed) {
                    if (d.dist < min_dist) {
                        next_node = d;
                        min_dist = d.dist;
                    }
                }
            }
            if (!next_node) {
                break;
            }
            node = next_node;
            node.completed = true;
        }
        return graph;
    };
    var getDirFromPenult = function(node) {
        if (!node.penult) {
            return undefined;
        }
        var dx = node.x - node.penult.x;
        var dy = node.y - node.penult.y;
        if (dy == -1) {
            return DIR_UP;
        }
        else if (dy == 1) {
            return DIR_DOWN;
        }
        else if (dx == -1) {
            return DIR_LEFT;
        }
        else if (dx == 1) {
            return DIR_RIGHT;
        }
    };
    var makeExitPaths = function(map) {
        var isNodeTile = function(x,y) {
            if (x<0 || x>=28 || y<0 || y>=36) {
                return false;
            }
            return map.isFloorTile(x,y);
        };
        var graph = getShortestDistGraph(map,map.doorTile.x,map.doorTile.y,isNodeTile);
        map.getExitDir = function(x,y) {
            if (x<0 || x>=28 || y<0 || y>=36) {
                return undefined;
            }
            var node = graph[x+y*28];
            var dirEnum = getDirFromPenult(node);
            if (dirEnum != undefined) {
                return rotateAboutFace(dirEnum);
            }
        };
    };
    var makeFruitPaths = (function(){
        var reversed = {
            'v':'^',
            '^':'v',
            '<':'>',
            '>':'<',
        };
        var reversePath = function(path) {
            var rpath = "";
            var i;
            for (i=path.length-1; i>=0; i--) {
                rpath += reversed[path[i]];
            }
            return rpath;
        };
        var dirChars = {};
        dirChars[DIR_UP] = '^';
        dirChars[DIR_DOWN] = 'v';
        dirChars[DIR_LEFT] = '<';
        dirChars[DIR_RIGHT] = '>';
        var getPathFromGraph = function(graph,x0,y0,x1,y1,reverse) {
            var start_node = graph[x0+y0*28];
            var dx,dy;
            var path = "";
            var node;
            for (node=graph[x1+y1*28]; node!=start_node; node=node.penult) {
                path = dirChars[getDirFromPenult(node)] + path;
            }
            return reverse ? reversePath(path) : path;
        }
        return function(map) {
            paths = {entrances:[], exits:[]};
            var isFloorTile = function(x,y) {
                if (x<0 || x>=28 || y<0 || y>=36) {
                    return false
                }
                return map.isFloorTile(x,y);
            };
            enter_graph = getShortestDistGraph(map,15,20, function(x,y) { return (x==14 && y==20) ? false : isFloorTile(x,y); });
            exit_graph =  getShortestDistGraph(map,16,20, function(x,y) { return (x==17 && y==20) ? false : isFloorTile(x,y); });
            for (y=0; y<36; y++) {
                if (map.isFloorTile(-1,y)) {
                    paths.entrances.push({
                        'start': {'y':y*8+4, 'x': -4},
                        'path': '>'+getPathFromGraph(enter_graph, 15,20, 0,y, true)});
                    paths.entrances.push({
                        'start': {'y':y*8+4, 'x': 28*8+4},
                        'path': '<'+getPathFromGraph(enter_graph, 15,20, 27,y, true)});
                    paths.exits.push({
                        'start': {'y':y*8+4, 'x': -4},
                        'path': getPathFromGraph(exit_graph, 16,20, 0,y, false)+'<'});
                    paths.exits.push({
                        'start': {'y':y*8+4, 'x': 28*8+4},
                        'path': getPathFromGraph(exit_graph, 16,20, 27,y, false)+'>'});
                }
            }
            map.fruitPaths = paths;
        };
    })();
    return function() {
        genRandom();
        var map = new Map(28,36,getTiles());
        makeFruitPaths(map);
        makeExitPaths(map);
        map.name = "Random Map";
        map.wallFillColor = randomColor();
        map.wallStrokeColor = rgbString(hslToRgb(Math.random(), Math.random(), Math.random() * 0.4 + 0.6));
        map.pelletColor = "#ffb8ae";
        return map;
    };
})();
var atlas = (function(){
    var canvas,ctx;
    var size = 22;
    var cols = 14;
    var rows = 22;
    var creates = 0;
    var drawGrid = function() {
        var canvas = document.getElementById('gridcanvas');
        if (!canvas) {
            return;
        }
        var w = size*cols*renderScale;
        var h = size*rows*renderScale;
        canvas.width = w;
        canvas.height = h;
        var ctx = canvas.getContext('2d');
        ctx.clearRect(0,0,w,h);
        var x,y;
        var step = size*renderScale;
        ctx.beginPath();
        for (x=0; x<=w; x+=step) {
            ctx.moveTo(x,0);
            ctx.lineTo(x,h);
        }
        for (y=0; y<=h; y+=step) {
            ctx.moveTo(0,y);
            ctx.lineTo(w,y);
        }
        ctx.lineWidth = "1px";
        ctx.lineCap = "square";
        ctx.strokeStyle="rgba(255,255,255,0.5)";
        ctx.stroke();
    };
    var create = function() {
        drawGrid();
        canvas = document.getElementById('atlas');
        ctx = canvas.getContext("2d");
        /*
        canvas.style.left = 0;
        canvas.style.top = 0;
        canvas.style.position = "absolute";
        */
        var w = size*cols*renderScale;
        var h = size*rows*renderScale;
        canvas.width = w;
        canvas.height = h;
        if (creates > 0) {
            ctx.restore();
        }
        creates++;
        ctx.save();
        ctx.clearRect(0,0,w,h);
        ctx.scale(renderScale,renderScale);
        var drawAtCell = function(f,row,col) {
            var x = col*size + size/2;
            var y = row*size + size/2;
            f(x,y);
        };
        var row = 0;
        drawAtCell(function(x,y) { drawCherry(ctx,x,y); },      row,0);
        drawAtCell(function(x,y) { drawStrawberry(ctx,x,y); },  row,1);
        drawAtCell(function(x,y) { drawOrange(ctx,x,y); },      row,2);
        drawAtCell(function(x,y) { drawApple(ctx,x,y); },       row,3);
        drawAtCell(function(x,y) { drawMelon(ctx,x,y); },       row,4);
        drawAtCell(function(x,y) { drawGalaxian(ctx,x,y); },    row,5);
        drawAtCell(function(x,y) { drawBell(ctx,x,y); },        row,6);
        drawAtCell(function(x,y) { drawKey(ctx,x,y); },         row,7);
        drawAtCell(function(x,y) { drawPretzel(ctx,x,y); },     row,8);
        drawAtCell(function(x,y) { drawPear(ctx,x,y); },        row,9);
        drawAtCell(function(x,y) { drawBanana(ctx,x,y); },      row,10);
        drawAtCell(function(x,y) { drawCookie(ctx,x,y); },      row,11);
        drawAtCell(function(x,y) { drawCookieFlash(ctx,x,y); },      row,12);
        var drawGhostCells = function(row,color) {
            var i,f;
            var col = 0;
            for (i=0; i<4; i++) {
                for (f=0; f<2; f++) {
                    drawAtCell(function(x,y) { drawGhostSprite(ctx, x,y, f, i, false, false, false, color); },   row,col);
                    col++;
                }
            }
        };
        row++;
        drawGhostCells(row, "#FF0000");
        row++;
        drawGhostCells(row, "#FFB8FF");
        row++;
        drawGhostCells(row, "#00FFFF");
        row++;
        drawGhostCells(row, "#FFB851");
        row++;
        (function(){
            var i;
            var col = 0;
            for (i=0; i<4; i++) {
                drawAtCell(function(x,y) { drawGhostSprite(ctx, x,y, 0, i, false, false, true, "#fff"); },     row,col);
                col++;
            }
        })();
        drawAtCell(function(x,y) { drawGhostSprite(ctx, x,y, 0, DIR_UP, true, false, false, "#fff"); }, row,4);
        drawAtCell(function(x,y) { drawGhostSprite(ctx, x,y, 1, DIR_UP, true, false, false, "#fff"); }, row,5);
        drawAtCell(function(x,y) { drawGhostSprite(ctx, x,y, 0, DIR_UP, true, true, false, "#fff"); },  row,6);
        drawAtCell(function(x,y) { drawGhostSprite(ctx, x,y, 1, DIR_UP, true, true, false, "#fff"); },  row,7);
        var drawPacCells = function(row,col,dir) {
            drawAtCell(function(x,y) { drawPacmanSprite(ctx, x,y, dir, Math.PI/6); }, row, col);
            drawAtCell(function(x,y) { drawPacmanSprite(ctx, x,y, dir, Math.PI/3); }, row, col+1);
        };
        row++;
        drawAtCell(function(x,y) { drawPacmanSprite(ctx, x,y, DIR_RIGHT, 0); }, row, 0);
        (function(){
            var i;
            var col=1;
            for (i=0; i<4; i++) {
                drawPacCells(row,col,i);
                col+=2;
            }
        })();
        var drawMsPacCells = function(row,col,dir) {
            drawAtCell(function(x,y) { drawMsPacmanSprite(ctx, x,y, dir, 0); }, row, col);
            drawAtCell(function(x,y) { drawMsPacmanSprite(ctx, x,y, dir, 1); }, row, col+1);
            drawAtCell(function(x,y) { drawMsPacmanSprite(ctx, x,y, dir, 2); }, row, col+2);
        };
        row++;
        (function(){
            var i;
            var col=0;
            for (i=0; i<4; i++) {
                drawMsPacCells(row,col,i);
                col+=3;
            }
        })();
        var drawCookieCells = function(row,col,dir) {
            drawAtCell(function(x,y) { drawCookiemanSprite(ctx, x,y, dir, 0, true); }, row, col);
            drawAtCell(function(x,y) { drawCookiemanSprite(ctx, x,y, dir, 1, true); }, row, col+1);
            drawAtCell(function(x,y) { drawCookiemanSprite(ctx, x,y, dir, 2, true); }, row, col+2);
        };
        row++;
        (function(){
            var i;
            var col=0;
            for (i=0; i<4; i++) {
                drawCookieCells(row,col,i);
                col+=3;
            }
        })();
        var drawMonsterCells = function(row,color) {
            var i,f;
            var col=0;
            for (i=0; i<4; i++) {
                for (f=0; f<2; f++) {
                    drawAtCell(function(x,y) { drawMonsterSprite(ctx, x,y, f, i, false, false, false, color); },   row,col);
                    col++;
                }
            }
        };
        row++;
        drawMonsterCells(row, "#FF0000");
        row++;
        drawMonsterCells(row, "#FFB8FF");
        row++;
        drawMonsterCells(row, "#00FFFF");
        row++;
        drawMonsterCells(row, "#FFB851");
        row++;
        (function(){
            var i;
            var col = 0;
            for (i=0; i<4; i++) {
                drawAtCell(function(x,y) { drawMonsterSprite(ctx, x,y, 0, i, false, false, true, "#fff"); },     row,col);
                col++;
            }
        })();
        drawAtCell(function(x,y) { drawMonsterSprite(ctx, x,y, 0, DIR_UP, true, false, false, "#fff"); }, row,4);
        drawAtCell(function(x,y) { drawMonsterSprite(ctx, x,y, 1, DIR_UP, true, false, false, "#fff"); }, row,5);
        drawAtCell(function(x,y) { drawMonsterSprite(ctx, x,y, 0, DIR_UP, true, true, false, "#fff"); },  row,6);
        drawAtCell(function(x,y) { drawMonsterSprite(ctx, x,y, 1, DIR_UP, true, true, false, "#fff"); },  row,7);
        var drawOttoCells = function(row,col,dir) {
            var i;
            for (i=0; i<4; i++) {
                drawAtCell(function(x,y) { drawOttoSprite(ctx, x,y, dir, i); }, row, col);
                col++;
            }
        };
        row++;
        drawOttoCells(row,0, DIR_UP);
        drawOttoCells(row,4, DIR_RIGHT);
        row++;
        drawOttoCells(row,0, DIR_DOWN);
        drawOttoCells(row,4, DIR_LEFT);
        row++;
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 200, "#33ffff"); }, row, 0);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 400, "#33ffff"); }, row, 1);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 800, "#33ffff"); }, row, 2);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 1600, "#33ffff");}, row, 3);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 100, "#ffb8ff"); }, row, 4);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 300, "#ffb8ff"); }, row, 5);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 500, "#ffb8ff"); }, row, 6);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 700, "#ffb8ff"); }, row, 7);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 1000, "#ffb8ff"); }, row, 8);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 2000, "#ffb8ff"); }, row, 9);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 3000, "#ffb8ff"); }, row, 10);
        drawAtCell(function(x,y) { drawPacPoints(ctx, x,y, 5000, "#ffb8ff"); }, row, 11);
        row++;
        drawAtCell(function(x,y) { drawMsPacPoints(ctx, x,y, 100, "#fff"); }, row, 0);
        drawAtCell(function(x,y) { drawMsPacPoints(ctx, x,y, 200, "#fff"); }, row, 1);
        drawAtCell(function(x,y) { drawMsPacPoints(ctx, x,y, 500, "#fff"); }, row, 2);
        drawAtCell(function(x,y) { drawMsPacPoints(ctx, x,y, 700, "#fff"); }, row, 3);
        drawAtCell(function(x,y) { drawMsPacPoints(ctx, x,y, 1000, "#fff"); }, row, 4);
        drawAtCell(function(x,y) { drawMsPacPoints(ctx, x,y, 2000, "#fff"); }, row, 5);
        drawAtCell(function(x,y) { drawMsPacPoints(ctx, x,y, 5000, "#fff"); }, row, 6);
        row++;
        drawAtCell(function(x,y) {
            drawSnail(ctx,x,y, "#0ff");
        }, row, 0);
        drawAtCell(function(x,y) {
            drawSnail(ctx,x,y, "#FFF");
        }, row, 1);
        var drawMsOttoCells = function(row,col,dir) {
            var i;
            for (i=0; i<4; i++) {
                drawAtCell(function(x,y) { drawMsOttoSprite(ctx, x,y, dir, i); }, row, col);
                col++;
            }
        };
        row++;
        drawMsOttoCells(row,0, DIR_UP);
        drawMsOttoCells(row,4, DIR_RIGHT);
        row++;
        drawMsOttoCells(row,0, DIR_DOWN);
        drawMsOttoCells(row,4, DIR_LEFT);
    };
    var copyCellTo = function(row, col, destCtx, x, y,display) {
        var sx = col*size*renderScale;
        var sy = row*size*renderScale;
        var sw = renderScale*size;
        var sh = renderScale*size;
        var dx = x - size/2;
        var dy = y - size/2;
        var dw = size;
        var dh = size;
        if (display) {
            console.log(sx,sy,sw,sh,dw,dy,dw,dh);
        }
        destCtx.drawImage(canvas,sx,sy,sw,sh,dx,dy,dw,dh);
    };
    var copyGhostPoints = function(destCtx,x,y,points) {
        var row = 16;
        var col = {
            200: 0,
            400: 1,
            800: 2,
            1600: 3,
        }[points];
        if (col != undefined) {
            copyCellTo(row, col, destCtx, x, y);
        }
    };
    var copyPacFruitPoints = function(destCtx,x,y,points) {
        var row = 16;
        var col = {
            100: 4,
            300: 5,
            500: 6,
            700: 7,
            1000: 8,
            2000: 9,
            3000: 10,
            5000: 11,
        }[points];
        if (col != undefined) {
            copyCellTo(row, col, destCtx, x, y);
        }
    };
    var copyMsPacFruitPoints = function(destCtx,x,y,points) {
        var row = 17;
        var col = {
            100: 0,
            200: 1,
            500: 2,
            700: 3,
            1000: 4,
            2000: 5,
            5000: 6,
        }[points];
        if (col != undefined) {
            copyCellTo(row, col, destCtx, x, y);
        }
    };
    var copyGhostSprite = function(destCtx,x,y,frame,dirEnum,scared,flash,eyes_only,color) {
        var row,col;
        if (eyes_only) {
            row = 5;
            col = dirEnum;
        }
        else if (scared) {
            row = 5;
            col = flash ? 6 : 4;
            col += frame;
        }
        else {
            col = dirEnum*2 + frame;
            if (color == blinky.color) {
                row = 1;
            }
            else if (color == pinky.color) {
                row = 2;
            }
            else if (color == inky.color) {
                row = 3;
            }
            else if (color == clyde.color) {
                row = 4;
            }
            else {
                row = 5;
            }
        }
        copyCellTo(row, col, destCtx, x, y);
    };
    var copyMuppetSprite = function(destCtx,x,y,frame,dirEnum,scared,flash,eyes_only,color) {
        if (scared) {
            if (flash) {
                copyFruitSprite(destCtx,x,y,"cookieface");
            }
            else {
                copyFruitSprite(destCtx,x,y,"cookie");
            }
        }
        else {
            copyGhostSprite(destCtx,x,y,frame,dirEnum,scared,flash,eyes_only,color);
        }
    };
    var copyMonsterSprite = function(destCtx,x,y,frame,dirEnum,scared,flash,eyes_only,color) {
        var row,col;
        if (eyes_only) {
            row = 13;
            col = dirEnum;
        }
        else if (scared) {
            row = 13;
            col = flash ? 6 : 4;
            col += frame;
        }
        else {
            col = dirEnum*2 + frame;
            if (color == blinky.color) {
                row = 9;
            }
            else if (color == pinky.color) {
                row = 10;
            }
            else if (color == inky.color) {
                row = 11;
            }
            else if (color == clyde.color) {
                row = 12;
            }
            else {
                row = 13;
            }
        }
        copyCellTo(row, col, destCtx, x, y);
    };
    var copyOttoSprite = function(destCtx,x,y,dirEnum,frame) {
        var col,row;
        if (dirEnum == DIR_UP) {
            col = frame;
            row = 14;
        }
        else if (dirEnum == DIR_RIGHT) {
            col = frame+4;
            row = 14;
        }
        else if (dirEnum == DIR_DOWN) {
            col = frame;
            row = 15;
        }
        else if (dirEnum == DIR_LEFT) {
            col = frame+4;
            row = 15;
        }
        copyCellTo(row,col,destCtx,x,y);
    };
    var copyMsOttoSprite = function(destCtx,x,y,dirEnum,frame) {
        var col,row;
        if (dirEnum == DIR_UP) {
            col = frame;
            row = 19;
        }
        else if (dirEnum == DIR_RIGHT) {
            col = frame+4;
            row = 19;
        }
        else if (dirEnum == DIR_DOWN) {
            col = frame;
            row = 20;
        }
        else if (dirEnum == DIR_LEFT) {
            col = frame+4;
            row = 20;
        }
        copyCellTo(row,col,destCtx,x,y);
    };
    var copySnail = function(destCtx,x,y,frame) {
        var row = 18;
        var col = frame;
        copyCellTo(row,col,destCtx,x,y);
    };
    var copyPacmanSprite = function(destCtx,x,y,dirEnum,frame) {
        var row = 6;
        var col;
        if (frame == 0) {
            col = 0;
        }
        else {
           col = dirEnum*2+1+(frame-1);
        }
        copyCellTo(row,col,destCtx,x,y);
    };
    var copyMsPacmanSprite = function(destCtx,x,y,dirEnum,frame) {
        var row = 7;
        var col = dirEnum*3+frame;
        copyCellTo(row,col,destCtx,x,y);
    };
    var copyCookiemanSprite = function(destCtx,x,y,dirEnum,frame) {
        var row = 8;
        var col = dirEnum*3+frame;
        copyCellTo(row,col,destCtx,x,y);
    };
    var copyFruitSprite = function(destCtx,x,y,name) {
        var row = 0;
        var col = {
            "cherry": 0,
            "strawberry": 1,
            "orange": 2,
            "apple": 3,
            "melon": 4,
            "galaxian": 5,
            "bell": 6,
            "key": 7,
            "pretzel": 8,
            "pear": 9,
            "banana": 10,
            "cookie": 11,
            "cookieface": 12,
        }[name];
        copyCellTo(row,col,destCtx,x,y);
    };
    return {
        create: create,
        getCanvas: function() { return canvas; },
        drawGhostSprite: copyGhostSprite,
        drawMonsterSprite: copyMonsterSprite,
        drawMuppetSprite: copyMuppetSprite,
        drawOttoSprite: copyOttoSprite,
        drawMsOttoSprite: copyMsOttoSprite,
        drawPacmanSprite: copyPacmanSprite,
        drawMsPacmanSprite: copyMsPacmanSprite,
        drawCookiemanSprite: copyCookiemanSprite,
        drawFruitSprite: copyFruitSprite,
        drawGhostPoints: copyGhostPoints,
        drawPacFruitPoints: copyPacFruitPoints,
        drawMsPacFruitPoints: copyMsPacFruitPoints,
        drawSnail: copySnail,
    };
})();
var renderer_list;
var renderer;
var renderScale;
var mapMargin = 4*tileSize;
var mapPad = tileSize/8;
var mapWidth = 28*tileSize+mapPad*2;
var mapHeight = 36*tileSize+mapPad*2;
var screenWidth = mapWidth+mapMargin*2;
var screenHeight = mapHeight+mapMargin*2;
var canvas;
var switchRenderer = function(i) {
    renderer = renderer_list[i];
    renderer.drawMap();
};
var getDevicePixelRatio = function() {
    return 1;
    if (window.innerWidth <= 320) {
        return window.devicePixelRatio || 1;
    }
    return 1;
};
var initRenderer = function(){
    var bgCanvas;
    var ctx, bgCtx;
    var scale = 2;
    renderScale = scale;
    var resets = 0;
    var resetCanvasSizes = function() {
        canvas.width = screenWidth * scale;
        canvas.height = screenHeight * scale;
        var ratio = getDevicePixelRatio();
        canvas.style.width = canvas.width / ratio;
        canvas.style.height = canvas.height / ratio;
        if (resets > 0) {
            ctx.restore();
        }
        ctx.save();
        ctx.scale(scale,scale);
        bgCanvas.width = mapWidth * scale;
        bgCanvas.height = mapHeight * scale;
        if (resets > 0) {
            bgCtx.restore();
        }
        bgCtx.save();
        bgCtx.scale(scale,scale);
        resets++;
    };
    var getTargetScale = function() {
        var sx = (window.innerWidth - 10) / screenWidth;
        var sy = (window.innerHeight - 10) / screenHeight;
        var s = Math.min(sx,sy);
        s *= getDevicePixelRatio();
        return s;
    };
    var fullscreen = function() {
        renderScale = scale = getTargetScale();
        resetCanvasSizes();
        atlas.create();
        if (renderer) {
            renderer.drawMap();
        }
        center();
    };
    var center = function() {
        var s = getTargetScale()/getDevicePixelRatio();
        var w = screenWidth*s;
        var x = Math.max(0,(window.innerWidth-10)/2 - w/2);
        var y = 0;
        /*
        canvas.style.position = "absolute";
        canvas.style.left = x;
        canvas.style.top = y;
        console.log(canvas.style.left);
        */
        document.body.style.marginLeft = (window.innerWidth - w)/2 + "px";
    };
    canvas = document.getElementById('canvas');
    bgCanvas = document.createElement('canvas');
    ctx = canvas.getContext("2d");
    bgCtx = bgCanvas.getContext("2d");
    fullscreen();
    var resizeTimeout;
    window.addEventListener('resize', function () {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(fullscreen, 100);
    }, false);
    var beginMapFrame = function() {
        bgCtx.fillStyle = "#000";
        bgCtx.fillRect(0,0,mapWidth,mapHeight);
        bgCtx.translate(mapPad, mapPad);
    };
    var endMapFrame = function() {
        bgCtx.translate(-mapPad, -mapPad);
    };
    var CommonRenderer = function() {
        this.actorSize = (tileSize-1)*2;
        this.energizerSize = tileSize+2;
        this.pointsEarnedTextSize = tileSize;
        this.energizerColor = "#FFF";
        this.pelletColor = "#888";
        this.flashLevel = false;
    };
    CommonRenderer.prototype = {
        setOverlayColor: function(color) {
            this.overlayColor = color;
        },
        beginMapClip: function() {
            ctx.save();
            ctx.beginPath();
            ctx.rect(-mapPad,-mapPad,mapWidth-1,mapHeight-1);
            ctx.clip();
        },
        endMapClip: function() {
            ctx.restore();
        },
        beginFrame: function() {
            this.setOverlayColor(undefined);
            ctx.save();
            ctx.fillStyle = "#000";
            (function(w,h,p){
                ctx.fillRect(0,0,w,p+1);
                ctx.fillRect(0,p,p,h-2*p);
                ctx.fillRect(w-p-2,p,p+2,h-2*p);
                ctx.fillRect(0,h-p-2,w,p+2);
            })(screenWidth, screenHeight, mapMargin);
            if (DEBUG) {
                ctx.font = (tileSize-2) + "px ArcadeR";
                ctx.textBaseline = "bottom";
                ctx.textAlign = "right";
                ctx.fillStyle = "#333";
                ctx.fillText(Math.floor(executive.getFps())+" FPS", screenWidth, screenHeight);
            }
            ctx.translate(mapMargin+mapPad, mapMargin+mapPad);
        },
        endFrame: function() {
            ctx.restore();
            if (this.overlayColor != undefined) {
                ctx.fillStyle = this.overlayColor;
                ctx.fillRect(0,0,screenWidth,screenHeight);
            }
        },
        clearMapFrame: function() {
            ctx.fillStyle = "#000";
            ctx.fillRect(-1,-1,mapWidth+1,mapHeight+1);
        },
        renderFunc: function(f,that) {
            if (that) {
                f.call(that,ctx);
            }
            else {
                f(ctx);
            }
        },
        drawNoGroutTile: function(ctx,x,y,w) {
            var tileChar = map.getTile(x,y);
            this.drawCenterTileSq(ctx,x,y,tileSize,
                    map.getTile(x+1,y) == tileChar,
                    map.getTile(x,y+1) == tileChar,
                    map.getTile(x+1,y+1) == tileChar);
        },
        drawCenterTileSq: function (ctx,tx,ty,w, rightGrout, downGrout, downRightGrout) {
            this.drawCenterPixelSq(ctx, tx*tileSize+midTile.x, ty*tileSize+midTile.y,w,
                    rightGrout, downGrout, downRightGrout);
        },
        drawCenterPixelSq: function (ctx,px,py,w,rightGrout, downGrout, downRightGrout) {
            ctx.fillRect(px-w/2, py-w/2,w,w);
            var gap = 1;
            if (rightGrout) ctx.fillRect(px-w/2, py-w/2,w+gap,w);
            if (downGrout) ctx.fillRect(px-w/2, py-w/2,w,w+gap);
        },
        toggleLevelFlash: function () {
            this.flashLevel = !this.flashLevel;
        },
        setLevelFlash: function(on) {
            if (on != this.flashLevel) {
                this.flashLevel = on;
                this.drawMap();
            }
        },
        drawTargets: function() {
            var i;
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.lineWidth = "1.5";
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            for (i=0;i<5;i++)
                if (actors[i].isDrawTarget)
                    actors[i].drawTarget(ctx);
        },
        drawPaths: function() {
            var backupAlpha = ctx.globalAlpha;
            ctx.globalAlpha = 0.7;
            var i;
            for (i=0;i<5;i++)
                if (actors[i].isDrawPath)
                    this.drawPath(actors[i]);
            ctx.globalAlpha = backupAlpha;
        },
        drawPath: function(actor) {
            if (!actor.targetting) return;
            var tile = { x: actor.tile.x, y: actor.tile.y};
            var target = actor.targetTile;
            var dir = { x: actor.dir.x, y: actor.dir.y };
            var dirEnum = actor.dirEnum;
            var openTiles;
            if (tile.x == target.x && tile.y == target.y) {
                return;
            }
            if ((dirEnum == DIR_UP && actor.tilePixel.y <= midTile.y) ||
                (dirEnum == DIR_DOWN && actor.tilePixel.y >= midTile.y) ||
                (dirEnum == DIR_LEFT && actor.tilePixel.x <= midTile.x) ||
                (dirEnum == DIR_RIGHT & actor.tilePixel.x >= midTile.x)) {
                tile.x += dir.x;
                tile.y += dir.y;
            }
            var pixel = { x:tile.x*tileSize+midTile.x, y:tile.y*tileSize+midTile.y };
            var dist = Math.abs(tile.x*tileSize+midTile.x - actor.pixel.x + tile.y*tileSize+midTile.y - actor.pixel.y);
            var maxDist = actorPathLength*tileSize;
            var distLeft;
            ctx.strokeStyle = actor.pathColor;
            ctx.lineWidth = "2.0";
            ctx.lineCap = "round";
            ctx.lineJoin = "round";
            ctx.beginPath();
            ctx.moveTo(
                    actor.pixel.x+actor.pathCenter.x,
                    actor.pixel.y+actor.pathCenter.y);
            ctx.lineTo(
                    pixel.x+actor.pathCenter.x,
                    pixel.y+actor.pathCenter.y);
            if (tile.x == target.x && tile.y == target.y) {
                distLeft = actor.getPathDistLeft(pixel, dirEnum);
            }
            else while (true) {
                openTiles = getOpenTiles(tile, dirEnum);
                if (actor != pacman && map.constrainGhostTurns)
                    map.constrainGhostTurns(tile, openTiles, dirEnum);
                dirEnum = getTurnClosestToTarget(tile, target, openTiles);
                setDirFromEnum(dir,dirEnum);
                if (tile.x+dir.x == target.x && tile.y+dir.y == target.y) {
                    distLeft = actor.getPathDistLeft(pixel, dirEnum);
                    distLeft = Math.min(maxDist-dist, distLeft);
                    break;
                }
                if (dist + tileSize > maxDist) {
                    distLeft = maxDist - dist;
                    break;
                }
                tile.x += dir.x;
                tile.y += dir.y;
                pixel.x += tileSize*dir.x;
                pixel.y += tileSize*dir.y;
                dist += tileSize;
                ctx.lineTo(
                        tile.x*tileSize+midTile.x+actor.pathCenter.x,
                        tile.y*tileSize+midTile.y+actor.pathCenter.y);
            }
            var px = pixel.x+actor.pathCenter.x+distLeft*dir.x;
            var py = pixel.y+actor.pathCenter.y+distLeft*dir.y;
            ctx.lineTo(px,py);
            var s = 3;
            if (dirEnum == DIR_LEFT || dirEnum == DIR_RIGHT) {
                ctx.lineTo(px-s*dir.x,py+s*dir.x);
                ctx.moveTo(px,py);
                ctx.lineTo(px-s*dir.x,py-s*dir.x);
            }
            else {
                ctx.lineTo(px+s*dir.y,py-s*dir.y);
                ctx.moveTo(px,py);
                ctx.lineTo(px-s*dir.y,py-s*dir.y);
            }
            ctx.stroke();
        },
        erasePellet: function(x,y) {
            bgCtx.translate(mapPad,mapPad);
            bgCtx.fillStyle = this.floorColor;
            this.drawNoGroutTile(bgCtx,x,y,tileSize);
            if (map.getTile(x+1,y)==' ') this.drawNoGroutTile(bgCtx,x+1,y,tileSize);
            if (map.getTile(x-1,y)==' ') this.drawNoGroutTile(bgCtx,x-1,y,tileSize);
            if (map.getTile(x,y+1)==' ') this.drawNoGroutTile(bgCtx,x,y+1,tileSize);
            if (map.getTile(x,y-1)==' ') this.drawNoGroutTile(bgCtx,x,y-1,tileSize);
            bgCtx.translate(-mapPad,-mapPad);
        },
        drawMessage: function(text, color, x,y) {
            ctx.font = tileSize + "px ArcadeR";
            ctx.textBaseline = "top";
            ctx.textAlign = "right";
            ctx.fillStyle = color;
            x += text.length;
            ctx.fillText(text, x*tileSize, y*tileSize);
        },
        drawReadyMessage: function() {
            this.drawMessage("READY ","#FF0",11,20);
            drawExclamationPoint(ctx,16*tileSize+3, 20*tileSize+3);
        },
        drawEatenPoints: function() {
            atlas.drawGhostPoints(ctx, pacman.pixel.x, pacman.pixel.y, energizer.getPoints());
        },
        drawActors: function() {
            var i;
            if (energizer.isActive()) {
                for (i=0; i<4; i++) {
                    this.drawGhost(ghosts[i]);
                }
                if (!energizer.showingPoints())
                    this.drawPlayer();
                else
                    this.drawEatenPoints();
            }
            else {
                this.drawPlayer();
                for (i=3; i>=0; i--) {
                    if (ghosts[i].isVisible) {
                        this.drawGhost(ghosts[i]);
                    }
                }
                if (inky.isVisible && !blinky.isVisible) {
                    this.drawGhost(blinky,0.5);
                }
            }
        },
    };
    var SimpleRenderer = function() {
        CommonRenderer.call(this,ctx,bgCtx);
        this.messageRow = 21.7;
        this.pointsEarnedTextSize = 1.5*tileSize;
        this.backColor = "#222";
        this.floorColor = "#444";
        this.flashFloorColor = "#999";
        this.name = "Minimal";
    };
    SimpleRenderer.prototype = newChildObject(CommonRenderer.prototype, {
        drawMap: function() {
            beginMapFrame();
            var x,y;
            var i;
            var tile;
            bgCtx.fillStyle = (this.flashLevel ? this.flashFloorColor : this.floorColor);
            i=0;
            for (y=0; y<map.numRows; y++)
            for (x=0; x<map.numCols; x++) {
                tile = map.currentTiles[i++];
                if (tile == ' ')
                    this.drawNoGroutTile(bgCtx,x,y,tileSize);
            }
            bgCtx.fillStyle = this.pelletColor;
            i=0;
            for (y=0; y<map.numRows; y++)
            for (x=0; x<map.numCols; x++) {
                tile = map.currentTiles[i++];
                if (tile == '.')
                    this.drawNoGroutTile(bgCtx,x,y,tileSize);
            }
            endMapFrame();
        },
        refreshPellet: function(x,y) {
            var i = map.posToIndex(x,y);
            var tile = map.currentTiles[i];
            if (tile == ' ') {
                this.erasePellet(x,y);
            }
            else if (tile == '.') {
                bgCtx.fillStyle = this.pelletColor;
                this.drawNoGroutTile(bgCtx,x,y,tileSize);
            }
        },
        drawScore: function() {
            ctx.font = 1.5*tileSize + "px sans-serif";
            ctx.textBaseline = "top";
            ctx.textAlign = "left";
            ctx.fillStyle = "#FFF";
            ctx.fillText(getScore(), tileSize, tileSize*2);
            ctx.font = "bold " + 1.5*tileSize + "px sans-serif";
            ctx.textBaseline = "top";
            ctx.textAlign = "center";
            ctx.fillText("high score", tileSize*map.numCols/2, 3);
            ctx.fillText(getHighScore(), tileSize*map.numCols/2, tileSize*2);
        },
        drawExtraLives: function() {
            var i;
            ctx.fillStyle = "rgba(255,255,0,0.6)";
            var lives = extraLives == Infinity ? 1 : extraLives;
            for (i=0; i<extraLives; i++)
                this.drawCenterPixelSq(ctx, (2*i+3)*tileSize, (map.numRows-2)*tileSize+midTile.y,this.actorSize);
        },
        drawLevelIcons: function() {
            var i;
            ctx.fillStyle = "rgba(255,255,255,0.5)";
            var w = 2;
            var h = this.actorSize;
            for (i=0; i<level; i++)
                ctx.fillRect((map.numCols-2)*tileSize - i*2*w, (map.numRows-2)*tileSize+midTile.y-h/2, w, h);
        },
        drawEnergizers: function() {
            ctx.fillStyle = this.energizerColor;
            var e;
            var i;
            for (i=0; i<map.numEnergizers; i++) {
                e = map.energizers[i];
                if (map.currentTiles[e.x+e.y*map.numCols] == 'o')
                    this.drawCenterTileSq(ctx,e.x,e.y,this.energizerSize);
            }
        },
        drawPlayer: function(scale, opacity) {
            if (scale == undefined) scale = 1;
            if (opacity == undefined) opacity = 1;
            ctx.fillStyle = "rgba(255,255,0,"+opacity+")";
            this.drawCenterPixelSq(ctx, pacman.pixel.x, pacman.pixel.y, this.actorSize*scale);
        },
        drawDyingPlayer: function(t) {
            var f = t*85;
            if (f <= 60) {
                t = f/60;
                this.drawPlayer(1-t);
            }
            else {
                f -= 60;
                t = f/15;
                this.drawPlayer(t,1-t);
            }
        },
        drawGhost: function(g) {
            if (g.mode == GHOST_EATEN)
                return;
            var color = g.color;
            if (g.scared)
                color = energizer.isFlash() ? "#FFF" : "#2121ff";
            else if (g.mode == GHOST_GOING_HOME || g.mode == GHOST_ENTERING_HOME)
                color = "rgba(255,255,255,0.3)";
            ctx.fillStyle = color;
            this.drawCenterPixelSq(ctx, g.pixel.x, g.pixel.y, this.actorSize);
        },
        drawFruit: function() {
            if (fruit.isPresent()) {
                ctx.fillStyle = "#0F0";
                this.drawCenterPixelSq(ctx, fruit.pixel.x, fruit.pixel.y, tileSize+2);
            }
            else if (fruit.isScorePresent()) {
                ctx.font = this.pointsEarnedTextSize + "px sans-serif";
                ctx.textBaseline = "middle";
                ctx.textAlign = "center";
                ctx.fillStyle = "#FFF";
                ctx.fillText(fruit.getPoints(), fruit.pixel.x, fruit.pixel.y);
            }
        },
    });
    var ArcadeRenderer = function(ctx,bgCtx) {
        CommonRenderer.call(this,ctx,bgCtx);
        this.messageRow = 20;
        this.pelletSize = 2;
        this.energizerSize = tileSize;
        this.backColor = "#000";
        this.floorColor = "#000";
        this.flashWallColor = "#FFF";
        this.name = "Arcade";
    };
    ArcadeRenderer.prototype = newChildObject(CommonRenderer.prototype, {
        blitMap: function() {
            ctx.scale(1/scale,1/scale);
            ctx.drawImage(bgCanvas,-1-mapPad*scale,-1-mapPad*scale);
            ctx.scale(scale,scale);
        },
        drawMap: function(isCutscene) {
            beginMapFrame();
            if (map) {
                if (state != finishState) {
                    this.flashLevel = false;
                }
                var x,y;
                var i,j;
                var tile;
                i=0;
                for (y=0; y<map.numRows; y++)
                for (x=0; x<map.numCols; x++) {
                    if (map.currentTiles[i] == '-' && map.currentTiles[i+1] == '-') {
                        bgCtx.fillStyle = "#ffb8de";
                        bgCtx.fillRect(x*tileSize,y*tileSize+tileSize-2,tileSize*2,2);
                    }
                    i++;
                }
                if (this.flashLevel) {
                    bgCtx.fillStyle = "#000";
                    bgCtx.strokeStyle = "#fff";
                }
                else {
                    bgCtx.fillStyle = map.wallFillColor;
                    bgCtx.strokeStyle = map.wallStrokeColor;
                }
                for (i=0; i<map.paths.length; i++) {
                    var path = map.paths[i];
                    bgCtx.beginPath();
                    bgCtx.moveTo(path[0].x, path[0].y);
                    for (j=1; j<path.length; j++) {
                        if (path[j].cx != undefined)
                            bgCtx.quadraticCurveTo(path[j].cx, path[j].cy, path[j].x, path[j].y);
                        else
                            bgCtx.lineTo(path[j].x, path[j].y);
                    }
                    bgCtx.quadraticCurveTo(path[j-1].x, path[0].y, path[0].x, path[0].y);
                    bgCtx.fill();
                    bgCtx.stroke();
                }
                bgCtx.fillStyle = map.pelletColor;
                i=0;
                for (y=0; y<map.numRows; y++)
                for (x=0; x<map.numCols; x++) {
                    this.refreshPellet(x,y,true);
                }
                if (map.onDraw) {
                    map.onDraw(bgCtx);
                }
                if (map.shouldDrawMapOnly) {
                    endMapFrame();
                    return;
                }
            }
            if (level > 0) {
                var numRows = 36;
                var numCols = 28;
                if (!isCutscene) {
                    var i;
                    bgCtx.fillStyle = pacman.color;
                    bgCtx.save();
                    bgCtx.translate(3*tileSize, (numRows-1)*tileSize);
                    bgCtx.scale(0.85, 0.85);
                    var lives = extraLives == Infinity ? 1 : extraLives;
                    if (gameMode == GAME_PACMAN) {
                        for (i=0; i<lives; i++) {
                            drawPacmanSprite(bgCtx, 0,0, DIR_LEFT, Math.PI/6);
                            bgCtx.translate(2*tileSize,0);
                        }
                    }
                    else if (gameMode == GAME_MSPACMAN) {
                        for (i=0; i<lives; i++) {
                            drawMsPacmanSprite(bgCtx, 0,0, DIR_RIGHT, 1);
                            bgCtx.translate(2*tileSize,0);
                        }
                    }
                    else if (gameMode == GAME_COOKIE) {
                        for (i=0; i<lives; i++) {
                            drawCookiemanSprite(bgCtx, 0,0, DIR_RIGHT, 1, false);
                            bgCtx.translate(2*tileSize,0);
                        }
                    }
                    else if (gameMode == GAME_OTTO) {
                        for (i=0; i<lives; i++) {
                            drawOttoSprite(bgCtx, 0,0,DIR_RIGHT, 0);
                            bgCtx.translate(2*tileSize,0);
                        }
                    }
                    if (extraLives == Infinity) {
                        bgCtx.translate(-4*tileSize,0);
                        /*
                        bgCtx.translate(-s*2,0);
                        var s = 2;
                        bgCtx.beginPath();
                        bgCtx.moveTo(-s,-s);
                        bgCtx.lineTo(s,s);
                        bgCtx.moveTo(-s,s);
                        bgCtx.lineTo(s,-s);
                        bgCtx.lineWidth = 1;
                        bgCtx.strokeStyle = "#777";
                        bgCtx.stroke();
                        */
                        var r = 2;
                        var d = 3;
                        bgCtx.beginPath();
                        bgCtx.moveTo(-d-r,0);
                        bgCtx.quadraticCurveTo(-d-r,-r,-d,-r);
                        bgCtx.bezierCurveTo(-(d-r),-r,d-r,r,d,r);
                        bgCtx.quadraticCurveTo(d+r,r,d+r,0);
                        bgCtx.quadraticCurveTo(d+r,-r,d,-r);
                        bgCtx.bezierCurveTo(d-r,-r,-(d-r),r,-d,r);
                        bgCtx.quadraticCurveTo(-d-r,r,-d-r,0);
                        bgCtx.lineWidth = 1;
                        bgCtx.strokeStyle = "#FFF";
                        bgCtx.stroke();
                    }
                    bgCtx.restore();
                }
                var fruits = fruit.fruitHistory;
                var i,j;
                var f,drawFunc;
                var numFruit = 7;
                var startLevel = Math.max(numFruit,level);
                if (gameMode != GAME_PACMAN) {
                    startLevel = Math.min(numFruit,startLevel);
                }
                var scale = 0.85;
                for (i=0, j=startLevel-numFruit+1; i<numFruit && j<=level; j++, i++) {
                    f = fruits[j];
                    if (f) {
                        drawFunc = getSpriteFuncFromFruitName(f.name);
                        if (drawFunc) {
                            bgCtx.save();
                            bgCtx.translate((numCols-3)*tileSize - i*16*scale, (numRows-1)*tileSize);
                            bgCtx.scale(scale,scale);
                            drawFunc(bgCtx,0,0);
                            bgCtx.restore();
                        }
                    }
                }
                if (!isCutscene) {
                    if (level >= 100) {
                        bgCtx.font = (tileSize-3) + "px ArcadeR";
                    }
                    else {
                        bgCtx.font = (tileSize-1) + "px ArcadeR";
                    }
                    bgCtx.textBaseline = "middle";
                    bgCtx.fillStyle = "#777";
                    bgCtx.textAlign = "left";
                    bgCtx.fillText(level,(numCols-2)*tileSize, (numRows-1)*tileSize);
                }
            }
            endMapFrame();
        },
        erasePellet: function(x,y,isTranslated) {
            if (!isTranslated) {
                bgCtx.translate(mapPad,mapPad);
            }
            bgCtx.fillStyle = "#000";
            var i = map.posToIndex(x,y);
            var size = map.tiles[i] == 'o' ? this.energizerSize : this.pelletSize;
            this.drawCenterTileSq(bgCtx,x,y,size+2);
            if (!isTranslated) {
                bgCtx.translate(-mapPad,-mapPad);
            }
        },
        refreshPellet: function(x,y,isTranslated) {
            if (!isTranslated) {
                bgCtx.translate(mapPad,mapPad);
            }
            var i = map.posToIndex(x,y);
            var tile = map.currentTiles[i];
            if (tile == ' ') {
                this.erasePellet(x,y,isTranslated);
            }
            else if (tile == '.') {
                bgCtx.fillStyle = map.pelletColor;
                bgCtx.translate(0.5, 0.5);
                this.drawCenterTileSq(bgCtx,x,y,this.pelletSize);
                bgCtx.translate(-0.5, -0.5);
            }
            else if (tile == 'o') {
                bgCtx.fillStyle = map.pelletColor;
                bgCtx.beginPath();
                bgCtx.arc(x*tileSize+midTile.x+0.5,y*tileSize+midTile.y,this.energizerSize/2,0,Math.PI*2);
                bgCtx.fill();
            }
            if (!isTranslated) {
                bgCtx.translate(-mapPad,-mapPad);
            }
        },
        drawScore: function() {
            ctx.font = tileSize + "px ArcadeR";
            ctx.textBaseline = "top";
            ctx.fillStyle = "#FFF";
            ctx.textAlign = "right";
            ctx.fillText("1UP", 6*tileSize, 0);
            ctx.fillText(practiceMode ? "PRACTICE" : "HIGH SCORE", 19*tileSize, 0);
            var score = getScore();
            if (score == 0) {
                score = "00";
            }
            var y = tileSize+1;
            ctx.fillText(score, 7*tileSize, y);
            if (!practiceMode) {
                var highScore = getHighScore();
                if (highScore == 0) {
                    highScore = "00";
                }
                ctx.fillText(highScore, 17*tileSize, y);
            }
        },
        drawGhost: function(g,alpha) {
            var backupAlpha;
            if (alpha) {
                backupAlpha = ctx.globalAlpha;
                ctx.globalAlpha = alpha;
            }
            var draw = function(mode, pixel, frames, faceDirEnum, scared, isFlash,color, dirEnum) {
                if (mode == GHOST_EATEN)
                    return;
                var frame = g.getAnimFrame(frames);
                var eyes = (mode == GHOST_GOING_HOME || mode == GHOST_ENTERING_HOME);
                var func = getGhostDrawFunc();
                var y = g.getBounceY(pixel.x, pixel.y, dirEnum);
                var x = (g == blinky && scared) ? pixel.x+1 : pixel.x;
                func(ctx,x,y,frame,faceDirEnum,scared,isFlash,eyes,color);
            };
            vcr.drawHistory(ctx, function(t) {
                draw(
                    g.savedMode[t],
                    g.savedPixel[t],
                    g.savedFrames[t],
                    g.savedFaceDirEnum[t],
                    g.savedScared[t],
                    energizer.isFlash(),
                    g.color,
                    g.savedDirEnum[t]);
            });
            draw(g.mode, g.pixel, g.frames, g.faceDirEnum, g.scared, energizer.isFlash(), g.color, g.dirEnum);
            if (alpha) {
                ctx.globalAlpha = backupAlpha;
            }
        },
        drawPlayer: function() {
            var frame = pacman.getAnimFrame();
            if (pacman.invincible) {
                ctx.globalAlpha = 0.6;
            }
            var draw = function(pixel, dirEnum, steps) {
                var frame = pacman.getAnimFrame(pacman.getStepFrame(steps));
                var func = getPlayerDrawFunc();
                func(ctx, pixel.x, pixel.y, dirEnum, frame, true);
            };
            vcr.drawHistory(ctx, function(t) {
                draw(
                    pacman.savedPixel[t],
                    pacman.savedDirEnum[t],
                    pacman.savedSteps[t]);
            });
            draw(pacman.pixel, pacman.dirEnum, pacman.steps);
            if (pacman.invincible) {
                ctx.globalAlpha = 1;
            }
        },
        drawDyingPlayer: function(t) {
            var frame = pacman.getAnimFrame();
            if (gameMode == GAME_PACMAN) {
                var f = t*75;
                if (f <= 60) {
                    t = f/60;
                    var a = frame*Math.PI/6;
                    drawPacmanSprite(ctx, pacman.pixel.x, pacman.pixel.y, pacman.dirEnum, a + t*(Math.PI-a),4*t);
                }
                else {
                    f -= 60;
                    this.drawExplodingPlayer(f/15);
                }
            }
            else if (gameMode == GAME_OTTO) {
                if (t < 0.8) {
                    var dirEnum = Math.floor((pacman.dirEnum - t*16))%4;
                    if (dirEnum < 0) {
                        dirEnum += 4;
                    }
                    drawOttoSprite(ctx, pacman.pixel.x, pacman.pixel.y, dirEnum, 0);
                }
                else if (t < 0.95) {
                    var dirEnum = Math.floor((pacman.dirEnum - 0.8*16))%4;
                    if (dirEnum < 0) {
                        dirEnum += 4;
                    }
                    drawOttoSprite(ctx, pacman.pixel.x, pacman.pixel.y, dirEnum, 0);
                }
                else {
                    drawDeadOttoSprite(ctx,pacman.pixel.x, pacman.pixel.y);
                }
            }
            else if (gameMode == GAME_MSPACMAN) {
                var maxAngle = Math.PI*5;
                var step = (Math.PI/4) / maxAngle;
                var angle = Math.floor(t/step)*step*maxAngle;
                drawMsPacmanSprite(ctx, pacman.pixel.x, pacman.pixel.y, pacman.dirEnum, frame, angle);
            }
            else if (gameMode == GAME_COOKIE) {
                var maxAngle = Math.PI*5;
                var step = (Math.PI/4) / maxAngle;
                var angle = Math.floor(t/step)*step*maxAngle;
                drawCookiemanSprite(ctx, pacman.pixel.x, pacman.pixel.y, pacman.dirEnum, frame, false, angle);
            }
        },
        drawExplodingPlayer: function(t) {
            var frame = pacman.getAnimFrame();
            drawPacmanSprite(ctx, pacman.pixel.x, pacman.pixel.y, pacman.dirEnum, 0, 0, t,-3,1-t);
        },
        drawFruit: function() {
            if (fruit.getCurrentFruit()) {
                var name = fruit.getCurrentFruit().name;
                if (fruit.savedPixel) {
                    vcr.drawHistory(ctx, function(t) {
                        var pixel = fruit.savedPixel[t];
                        if (pixel) {
                            atlas.drawFruitSprite(ctx, pixel.x, pixel.y, name);
                        }
                    });
                }
                if (fruit.isPresent()) {
                    atlas.drawFruitSprite(ctx, fruit.pixel.x, fruit.pixel.y, name);
                }
                else if (fruit.isScorePresent()) {
                    if (gameMode == GAME_PACMAN) {
                        atlas.drawPacFruitPoints(ctx, fruit.pixel.x, fruit.pixel.y, fruit.getPoints());
                    }
                    else {
                        atlas.drawMsPacFruitPoints(ctx, fruit.pixel.x, fruit.pixel.y, fruit.getPoints());
                    }
                }
            }
        },
    });
    renderer_list = [
        new SimpleRenderer(),
        new ArcadeRenderer(),
    ];
    renderer = renderer_list[1];
};
var hud = (function(){
    var on = false;
    return {
        update: function() {
            var valid = this.isValidState();
            if (valid != on) {
                on = valid;
                if (on) {
                    inGameMenu.onHudEnable();
                    vcr.onHudEnable();
                }
                else {
                    inGameMenu.onHudDisable();
                    vcr.onHudDisable();
                }
            }
        },
        draw: function(ctx) {
            inGameMenu.draw(ctx);
            vcr.draw(ctx);
        },
        isValidState: function() {
            return (
                state == playState ||
                state == newGameState ||
                state == readyNewState ||
                state == readyRestartState ||
                state == finishState ||
                state == deadState ||
                state == overState);
        },
    };
})();
var galagaStars = (function() {
    var stars = {};
    var numStars = 200;
    var width = mapWidth;
    var height = Math.floor(mapHeight*1.5);
    var ypos;
    var yspeed=-0.5;
    var t;
    var flickerPeriod = 120;
    var flickerSteps = 4;
    var flickerGap = flickerPeriod / flickerSteps;
    var init = function() {
        t = 0;
        ypos = 0;
        var i;
        for (i=0; i<numStars; i++) {
            stars[i] = {
                x: getRandomInt(0,width-1),
                y: getRandomInt(0,height-1),
                color: getRandomColor(),
                phase: getRandomInt(0,flickerPeriod-1),
            };
        }
    };
    var update = function() {
        t++;
        t %= flickerPeriod;
        ypos += yspeed;
        ypos %= height;
        if (ypos < 0) {
            ypos += height;
        }
    };
    var draw = function(ctx) {
        var i;
        var star;
        var time;
        var y;
        ctx.fillStyle = "#FFF";
        for (i=0; i<numStars; i++) {
            star = stars[i];
            time = (t + star.phase) % flickerPeriod;
            if (time >= flickerGap) {
                y = star.y - ypos;
                if (y < 0) {
                    y += height;
                }
                ctx.fillStyle = star.color;
                ctx.fillRect(star.x, y, 1,1);
            }
        }
    };
    return {
        init: init,
        draw: draw,
        update: update,
    };
})();
var getPointerPos = function(evt) {
    var obj = canvas;
    var top = 0;
    var left = 0;
    while (obj.tagName != 'BODY') {
        top += obj.offsetTop;
        left += obj.offsetLeft;
        obj = obj.offsetParent;
    }
    var mouseX = evt.pageX - left;
    var mouseY = evt.pageY - top;
    var ratio = getDevicePixelRatio();
    mouseX /= (renderScale / ratio);
    mouseY /= (renderScale / ratio);
    mouseX -= mapMargin;
    mouseY -= mapMargin;
    return { x: mouseX, y: mouseY };
};
var Button = function(x,y,w,h,onclick) {
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.onclick = onclick;
    this.pad = tileSize;
    this.frame = 0;
    this.borderBlurColor = "#333";
    this.borderFocusColor = "#EEE";
    this.isSelected = false;
    this.startedInside = false;
    var that = this;
    var touchstart = function(evt) {
        evt.preventDefault();
        var fingerCount = evt.touches.length;
        if (fingerCount == 1) {
            var pos = getPointerPos(evt.touches[0]);
            (that.startedInside=that.contains(pos.x,pos.y)) ? that.focus() : that.blur();
        }
        else {
            touchcancel(evt);
        }
    };
    var touchmove = function(evt) {
        evt.preventDefault();
        var fingerCount = evt.touches.length;
        if (fingerCount == 1) {
            if (that.startedInside) {
                var pos = getPointerPos(evt.touches[0]);
                that.contains(pos.x, pos.y) ? that.focus() : that.blur();
            }
        }
        else {
            touchcancel(evt);
        }
    };
    var touchend = function(evt) {
        evt.preventDefault();
        var registerClick = (that.startedInside && that.isSelected);
        if (registerClick) {
            that.click();
        }
        touchcancel(evt);
        if (registerClick) {
            that.focus();
        }
    };
    var touchcancel = function(evt) {
        evt.preventDefault();
        this.startedInside = false;
        that.blur();
    };
    var click = function(evt) {
        var pos = getPointerPos(evt);
        if (that.contains(pos.x, pos.y)) {
            that.click();
        }
    };
    var mousemove = function(evt) {
        var pos = getPointerPos(evt);
        that.contains(pos.x, pos.y) ? that.focus() : that.blur();
    };
    var mouseleave = function(evt) {
        that.blur();
    };
    this.isEnabled = false;
    this.onEnable = function() {
        canvas.addEventListener('click', click);
        canvas.addEventListener('mousemove', mousemove);
        canvas.addEventListener('mouseleave', mouseleave);
        canvas.addEventListener('touchstart', touchstart);
        canvas.addEventListener('touchmove', touchmove);
        canvas.addEventListener('touchend', touchend);
        canvas.addEventListener('touchcancel', touchcancel);
        this.isEnabled = true;
    };
    this.onDisable = function() {
        canvas.removeEventListener('click', click);
        canvas.removeEventListener('mousemove', mousemove);
        canvas.removeEventListener('mouseleave', mouseleave);
        canvas.removeEventListener('touchstart', touchstart);
        canvas.removeEventListener('touchmove', touchmove);
        canvas.removeEventListener('touchend', touchend);
        canvas.removeEventListener('touchcancel', touchcancel);
        that.blur();
        this.isEnabled = false;
    };
};
Button.prototype = {
    contains: function(x,y) {
        return x >= this.x && x <= this.x+this.w &&
               y >= this.y && y <= this.y+this.h;
    },
    click: function() {
        clearTimeout(this.clickTimeout);
        var that = this;
        if (that.onclick) {
            this.clickTimeout = setTimeout(function() { that.onclick(); }, 200);
        }
    },
    enable: function() {
        this.frame = 0;
        this.onEnable();
    },
    disable: function() {
        this.onDisable();
    },
    focus: function() {
        this.isSelected = true;
        this.onfocus && this.onfocus();
    },
    blur: function() {
        this.isSelected = false;
        this.onblur && this.onblur();
    },
    setText: function(msg) {
        this.msg = msg;
    },
    setFont: function(font,fontcolor) {
        this.font = font;
        this.fontcolor = fontcolor;
    },
    setIcon: function(drawIcon) {
        this.drawIcon = drawIcon;
    },
    draw: function(ctx) {
        ctx.lineWidth = 2;
        ctx.beginPath();
        var x=this.x, y=this.y, w=this.w, h=this.h;
        var r=h/4;
        ctx.moveTo(x,y+r);
        ctx.quadraticCurveTo(x,y,x+r,y);
        ctx.lineTo(x+w-r,y);
        ctx.quadraticCurveTo(x+w,y,x+w,y+r);
        ctx.lineTo(x+w,y+h-r);
        ctx.quadraticCurveTo(x+w,y+h,x+w-r,y+h);
        ctx.lineTo(x+r,y+h);
        ctx.quadraticCurveTo(x,y+h,x,y+h-r);
        ctx.closePath();
        ctx.fillStyle = "rgba(0,0,0,0.5)";
        ctx.fill();
        ctx.strokeStyle = this.isSelected && this.onclick ? this.borderFocusColor : this.borderBlurColor;
        ctx.stroke();
        if (this.drawIcon) {
            if (!this.msg) {
                this.drawIcon(ctx,this.x+this.w/2,this.y+this.h/2,this.frame);
            }
            else {
                this.drawIcon(ctx,this.x+this.pad+tileSize,this.y+this.h/2,this.frame);
            }
        }
        if (this.msg) {
            ctx.font = this.font;
            ctx.fillStyle = this.isSelected && this.onclick ? this.fontcolor : "#777";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillText(this.msg, this.x + this.w/2, this.y + this.h/2 + 1);
        }
    },
    update: function() {
        if (this.drawIcon) {
            this.frame = this.isSelected ? this.frame+1 : 0;
        }
    },
};
var ToggleButton = function(x,y,w,h,isOn,setOn) {
    var that = this;
    var onclick = function() {
        setOn(!isOn());
        that.refreshMsg();
    };
    this.isOn = isOn;
    this.setOn = setOn;
    Button.call(this,x,y,w,h,onclick);
};
ToggleButton.prototype = newChildObject(Button.prototype, {
    enable: function() {
        Button.prototype.enable.call(this);
        this.refreshMsg();
    },
    setToggleLabel: function(label) {
        this.label = label;
    },
    refreshMsg: function() {
        if (this.label) {
            this.msg = this.label + ": " + (this.isOn() ? "ON" : "OFF");
        }
    },
    refreshOnState: function() {
        this.setOn(this.isOn());
    },
});
var Menu = function(title,x,y,w,h,pad,font,fontcolor) {
    this.title = title;
    this.x = x;
    this.y = y;
    this.w = w;
    this.h = h;
    this.pad = pad;
    this.buttons = [];
    this.buttonCount = 0;
    this.currentY = this.y+this.pad;
    if (title) {
        this.currentY += 1*(this.h + this.pad);
    }
    this.font = font;
    this.fontcolor = fontcolor;
    this.enabled = false;
    this.backButton = undefined;
};
Menu.prototype = {
    clickCurrentOption: function() {
        var i;
        for (i=0; i<this.buttonCount; i++) {
            if (this.buttons[i].isSelected) {
                this.buttons[i].onclick();
                break;
            }
        }
    },
    selectNextOption: function() {
        var i;
        var nextBtn;
        for (i=0; i<this.buttonCount; i++) {
            if (this.buttons[i].isSelected) {
                this.buttons[i].blur();
                nextBtn = this.buttons[(i+1)%this.buttonCount];
                break;
            }
        }
        nextBtn = nextBtn || this.buttons[0];
        nextBtn.focus();
    },
    selectPrevOption: function() {
        var i;
        var nextBtn;
        for (i=0; i<this.buttonCount; i++) {
            if (this.buttons[i].isSelected) {
                this.buttons[i].blur();
                nextBtn = this.buttons[i==0?this.buttonCount-1:i-1];
                break;
            }
        }
        nextBtn = nextBtn || this.buttons[this.buttonCount-1];
        nextBtn.focus();
    },
    addToggleButton: function(isOn,setOn) {
        var b = new ToggleButton(this.x+this.pad,this.currentY,this.w-this.pad*2,this.h,isOn,setOn);
        this.buttons.push(b);
        this.buttonCount++;
        this.currentY += this.pad + this.h;
    },
    addToggleTextButton: function(label,isOn,setOn) {
        var b = new ToggleButton(this.x+this.pad,this.currentY,this.w-this.pad*2,this.h,isOn,setOn);
        b.setFont(this.font,this.fontcolor);
        b.setToggleLabel(label);
        this.buttons.push(b);
        this.buttonCount++;
        this.currentY += this.pad + this.h;
    },
    addTextButton: function(msg,onclick) {
        var b = new Button(this.x+this.pad,this.currentY,this.w-this.pad*2,this.h,onclick);
        b.setFont(this.font,this.fontcolor);
        b.setText(msg);
        this.buttons.push(b);
        this.buttonCount++;
        this.currentY += this.pad + this.h;
    },
    addTextIconButton: function(msg,onclick,drawIcon) {
        var b = new Button(this.x+this.pad,this.currentY,this.w-this.pad*2,this.h,onclick);
        b.setFont(this.font,this.fontcolor);
        b.setText(msg);
        b.setIcon(drawIcon);
        this.buttons.push(b);
        this.buttonCount++;
        this.currentY += this.pad + this.h;
    },
    addIconButton: function(drawIcon,onclick) {
        var b = new Button(this.x+this.pad,this.currentY,this.w-this.pad*2,this.h,onclick);
        b.setIcon(drawIcon);
        this.buttons.push(b);
        this.buttonCount++;
        this.currentY += this.pad + this.h;
    },
    addSpacer: function(count) {
        if (count == undefined) {
            count = 1;
        }
        this.currentY += count*(this.pad + this.h);
    },
    enable: function() {
        var i;
        for (i=0; i<this.buttonCount; i++) {
            this.buttons[i].enable();
        }
        this.enabled = true;
    },
    disable: function() {
        var i;
        for (i=0; i<this.buttonCount; i++) {
            this.buttons[i].disable();
        }
        this.enabled = false;
    },
    isEnabled: function() {
        return this.enabled;
    },
    draw: function(ctx) {
        if (this.title) {
            ctx.font = tileSize+"px ArcadeR";
            ctx.textBaseline = "middle";
            ctx.textAlign = "center";
            ctx.fillStyle = "#FFF";
            ctx.fillText(this.title,this.x + this.w/2, this.y+this.pad + this.h/2);
        }
        var i;
        for (i=0; i<this.buttonCount; i++) {
            this.buttons[i].draw(ctx);
        }
    },
    update: function() {
        var i;
        for (i=0; i<this.buttonCount; i++) {
            this.buttons[i].update();
        }
    },
};
var inGameMenu = (function() {
    var w=tileSize*6,h=tileSize*3;
    var getMainMenu = function() {
        return practiceMode ? practiceMenu : menu;
    };
    var showMainMenu = function() {
        getMainMenu().enable();
    };
    var hideMainMenu = function() {
        getMainMenu().disable();
    };
    var btn = new Button(mapWidth/2 - w/2,mapHeight,w,h, function() {
        showMainMenu();
        vcr.onHudDisable();
    });
    btn.setText("MENU");
    btn.setFont(tileSize+"px ArcadeR","#FFF");
    var confirmMenu = new Menu("QUESTION?",2*tileSize,5*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    confirmMenu.addTextButton("YES", function() {
        confirmMenu.disable();
        confirmMenu.onConfirm();
    });
    confirmMenu.addTextButton("NO", function() {
        confirmMenu.disable();
        showMainMenu();
    });
    confirmMenu.addTextButton("CANCEL", function() {
        confirmMenu.disable();
        showMainMenu();
    });
    confirmMenu.backButton = confirmMenu.buttons[confirmMenu.buttonCount-1];
    var showConfirm = function(title,onConfirm) {
        hideMainMenu();
        confirmMenu.title = title;
        confirmMenu.onConfirm = onConfirm;
        confirmMenu.enable();
    };
    var menu = new Menu("PAUSED",2*tileSize,5*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    menu.addTextButton("RESUME", function() {
        menu.disable();
    });
    menu.addTextButton("QUIT", function() {
        showConfirm("QUIT GAME?", function() {
            switchState(homeState, 60);
        });
    });
    menu.backButton = menu.buttons[0];
    var practiceMenu = new Menu("PAUSED",2*tileSize,5*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    practiceMenu.addTextButton("RESUME", function() {
        hideMainMenu();
        vcr.onHudEnable();
    });
    practiceMenu.addTextButton("RESTART LEVEL", function() {
        showConfirm("RESTART LEVEL?", function() {
            level--;
            switchState(readyNewState, 60);
        });
    });
    practiceMenu.addTextButton("SKIP LEVEL", function() {
        showConfirm("SKIP LEVEL?", function() {
            switchState(readyNewState, 60);
        });
    });
    practiceMenu.addTextButton("CHEATS", function() {
        practiceMenu.disable();
        cheatsMenu.enable();
    });
    practiceMenu.addTextButton("QUIT", function() {
        showConfirm("QUIT GAME?", function() {
            switchState(homeState, 60);
            clearCheats();
            vcr.reset();
        });
    });
    practiceMenu.backButton = practiceMenu.buttons[0];
    var cheatsMenu = new Menu("CHEATS",2*tileSize,5*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    cheatsMenu.addToggleTextButton("INVINCIBLE",
        function() {
            return pacman.invincible;
        },
        function(on) {
            pacman.invincible = on;
        });
    cheatsMenu.addToggleTextButton("TURBO",
        function() {
            return turboMode;
        },
        function(on) {
            turboMode = on;
        });
    cheatsMenu.addToggleTextButton("SHOW TARGETS",
        function() {
            return blinky.isDrawTarget;
        },
        function(on) {
            for (var i=0; i<4; i++) {
                ghosts[i].isDrawTarget = on;
            }
        });
    cheatsMenu.addToggleTextButton("SHOW PATHS",
        function() {
            return blinky.isDrawPath;
        },
        function(on) {
            for (var i=0; i<4; i++) {
                ghosts[i].isDrawPath = on;
            }
        });
    cheatsMenu.addSpacer(1);
    cheatsMenu.addTextButton("BACK", function() {
        cheatsMenu.disable();
        practiceMenu.enable();
    });
    cheatsMenu.backButton = cheatsMenu.buttons[cheatsMenu.buttons.length-1];
    var menus = [menu, practiceMenu, confirmMenu, cheatsMenu];
    var getVisibleMenu = function() {
        var len = menus.length;
        var i;
        var m;
        for (i=0; i<len; i++) {
            m = menus[i];
            if (m.isEnabled()) {
                return m;
            }
        }
    };
    return {
        onHudEnable: function() {
            btn.enable();
        },
        onHudDisable: function() {
            btn.disable();
        },
        update: function() {
            if (btn.isEnabled) {
                btn.update();
            }
        },
        draw: function(ctx) {
            var m = getVisibleMenu();
            if (m) {
                ctx.fillStyle = "rgba(0,0,0,0.8)";
                ctx.fillRect(-mapPad-1,-mapPad-1,mapWidth+1,mapHeight+1);
                m.draw(ctx);
            }
            else {
                btn.draw(ctx);
            }
        },
        isOpen: function() {
            return getVisibleMenu() != undefined;
        },
        getMenu: function() {
            return getVisibleMenu();
        },
        getMenuButton: function() {
            return btn;
        },
    };
})();
var drawGhostSprite = (function(){
    var addHead = (function() {
        var coords = [
            0,6,
            1,3,
            2,2,
            3,1,
            4,1,
            5,0,
            8,0,
            9,1,
            10,1,
            11,2,
            12,3,
            13,6,
        ];
        return function(ctx) {
            var i;
            ctx.save();
            ctx.translate(0.5,0);
            ctx.moveTo(0,6);
            ctx.quadraticCurveTo(1.5,0,6.5,0);
            ctx.quadraticCurveTo(11.5,0,13,6);
            /*
            ctx.moveTo(coords[0],coords[1]);
            for (i=2; i<coords.length; i+=2)
                ctx.lineTo(coords[i],coords[i+1]);
            */
            ctx.restore();
        };
    })();
    var addFeet1 = (function(){
        var coords = [
            13,13,
            11,11,
            9,13,
            8,13,
            8,11,
            5,11,
            5,13,
            4,13,
            2,11,
            0,13,
        ];
        return function(ctx) {
            var i;
            ctx.save();
            ctx.translate(0.5,0.5);
            for (i=0; i<coords.length; i+=2)
                ctx.lineTo(coords[i],coords[i+1]);
            ctx.restore();
        };
    })();
    var addFeet2 = (function(){
        var coords = [
            13,12,
            12,13,
            11,13,
            9,11,
            7,13,
            6,13,
            4,11,
            2,13,
            1,13,
            0,12,
        ];
        return function(ctx) {
            var i;
            ctx.save();
            ctx.translate(0.5,0.5);
            for (i=0; i<coords.length; i+=2)
                ctx.lineTo(coords[i],coords[i+1]);
            ctx.restore();
        };
    })();
    var addEyes = function(ctx,dirEnum){
        var i;
        ctx.save();
        ctx.translate(2,3);
        var coords = [
            0,1,
            1,0,
            2,0,
            3,1,
            3,3,
            2,4,
            1,4,
            0,3
        ];
        var drawEyeball = function() {
            ctx.translate(0.5,0.5);
            ctx.beginPath();
            ctx.moveTo(coords[0],coords[1]);
            for (i=2; i<coords.length; i+=2)
                ctx.lineTo(coords[i],coords[i+1]);
            ctx.closePath();
            ctx.fill();
            ctx.lineJoin = 'round';
            ctx.stroke();
            ctx.translate(-0.5,-0.5);
        };
        if (dirEnum == DIR_LEFT) ctx.translate(-1,0);
        else if (dirEnum == DIR_RIGHT) ctx.translate(1,0);
        else if (dirEnum == DIR_UP) ctx.translate(0,-1);
        else if (dirEnum == DIR_DOWN) ctx.translate(0,1);
        ctx.fillStyle = "#FFF";
        ctx.strokeStyle = "#FFF";
        ctx.lineWidth = 1.0;
        ctx.lineJoin = 'round';
        drawEyeball();
        ctx.translate(6,0);
        drawEyeball();
        if (dirEnum == DIR_LEFT) ctx.translate(0,2);
        else if (dirEnum == DIR_RIGHT) ctx.translate(2,2);
        else if (dirEnum == DIR_UP) ctx.translate(1,0);
        else if (dirEnum == DIR_DOWN) ctx.translate(1,3);
        ctx.fillStyle = "#00F";
        ctx.fillRect(0,0,2,2);
        ctx.translate(-6,0);
        ctx.fillRect(0,0,2,2);
        ctx.restore();
    };
    var addScaredFace = function(ctx,flash){
        ctx.strokeStyle = ctx.fillStyle = flash ? "#F00" : "#FF0";
        ctx.fillRect(4,5,2,2);
        ctx.fillRect(8,5,2,2);
        var coords = [
            1,10,
            2,9,
            3,9,
            4,10,
            5,10,
            6,9,
            7,9,
            8,10,
            9,10,
            10,9,
            11,9,
            12,10,
        ];
        ctx.translate(0.5,0.5);
        ctx.beginPath();
        ctx.moveTo(coords[0],coords[1]);
        for (i=2; i<coords.length; i+=2)
            ctx.lineTo(coords[i],coords[i+1]);
        ctx.lineWidth = 1.0;
        ctx.stroke();
        ctx.translate(-0.5,-0.5);
        /*
        ctx.fillRect(1,10,1,1);
        ctx.fillRect(12,10,1,1);
        ctx.fillRect(2,9,2,1);
        ctx.fillRect(6,9,2,1);
        ctx.fillRect(10,9,2,1);
        ctx.fillRect(4,10,2,1);
        ctx.fillRect(8,10,2,1);
        */
    };
    return function(ctx,x,y,frame,dirEnum,scared,flash,eyes_only,color) {
        ctx.save();
        ctx.translate(x-7,y-7);
        if (scared)
            color = flash ? "#FFF" : "#2121ff";
        if (!eyes_only) {
            ctx.beginPath();
            addHead(ctx);
            if (frame == 0)
                addFeet1(ctx);
            else
                addFeet2(ctx);
            ctx.closePath();
            ctx.lineJoin = 'round';
            ctx.lineCap = 'round';
            ctx.lineWidth = 0.5;
            ctx.strokeStyle = color;
            ctx.stroke();
            ctx.lineWidth = 1;
            ctx.fillStyle = color;
            ctx.fill();
        }
        if (scared)
            addScaredFace(ctx, flash);
        else
            addEyes(ctx,dirEnum);
        ctx.restore();
    };
})();
var drawPacPoints = (function(){
    var ctx;
    var color;
    var plotOutline = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.closePath();
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };
    var plotLine = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };
    var draw0 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotOutline([
            1,0,
            2,0,
            3,1,
            3,5,
            2,6,
            1,6,
            0,5,
            0,1,
        ],color);
        ctx.restore();
    };
    var draw1narrow = function(x,y) {
        plotLine([x,y,x,y+6],color);
    };
    var draw1 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            0,1,
            1,0,
            1,6,
            0,6,
            2,6,
        ],color);
        ctx.restore();
    };
    var draw2 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            0,2,
            0,1,
            1,0,
            3,0,
            4,1,
            4,2,
            0,6,
            4,6,
        ],color);
        ctx.restore();
    };
    var draw3 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            0,0,
            4,0,
            2,2,
            4,4,
            4,5,
            3,6,
            1,6,
            0,5,
        ],color);
        ctx.restore();
    };
    var draw4 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            3,6,
            3,0,
            0,3,
            0,4,
            4,4,
        ],color);
        ctx.restore();
    };
    var draw5 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            4,0,
            0,0,
            0,2,
            3,2,
            4,3,
            4,5,
            3,6,
            1,6,
            0,5,
        ],color);
        ctx.restore();
    };
    var draw6 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            3,0,
            1,0,
            0,1,
            0,5,
            1,6,
            2,6,
            3,5,
            3,3,
            0,3,
        ],color);
        ctx.restore();
    };
    var draw7 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            0,1,
            0,0,
            4,0,
            4,1,
            2,4,
            2,6,
        ],color);
        ctx.restore();
    };
    var draw8 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotOutline([
            1,0,
            3,0,
            4,1,
            4,2,
            3,3,
            1,3,
            0,4,
            0,5,
            1,6,
            3,6,
            4,5,
            4,4,
            3,3,
            1,3,
            0,2,
            0,1,
        ],color);
        ctx.restore();
    };
    var draw100 = function() {
        draw1(-5,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };
    var draw200 = function() {
        draw2(-7,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };
    var draw300 = function() {
        draw3(-7,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };
    var draw400 = function() {
        draw4(-7,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };
    var draw500 = function() {
        draw5(-7,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };
    var draw700 = function() {
        draw7(-7,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };
    var draw800 = function() {
        draw8(-7,-3);
        draw0(-1,-3);
        draw0(4,-3);
    };
    var draw1000 = function() {
        draw1(-8,-3);
        draw0(-4,-3);
        draw0(1,-3);
        draw0(6,-3);
    };
    var draw1600 = function() {
        draw1narrow(-7,-3);
        draw6(-5,-3);
        draw0(0,-3);
        draw0(5,-3);
    };
    var draw2000 = function() {
        draw2(-10,-3);
        draw0(-4,-3);
        draw0(1,-3);
        draw0(6,-3);
    };
    var draw3000 = function() {
        draw3(-10,-3);
        draw0(-4,-3);
        draw0(1,-3);
        draw0(6,-3);
    };
    var draw5000 = function() {
        draw5(-10,-3);
        draw0(-4,-3);
        draw0(1,-3);
        draw0(6,-3);
    };
    return function(_ctx,x,y,points,_color) {
        ctx = _ctx;
        color = _color;
        ctx.save();
        ctx.translate(x+0.5,y+0.5);
        ctx.translate(0,-1);
        var f = {
            100: draw100,
            200: draw200,
            300: draw300,
            400: draw400,
            500: draw500,
            700: draw700,
            800: draw800,
            1000: draw1000,
            1600: draw1600,
            2000: draw2000,
            3000: draw3000,
            5000: draw5000,
        }[points];
        if (f) {
            f();
        }
        ctx.restore();
    };
})();
var drawMsPacPoints = (function(){
    var ctx;
    var color = "#fff";
    var plotOutline = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.closePath();
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };
    var plotLine = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };
    var draw0 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotOutline([
            0,0,
            2,0,
            2,4,
            0,4,
        ],color);
        ctx.restore();
    };
    var draw1 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            1,0,
            1,4,
        ],color);
        ctx.restore();
    };
    var draw2 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            0,0,
            2,0,
            2,2,
            0,2,
            0,4,
            2,4,
        ],color);
        ctx.restore();
    };
    var draw5 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            2,0,
            0,0,
            0,2,
            2,2,
            2,4,
            0,4,
        ],color);
        ctx.restore();
    };
    var draw7 = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotLine([
            0,0,
            2,0,
            2,4,
        ],color);
        ctx.restore();
    };
    var draw100 = function() {
        draw1(-5,-5);
        draw0(-1,-2);
        draw0(3,1);
    };
    var draw200 = function() {
        draw2(-5,-5);
        draw0(-1,-2);
        draw0(3,1);
    };
    var draw500 = function() {
        draw5(-5,-5);
        draw0(-1,-2);
        draw0(3,1);
    };
    var draw700 = function() {
        draw7(-5,-5);
        draw0(-1,-2);
        draw0(3,1);
    };
    var draw1000 = function() {
        draw1(-7,-7);
        draw0(-3,-4);
        draw0(1,-1);
        draw0(5,2);
    };
    var draw2000 = function() {
        draw2(-7,-7);
        draw0(-3,-4);
        draw0(1,-1);
        draw0(5,2);
    };
    var draw5000 = function() {
        draw5(-7,-7);
        draw0(-3,-4);
        draw0(1,-1);
        draw0(5,2);
    };
    return function(_ctx,x,y,points) {
        ctx = _ctx;
        ctx.save();
        ctx.translate(x+0.5,y+0.5);
        var f = {
            100: draw100,
            200: draw200,
            500: draw500,
            700: draw700,
            1000: draw1000,
            2000: draw2000,
            5000: draw5000,
        }[points];
        if (f) {
            f();
        }
        ctx.restore();
    };
})();
var drawMonsterSprite = (function(){
    var ctx;
    var color;
    var plotOutline = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.closePath();
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };
    var plotLine = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };
    var plotSolid = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.closePath();
        ctx.lineWidth = 1.0;
        ctx.lineJoin = "round";
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.fill();
        ctx.stroke();
    };
    var drawEye = function(dirEnum,x,y){
        var i;
        ctx.save();
        ctx.translate(x,y);
        plotSolid([
            0,1,
            1,0,
            2,0,
            3,1,
            3,3,
            2,4,
            1,4,
            0,3
        ],"#FFF");
        if (dirEnum == DIR_LEFT) ctx.translate(0,2);
        else if (dirEnum == DIR_RIGHT) ctx.translate(2,2);
        else if (dirEnum == DIR_UP) ctx.translate(1,0);
        else if (dirEnum == DIR_DOWN) ctx.translate(1,3);
        plotSolid([
            0,0,
            1,0,
            1,1,
            0,1,
        ],"#00F");
        ctx.restore();
    };
    var drawRightBody = function() {
        plotSolid([
            -7,-3,
            -3,-7,
            -1,-7,
            -2,-6,
            0,-4,
            3,-7,
            5,-7,
            4,-7,
            3,-6,
            6,-3,
            6,1,
            5,3,
            2,6,
            -4,6,
            -5,5,
            -7,1,
        ],color);
    };
    var drawRightShoe = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        plotSolid([
            0,0,
            3,-3,
            4,-3,
            5,-2,
            5,-1,
            4,0,
        ],"#00F");
        ctx.restore();
    };
    var drawRight0 = function() {
        plotLine([-1,-7,0,-6],"#FFF");
        plotLine([5,-7,6,-6],"#FFF");
        drawRightBody();
        drawRightShoe(1,6);
        plotLine([-4,6,-1,6],"#00F");
        drawEye(DIR_RIGHT,-4,-4);
        drawEye(DIR_RIGHT,2,-4);
    };
    var drawRight1 = function() {
        plotLine([-1,-7,0,-7],"#FFF");
        plotLine([5,-7,6,-7],"#FFF");
        drawRightBody();
        drawRightShoe(-4,6);
        plotLine([2,6,5,6],"#00F");
        drawEye(DIR_RIGHT,-4,-4);
        drawEye(DIR_RIGHT,2,-4);
    };
    var drawLeft0 = function() {
        ctx.scale(-1,1);
        ctx.translate(1,0);
        drawRight0();
    };
    var drawLeft1 = function() {
        ctx.scale(-1,1);
        ctx.translate(1,0);
        drawRight1();
    };
    var drawUpDownBody0 = function() {
        plotLine([-6,-7,-7,-6],"#FFF");
        plotLine([5,-7,6,-6],"#FFF");
        plotSolid([
            -7,-3,
            -4,-6,
            -5,-7,
            -6,-7,
            -4,-7,
            -3,-6,
            -2,-6,
            -1,-5,
            0,-5,
            1,-6,
            2,-6,
            3,-7,
            5,-7,
            4,-7,
            3,-6,
            6,-3,
            6,1,
            5,3,
            4,5,
            3,6,
            -4,6,
            -5,5,
            -6,3,
            -7,1,
        ],color);
    };
    var drawUpDownBody1 = function() {
        plotLine([-6,-6,-7,-5],"#FFF");
        plotLine([5,-6,6,-5],"#FFF");
        plotSolid([
            -7,-3,
            -4,-6,
            -5,-7,
            -6,-6,
            -5,-7,
            -4,-7,
            -3,-6,
            -2,-6,
            -1,-5,
            0,-5,
            1,-6,
            2,-6,
            3,-7,
            4,-7,
            5,-6,
            4,-7,
            3,-6,
            6,-3,
            6,1,
            5,3,
            4,5,
            3,6,
            -4,6,
            -5,5,
            -6,3,
            -7,1,
        ],color);
    };
    var drawUp0 = function() {
        drawUpDownBody0();
        drawEye(DIR_UP,-5,-5);
        drawEye(DIR_UP,1,-5);
        plotSolid([
            -4,6,
            -3,5,
            -2,5,
            -1,6,
        ],"#00F");
    };
    var drawUp1 = function() {
        drawUpDownBody1();
        drawEye(DIR_UP,-5,-5);
        drawEye(DIR_UP,1,-5);
        plotSolid([
            0,6,
            1,5,
            2,5,
            3,6,
        ],"#00F");
    };
    var drawDown0 = function() {
        drawUpDownBody0();
        drawEye(DIR_DOWN,-5,-4);
        drawEye(DIR_DOWN,1,-4);
        plotSolid([
            0,6,
            1,4,
            2,3,
            3,3,
            4,4,
            4,5,
            3,6,
        ],"#00F");
        plotLine([-4,6,-2,6],"#00F");
    };
    var drawDown1 = function() {
        drawUpDownBody1();
        drawEye(DIR_DOWN,-5,-4);
        drawEye(DIR_DOWN,1,-4);
        plotSolid([
            -1,6,
            -2,4,
            -3,3,
            -4,3,
            -5,4,
            -5,5,
            -4,6,
        ],"#00F");
        plotLine([1,6,3,6],"#00F");
    };
    var borderColor;
    var faceColor;
    var drawScaredBody = function() {
        plotOutline([
            -6,-2,
            -2,-5,
            -3,-6,
            -5,-6,
            -3,-6,
            -1,-4,
            1,-4,
            3,-6,
            5,-6,
            3,-6,
            2,-5,
            6,-2,
            6,4,
            5,6,
            4,7,
            -4,7,
            -5,6,
            -6,4
        ],borderColor);
        plotLine([
            -2,4,
            -1,3,
            1,3,
            2,4
        ],faceColor);
    };
    var drawScared0 = function(flash) {
        plotLine([-2,-2,-2,0],faceColor);
        plotLine([-3,-1,-1,-1],faceColor);
        plotLine([2,-2,2,0],faceColor);
        plotLine([3,-1,1,-1],faceColor);
        plotLine([-5,-6,-6,-7],"#FFF");
        plotLine([5,-6,6,-7],"#FFF");
        drawScaredBody();
    };
    var drawScared1 = function(flash) {
        plotLine([-3,-2,-1,0],faceColor);
        plotLine([-3,0,-1,-2],faceColor);
        plotLine([1,-2,3,0],faceColor);
        plotLine([1,0,3,-2],faceColor);
        plotLine([-5,-6,-6,-5],"#FFF");
        plotLine([5,-6,6,-5],"#FFF");
        drawScaredBody();
    };
    return function(_ctx,x,y,frame,dirEnum,scared,flash,eyes_only,_color) {
        if (eyes_only) {
            return;
        }
        ctx = _ctx;
        color = _color;
        ctx.save();
        ctx.translate(x+0.5,y+0.5);
        if (scared) {
            ctx.translate(0,-1);
            borderColor = flash ? "#FFF" : "#00F";
            faceColor = flash ? "#F00" : "#FF0";
            [drawScared0, drawScared1][frame]();
        }
        else if (dirEnum == DIR_RIGHT) {
            [drawRight0, drawRight1][frame]();
        }
        else if (dirEnum == DIR_LEFT) {
            [drawLeft0, drawLeft1][frame]();
        }
        else if (dirEnum == DIR_DOWN) {
            [drawDown0, drawDown1][frame]();
        }
        else if (dirEnum == DIR_UP) {
            [drawUp0, drawUp1][frame]();
        }
        ctx.restore();
    };
})();
var drawColoredOttoSprite = function(color,eyeColor) {
    var ctx;
    var plotLine = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };
    var plotSolid = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.closePath();
        ctx.lineWidth = 1.0;
        ctx.lineJoin = "round";
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.fill();
        ctx.stroke();
    };
    var drawRightEye = function() {
        plotSolid([
            -4,-5,
            -3,-6,
            -2,-6,
            -2,-5,
            -3,-4,
            -4,-4,
        ],eyeColor);
    };
    var drawRight0 = function() {
        plotSolid([
            -5,-4,
            -3,-6,
            2,-6,
            3,-5,
            -1,-3,
            3,-1,
            1,1,
            1,3,
            3,6,
            5,4,
            6,4,
            6,5,
            4,7,
            2,7,
            -1,1,
            -4,4,
            -3,6,
            -3,7,
            -4,7,
            -6,5,
            -6,4,
            -3,1,
            -5,-1,
        ],color);
        drawRightEye();
    };
    var drawRight1 = function() {
        plotSolid([
            -5,-4,
            -3,-6,
            1,-6,
            3,-4,
            3,-1,
            1,1,
            1,6,
            4,6,
            4,7,
            0,7,
            0,1,
            -2,1,
            -4,3,
            -4,4,
            -3,5,
            -3,6,
            -4,6,
            -5,4,
            -5,3,
            -3,1,
            -5,-1,
        ],color);
        drawRightEye();
    };
    var drawRight2 = function() {
        plotSolid([
            -5,-4,
            -3,-6,
            2,-6,
            3,-5,
            -1,-3,
            3,-1,
            1,1,
            1,3,
            4,3,
            4,4,
            0,4,
            0,1,
            -2,1,
            -2,6,
            1,6,
            1,7,
            -3,7,
            -3,1,
            -5,-1,
        ],color);
        drawRightEye();
    };
    var drawRight3 = function() {
        plotSolid([
            -5,-4,
            -3,-6,
            2,-6,
            -2,-3,
            2,0,
            1,1,
            3,5,
            5,3,
            6,3,
            6,4,
            4,6,
            2,6,
            -1,1,
            -3,1,
            -3,6,
            0,6,
            0,7,
            -4,7,
            -4,2,
            -3,1,
            -5,-1,
        ],color);
        drawRightEye();
    };
    var drawUpDownEyes = function() {
        plotSolid([
            -5,-5,
            -4,-6,
            -3,-6,
            -3,-5,
            -4,-4,
            -5,-4,
        ],eyeColor);
        plotSolid([
            3,-6,
            4,-6,
            5,-5,
            5,-4,
            4,-4,
            3,-5,
        ],eyeColor);
    };
    var drawUpDownHead = function() {
        plotSolid([
            -4,-4,
            -2,-6,
            2,-6,
            4,-4,
            4,-1,
            2,1,
            -2,1,
            -4,-1,
        ],color);
    };
    var drawUpDownLeg0 = function(y,xs) {
        ctx.save();
        ctx.translate(0,y);
        ctx.scale(xs,1);
        plotSolid([
            1,0,
            2,0,
            2,6,
            4,6,
            4,7,
            1,7,
        ],color);
        ctx.restore();
    };
    var drawUpDownLeg1 = function(y,xs) {
        ctx.save();
        ctx.translate(0,y);
        ctx.scale(xs,1);
        plotSolid([
            1,0,
            2,0,
            2,4,
            3,5,
            4,4,
            5,4,
            5,5,
            3,7,
            2,7,
            1,6,
        ],color);
        ctx.restore();
    };
    var drawUpDownLegs0 = function() {
        drawUpDownLeg0(0,-1);
        drawUpDownLeg1(-2,1);
    };
    var drawUpDownLegs1 = function() {
        drawUpDownLeg0(-2,-1);
        drawUpDownLeg1(-2,1);
    };
    var drawUpDownLegs2 = function() {
        drawUpDownLeg1(-2,-1);
        drawUpDownLeg0(0,1);
    };
    var drawUpDownLegs3 = function() {
        drawUpDownLeg1(0,-1);
        drawUpDownLeg0(0,1);
    };
    var drawDown0 = function() {
        drawUpDownHead();
        drawUpDownEyes();
        drawUpDownLegs0();
        plotLine([-2,-3,2,-3],"#000");
    };
    var drawDown1 = function() {
        drawUpDownHead();
        drawUpDownEyes();
        drawUpDownLegs1();
    };
    var drawDown2 = function() {
        drawUpDownHead();
        drawUpDownEyes();
        drawUpDownLegs2();
        plotLine([-2,-3,2,-3],"#000");
    };
    var drawDown3 = function() {
        drawUpDownHead();
        drawUpDownEyes();
        drawUpDownLegs3();
        plotSolid([
            -2,-3,
            0,-5,
            2,-3,
            0,-1,
        ],"#000");
    };
    var drawUp0 = function() {
        drawUpDownEyes();
        drawUpDownHead();
        drawUpDownLegs0();
    };
    var drawUp1 = function() {
        drawUpDownEyes();
        drawUpDownHead();
        drawUpDownLegs1();
    };
    var drawUp2 = function() {
        drawUpDownEyes();
        drawUpDownHead();
        drawUpDownLegs2();
    };
    var drawUp3 = function() {
        drawUpDownEyes();
        drawUpDownHead();
        drawUpDownLegs3();
    };
    return function(_ctx,x,y,dirEnum,frame,rotate) {
        ctx = _ctx;
        ctx.save();
        ctx.translate(x+0.5,y+0.5);
        if (rotate) {
            ctx.rotate(rotate);
        }
        if (dirEnum == DIR_RIGHT) {
            ctx.translate(0,-1);
            [drawRight0, drawRight1, drawRight2, drawRight3][frame]();
        }
        else if (dirEnum == DIR_LEFT) {
            ctx.translate(0,-1);
            ctx.scale(-1,1);
            [drawRight0, drawRight1, drawRight2, drawRight3][frame]();
        }
        else if (dirEnum == DIR_DOWN) {
            ctx.translate(0,-1);
            [drawDown0, drawDown1, drawDown2, drawDown3][frame]();
        }
        else if (dirEnum == DIR_UP) {
            ctx.translate(0,-1);
            [drawUp0, drawUp1, drawUp2, drawUp3][frame]();
        }
        ctx.restore();
    };
};
var drawOttoSprite = drawColoredOttoSprite("#FF0","#00F");
var drawMsOttoSprite = drawColoredOttoSprite("#F00","#FFF");
var drawDeadOttoSprite = function(ctx,x,y) {
    var plotOutline = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.closePath();
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.strokeStyle = color;
        ctx.stroke();
    };
    ctx.save();
    ctx.translate(x+2,y);
    plotOutline([
        3,-5,
        -1,-5,
        -2,-6,
        -2,-7,
        -1,-8,
        3,-8,
        4,-7,
        4,-6,
    ],"#F00");
    ctx.restore();
    drawOttoSprite(ctx,x,y,DIR_LEFT,2,Math.PI/2);
};
var drawPacmanSprite = function(ctx,x,y,dirEnum,angle,mouthShift,scale,centerShift,alpha,color,rot_angle) {
    if (mouthShift == undefined) mouthShift = 0;
    if (centerShift == undefined) centerShift = 0;
    if (scale == undefined) scale = 1;
    if (alpha == undefined) alpha = 1;
    if (color == undefined) {
        color = "rgba(255,255,0," + alpha + ")";
    }
    ctx.save();
    ctx.translate(x,y);
    ctx.scale(scale,scale);
    if (rot_angle) {
        ctx.rotate(rot_angle);
    }
    var d90 = Math.PI/2;
    if (dirEnum == DIR_UP) ctx.rotate(3*d90);
    else if (dirEnum == DIR_RIGHT) ctx.rotate(0);
    else if (dirEnum == DIR_DOWN) ctx.rotate(d90);
    else if (dirEnum == DIR_LEFT) ctx.rotate(2*d90);
    ctx.beginPath();
    ctx.moveTo(-3+mouthShift,0);
    ctx.arc(centerShift,0,6.5,angle,2*Math.PI-angle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
};
var drawGiantPacmanSprite = function(ctx,x,y,dirEnum,frame) {
    var color = "#FF0";
    var mouthShift = 0;
    var angle = 0;
    if (frame == 1) {
        mouthShift = -4;
        angle = Math.atan(7/14);
    }
    else if (frame == 2) {
        mouthShift = -2;
        angle = Math.atan(13/9);
    }
    ctx.save();
    ctx.translate(x,y);
    var d90 = Math.PI/2;
    if (dirEnum == DIR_UP) ctx.rotate(3*d90);
    else if (dirEnum == DIR_RIGHT) ctx.rotate(0);
    else if (dirEnum == DIR_DOWN) ctx.rotate(d90);
    else if (dirEnum == DIR_LEFT) ctx.rotate(2*d90);
    ctx.beginPath();
    ctx.moveTo(mouthShift,0);
    ctx.arc(0,0,16,angle,2*Math.PI-angle);
    ctx.closePath();
    ctx.fillStyle = color;
    ctx.fill();
    ctx.restore();
};
var drawMsPacmanSprite = function(ctx,x,y,dirEnum,frame,rot_angle) {
    var angle = 0;
    if (frame == 0) {
        drawPacmanSprite(ctx,x,y,dirEnum,0,undefined,undefined,undefined,undefined,undefined,rot_angle);
    }
    else if (frame == 1) {
        angle = Math.atan(4/5);
        drawPacmanSprite(ctx,x,y,dirEnum,angle,undefined,undefined,undefined,undefined,undefined,rot_angle);
        angle = Math.atan(4/8);
    }
    else if (frame == 2) {
        angle = Math.atan(6/3);
        drawPacmanSprite(ctx,x,y,dirEnum,angle,undefined,undefined,undefined,undefined,undefined,rot_angle);
        angle = Math.atan(6/6);
    }
    ctx.save();
    ctx.translate(x,y);
    if (rot_angle) {
        ctx.rotate(rot_angle);
    }
    var d90 = Math.PI/2;
    if (dirEnum == DIR_UP)
        ctx.rotate(-d90);
    else if (dirEnum == DIR_DOWN)
        ctx.rotate(d90);
    else if (dirEnum == DIR_LEFT)
        ctx.scale(-1,1);
    var x=-7.5,y=-7.5;
    ctx.fillStyle = "#F00";
    ctx.beginPath(); ctx.arc(x+1,y+4,1.25,0,Math.PI*2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x+2,y+5,1.25,0,Math.PI*2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x+3,y+3,1.25,0,Math.PI*2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x+4,y+1,1.25,0,Math.PI*2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x+5,y+2,1.25,0,Math.PI*2); ctx.closePath(); ctx.fill();
    ctx.fillStyle = "#0031FF";
    ctx.beginPath(); ctx.arc(x+2.5,y+3.5,0.5,0,Math.PI*2); ctx.closePath(); ctx.fill();
    ctx.beginPath(); ctx.arc(x+3.5,y+2.5,0.5,0,Math.PI*2); ctx.closePath(); ctx.fill();
    ctx.strokeStyle = "#F00";
    ctx.lineWidth = 1.25;
    ctx.lineCap = "round";
    ctx.beginPath();
    if (frame == 0) {
        ctx.moveTo(5,0);
        ctx.lineTo(6.5,0);
        ctx.moveTo(6.5,-1.5);
        ctx.lineTo(6.5,1.5);
    }
    else {
        var r1 = 7.5;
        var r2 = 8.5;
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        ctx.moveTo(-3+r1*c,r1*s);
        ctx.lineTo(-3+r2*c,r2*s);
        ctx.moveTo(-3+r1*c,-r1*s);
        ctx.lineTo(-3+r2*c,-r2*s);
    }
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-3,2,0.5,0,Math.PI*2);
    ctx.fillStyle = "#000";
    ctx.fill();
    ctx.strokeStyle = "#000";
    ctx.lineCap = "round";
    ctx.beginPath();
    if (frame == 0) {
        ctx.moveTo(-2.5,-2);
        ctx.lineTo(-0.5,-2);
    }
    else {
        var r1 = 0.5;
        var r2 = 2.5;
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        ctx.moveTo(-3+r1*c,-2-r1*s);
        ctx.lineTo(-3+r2*c,-2-r2*s);
    }
    ctx.stroke();
    ctx.restore();
};
var drawCookiemanSprite = (function(){
    var prevFrame = undefined;
    var sx1 = 0;
    var sy1 = 0;
    var sx2 = 0;
    var sy2 = 0;
    var er = 2.1;
    var pr = 1;
    var movePupils = function() {
        var a1 = Math.random()*Math.PI*2;
        var a2 = Math.random()*Math.PI*2;
        var r1 = Math.random()*pr;
        var r2 = Math.random()*pr;
        sx1 = Math.cos(a1)*r1;
        sy1 = Math.sin(a1)*r1;
        sx2 = Math.cos(a2)*r2;
        sy2 = Math.sin(a2)*r2;
    };
    return function(ctx,x,y,dirEnum,frame,shake,rot_angle) {
        var angle = 0;
        var draw = function(angle) {
            drawPacmanSprite(ctx,x,y,dirEnum,angle,undefined,undefined,undefined,undefined,"#47b8ff",rot_angle);
        };
        if (frame == 0) {
            draw(0);
        }
        else if (frame == 1) {
            angle = Math.atan(4/5);
            draw(angle);
            angle = Math.atan(4/8);
        }
        else if (frame == 2) {
            angle = Math.atan(6/3);
            draw(angle);
            angle = Math.atan(6/6);
        }
        ctx.save();
        ctx.translate(x,y);
        if (rot_angle) {
            ctx.rotate(rot_angle);
        }
        var d90 = Math.PI/2;
        if (dirEnum == DIR_UP)
            ctx.rotate(-d90);
        else if (dirEnum == DIR_DOWN)
            ctx.rotate(d90);
        else if (dirEnum == DIR_LEFT)
            ctx.scale(-1,1);
        var x = -4;
        var y = -3.5;
        var r1 = 3;
        var r2 = 6;
        angle /= 3;
        angle += Math.PI/8;
        var c = Math.cos(angle);
        var s = Math.sin(angle);
        if (shake) {
            if (frame != prevFrame) {
                movePupils();
            }
            prevFrame = frame;
        }
        ctx.beginPath();
        ctx.arc(x+r2*c, y-r2*s, er, 0, Math.PI*2);
        ctx.fillStyle = "#FFF";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x+r2*c+sx2, y-r2*s+sy2, pr, 0, Math.PI*2);
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x+r1*c, y-r1*s, er, 0, Math.PI*2);
        ctx.fillStyle = "#FFF";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(x+r1*c+sx1, y-r1*s+sy1, pr, 0, Math.PI*2);
        ctx.fillStyle = "#000";
        ctx.fill();
        ctx.restore();
    };
})();
var drawCherry = function(ctx,x,y) {
    var cherry = function(x,y) {
        ctx.save();
        ctx.translate(x,y);
        ctx.beginPath();
        ctx.arc(2.5,2.5,3,0,Math.PI*2);
        ctx.lineWidth = 1.0;
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.fillStyle = "#ff0000";
        ctx.fill();
        ctx.lineCap = 'round';
        ctx.beginPath();
        ctx.moveTo(1,3);
        ctx.lineTo(2,4);
        ctx.strokeStyle = "#fff";
        ctx.stroke();
        ctx.restore();
    };
    ctx.save();
    ctx.translate(x,y);
    cherry(-6,-1);
    cherry(-1,1);
    ctx.beginPath();
    ctx.moveTo(-3,0);
    ctx.bezierCurveTo(-1,-2, 2,-4, 5,-5);
    ctx.lineTo(5,-4);
    ctx.bezierCurveTo(3,-4, 1,0, 1,2);
    ctx.strokeStyle = "#ff9900";
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
};
var drawStrawberry = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(-1,-4);
    ctx.bezierCurveTo(-3,-4,-5,-3, -5,-1);
    ctx.bezierCurveTo(-5,3,-2,5, 0,6);
    ctx.bezierCurveTo(3,5, 5,2, 5,0);
    ctx.bezierCurveTo(5,-3, 3,-4, 0,-4);
    ctx.fillStyle = "#f00";
    ctx.fill();
    ctx.strokeStyle = "#f00";
    ctx.stroke();
    var spots = [
        {x:-4,y:-1},
        {x:-3,y:2 },
        {x:-2,y:0 },
        {x:-1,y:4 },
        {x:0, y:2 },
        {x:0, y:0 },
        {x:2, y:4 },
        {x:2, y:-1 },
        {x:3, y:1 },
        {x:4, y:-2 } ];
    ctx.fillStyle = "#fff";
    var i,len;
    for (i=0, len=spots.length; i<len; i++) {
        var s = spots[i];
        ctx.beginPath();
        ctx.arc(s.x,s.y,0.75,0,2*Math.PI);
        ctx.fill();
    }
    ctx.beginPath();
    ctx.moveTo(0,-4);
    ctx.lineTo(-3,-4);
    ctx.lineTo(0,-4);
    ctx.lineTo(-2,-3);
    ctx.lineTo(-1,-3);
    ctx.lineTo(0,-4);
    ctx.lineTo(0,-2);
    ctx.lineTo(0,-4);
    ctx.lineTo(1,-3);
    ctx.lineTo(2,-3);
    ctx.lineTo(0,-4);
    ctx.lineTo(3,-4);
    ctx.closePath();
    ctx.strokeStyle = "#00ff00";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,-4);
    ctx.lineTo(0,-5);
    ctx.lineCap = 'round';
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.restore();
};
var drawOrange = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(-2,-2);
    ctx.bezierCurveTo(-3,-2, -5,-1, -5,1);
    ctx.bezierCurveTo(-5,4, -3,6, 0,6);
    ctx.bezierCurveTo(3,6, 5,4, 5,1);
    ctx.bezierCurveTo(5,-1, 3,-2, 2,-2);
    ctx.closePath();
    ctx.fillStyle="#ffcc33";
    ctx.fill();
    ctx.strokeStyle = "#ffcc33";
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-1,-1);
    ctx.quadraticCurveTo(-1,-2,-2,-2);
    ctx.quadraticCurveTo(-1,-2,-1,-4);
    ctx.quadraticCurveTo(-1,-2,0,-2);
    ctx.quadraticCurveTo(-1,-2,-1,-1);
    ctx.strokeStyle = "#ff9900";
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-0.5,-4);
    ctx.quadraticCurveTo(0,-5,1,-5);
    ctx.bezierCurveTo(2,-5, 3,-4,4,-4);
    ctx.bezierCurveTo(3,-4, 3,-3, 2,-3);
    ctx.bezierCurveTo(1,-3,1,-4,-0.5,-4);
    ctx.strokeStyle = "#00ff00";
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.fillStyle = "#00ff00";
    ctx.fill();
    ctx.restore();
};
var drawApple = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(-2,-3);
    ctx.bezierCurveTo(-2,-4,-3,-4,-4,-4);
    ctx.bezierCurveTo(-5,-4,-6,-3,-6,0);
    ctx.bezierCurveTo(-6,3,-4,6,-2.5,6);
    ctx.quadraticCurveTo(-1,6,-1,5);
    ctx.bezierCurveTo(-1,6,0,6,1,6);
    ctx.bezierCurveTo(3,6, 5,3, 5,0);
    ctx.bezierCurveTo(5,-3, 3,-4, 2,-4);
    ctx.quadraticCurveTo(0,-4,0,-3);
    ctx.closePath();
    ctx.fillStyle = "#ff0000";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-1,-3);
    ctx.quadraticCurveTo(-1,-5, 0,-5);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#ff9900';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2,3);
    ctx.quadraticCurveTo(3,3, 3,1);
    ctx.lineCap = 'round';
    ctx.strokeStyle = "#fff";
    ctx.stroke();
    ctx.restore();
};
var drawMelon = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.arc(0,2,5.5,0,Math.PI*2);
    ctx.fillStyle = "#7bf331";
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(0,-4);
    ctx.lineTo(0,-5);
    ctx.moveTo(2,-5);
    ctx.quadraticCurveTo(-3,-5,-3,-6);
    ctx.strokeStyle="#69b4af";
    ctx.lineCap = "round";
    ctx.stroke();
    /*
    ctx.beginPath();
    ctx.moveTo(0,-2);
    ctx.lineTo(-4,2);
    ctx.lineTo(-1,5);
    ctx.moveTo(-3,-1);
    ctx.lineTo(-2,0);
    ctx.moveTo(-2,6);
    ctx.lineTo(1,3);
    ctx.moveTo(1,7);
    ctx.lineTo(3,5);
    ctx.lineTo(0,2);
    ctx.lineTo(3,-1);
    ctx.moveTo(2,0);
    ctx.lineTo(4,2);
    ctx.strokeStyle="#69b4af";
    ctx.lineCap = "round";
    ctx.lineJoin = 'round';
    ctx.stroke();
    */
    var spots = [
        0,-2,
        -1,-1,
        -2,0,
        -3,1,
        -4,2,
        -3,3,
        -2,4,
        -1,5,
        -2,6,
        -3,-1,
        1,7,
        2,6,
        3,5,
        2,4,
        1,3,
        0,2,
        1,1,
        2,0,
        3,-1,
        3,1,
        4,2,
         ];
    ctx.fillStyle="#69b4af";
    var i,len;
    for (i=0, len=spots.length; i<len; i+=2) {
        var x = spots[i];
        var y = spots[i+1];
        ctx.beginPath();
        ctx.arc(x,y,0.65,0,2*Math.PI);
        ctx.fill();
    }
    var spots = [
        {x: 0,y:-3},
        {x:-2,y:-1},
        {x:-4,y: 1},
        {x:-3,y: 3},
        {x: 1,y: 0},
        {x:-1,y: 2},
        {x:-1,y: 4},
        {x: 3,y: 2},
        {x: 1,y: 4},
         ];
    ctx.fillStyle = "#fff";
    var i,len;
    for (i=0, len=spots.length; i<len; i++) {
        var s = spots[i];
        ctx.beginPath();
        ctx.arc(s.x,s.y,0.65,0,2*Math.PI);
        ctx.fill();
    }
    ctx.restore();
};
var drawGalaxian = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(-4,-2);
    ctx.lineTo(4,-2);
    ctx.lineTo(4,-1);
    ctx.lineTo(2,1);
    ctx.lineTo(1,0);
    ctx.lineTo(0,0);
    ctx.lineTo(0,5);
    ctx.lineTo(0,0);
    ctx.lineTo(-1,0);
    ctx.lineTo(-2,1);
    ctx.lineTo(-4,-1);
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ctx.fillStyle = '#fffa36';
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,-5);
    ctx.lineTo(-3,-2);
    ctx.lineTo(-2,-2);
    ctx.lineTo(-1,-3);
    ctx.lineTo(0,-3);
    ctx.lineTo(0,-1);
    ctx.lineTo(0,-3);
    ctx.lineTo(1,-3);
    ctx.lineTo(2,-2);
    ctx.lineTo(3,-2);
    ctx.closePath();
    ctx.lineJoin = 'round';
    ctx.strokeStyle = ctx.fillStyle = "#f00";
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(-5,-4);
    ctx.lineTo(-5,-1);
    ctx.lineTo(-2,2);
    ctx.moveTo(5,-4);
    ctx.lineTo(5,-1);
    ctx.lineTo(2,2);
    ctx.strokeStyle = "#00f";
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.restore();
};
var drawBell = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(-1,-5);
    ctx.bezierCurveTo(-4,-5,-6,1,-6,6);
    ctx.lineTo(5,6);
    ctx.bezierCurveTo(5,1,3,-5,0,-5);
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle = "#fffa37";
    ctx.stroke();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-4,4);
    ctx.lineTo(-4,3);
    ctx.moveTo(-3,1);
    ctx.quadraticCurveTo(-3,-2,-2,-2);
    ctx.moveTo(-1,-4);
    ctx.lineTo(0,-4);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#000';
    ctx.stroke();
    ctx.beginPath();
    ctx.rect(-5.5,6,10,2);
    ctx.fillStyle = "#68b9fc";
    ctx.fill();
    ctx.beginPath();
    ctx.rect(-0.5,6,2,2);
    ctx.fillStyle = '#fff';
    ctx.fill();
    ctx.restore();
};
var drawKey = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(-1,-2);
    ctx.lineTo(-1,5);
    ctx.moveTo(0,6);
    ctx.quadraticCurveTo(1,6,1,3);
    ctx.moveTo(1,4);
    ctx.lineTo(2,4);
    ctx.moveTo(1,1);
    ctx.lineTo(1,-2);
    ctx.moveTo(1,0);
    ctx.lineTo(2,0);
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#fff';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,-6);
    ctx.quadraticCurveTo(-3,-6,-3,-4);
    ctx.lineTo(-3,-2);
    ctx.lineTo(3,-2);
    ctx.lineTo(3,-4);
    ctx.quadraticCurveTo(3,-6, 0,-6);
    ctx.strokeStyle = ctx.fillStyle = "#68b9fc";
    ctx.fill();
    ctx.lineJoin = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(1,-5);
    ctx.lineTo(-1,-5);
    ctx.lineCap = 'round';
    ctx.strokeStyle = "#000";
    ctx.stroke();
    ctx.restore();
};
var drawPretzel = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(-2,-5);
    ctx.quadraticCurveTo(-4,-6,-6,-4);
    ctx.quadraticCurveTo(-7,-2,-5,1);
    ctx.quadraticCurveTo(-3,4,0,5);
    ctx.quadraticCurveTo(5,5,5,-1);
    ctx.quadraticCurveTo(6,-5,3,-5);
    ctx.quadraticCurveTo(1,-5,0,-2);
    ctx.quadraticCurveTo(-2,3,-5,5);
    ctx.moveTo(1,1);
    ctx.quadraticCurveTo(3,4,4,6);
    ctx.lineWidth = 2.0;
    ctx.lineCap = 'round';
    ctx.strokeStyle = "#ffcc33";
    ctx.stroke();
    var spots = [
        -5,-6,
        1,-6,
        4,-4,
        -5,0,
        -2,0,
        6,1,
        -4,6,
        5,5,
         ];
    ctx.fillStyle = "#fff";
    var i,len;
    for (i=0, len=spots.length; i<len; i+=2) {
        var x = spots[i];
        var y = spots[i+1];
        ctx.beginPath();
        ctx.arc(x,y,0.65,0,2*Math.PI);
        ctx.fill();
    }
    ctx.restore();
};
var drawPear = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(0,-4);
    ctx.bezierCurveTo(-1,-4,-2,-3,-2,-1);
    ctx.bezierCurveTo(-2,1,-4,2,-4,4);
    ctx.bezierCurveTo(-4,6,-2,7,0,7);
    ctx.bezierCurveTo(2,7,4,6,4,4);
    ctx.bezierCurveTo(4,2,2,1,2,-1);
    ctx.bezierCurveTo(2,-3,1,-4,0,-4);
    ctx.fillStyle = ctx.strokeStyle = "#00ff00";
    ctx.stroke();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(-2,3);
    ctx.quadraticCurveTo(-2,5,-1,5);
    ctx.strokeStyle = "#0033ff";
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(0,-4);
    ctx.quadraticCurveTo(0,-6,2,-6);
    ctx.strokeStyle = "#fff";
    ctx.lineCap = 'round';
    ctx.stroke();
    ctx.restore();
};
var drawBanana = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.moveTo(-5,5);
    ctx.quadraticCurveTo(-4,5,-2,6);
    ctx.bezierCurveTo(2,6,6,2,6,-4);
    ctx.lineTo(3,-3);
    ctx.lineTo(3,-2);
    ctx.lineTo(-4,5);
    ctx.closePath();
    ctx.fillStyle = ctx.strokeStyle = "#ffff00";
    ctx.stroke();
    ctx.fill();
    ctx.beginPath();
    ctx.moveTo(4,-5);
    ctx.lineTo(5,-6);
    ctx.strokeStyle="#ffff00";
    ctx.lineCap='round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(3,-1);
    ctx.lineTo(-2,4);
    ctx.strokeStyle = "#000";
    ctx.lineCap='round';
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(2,3);
    ctx.lineTo(0,5);
    ctx.strokeStyle = "#fff";
    ctx.lineCap='round';
    ctx.stroke();
    ctx.restore();
};
var drawCookie = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.arc(0,0,6,0,Math.PI*2);
    ctx.fillStyle = "#f9bd6d";
    ctx.fill();
    var spots = [
        0,-3,
        -4,-1,
        0,2,
        3,0,
        3,3,
         ];
    ctx.fillStyle = "#000";
    var i,len;
    for (i=0, len=spots.length; i<len; i+=2) {
        var x = spots[i];
        var y = spots[i+1];
        ctx.beginPath();
        ctx.arc(x,y,0.75,0,2*Math.PI);
        ctx.fill();
    }
    ctx.restore();
};
var drawCookieFlash = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.arc(0,0,6,0,Math.PI*2);
    ctx.fillStyle = "#000";
    ctx.lineWidth = 1;
    ctx.strokeStyle = "#f9bd6d";
    ctx.fill();
    ctx.stroke();
    var spots = [
        0,-3,
        -4,-1,
        0,2,
        3,0,
        3,3,
         ];
    ctx.fillStyle = "#f9bd6d";
    var i,len;
    for (i=0, len=spots.length; i<len; i+=2) {
        var x = spots[i];
        var y = spots[i+1];
        ctx.beginPath();
        ctx.arc(x,y,0.75,0,2*Math.PI);
        ctx.fill();
    }
    ctx.restore();
};
var getSpriteFuncFromFruitName = function(name) {
    var funcs = {
        'cherry': drawCherry,
        'strawberry': drawStrawberry,
        'orange': drawOrange,
        'apple': drawApple,
        'melon': drawMelon,
        'galaxian': drawGalaxian,
        'bell': drawBell,
        'key': drawKey,
        'pretzel': drawPretzel,
        'pear': drawPear,
        'banana': drawBanana,
        'cookie': drawCookie,
    };
    return funcs[name];
};
var drawRecordSymbol = function(ctx,x,y,color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(x,y);
    ctx.beginPath();
    ctx.arc(0,0,4,0,Math.PI*2);
    ctx.fill();
    ctx.restore();
};
var drawRewindSymbol = function(ctx,x,y,color) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.translate(x,y);
    var s = 3;
    var drawTriangle = function(x) {
        ctx.beginPath();
        ctx.moveTo(x,s);
        ctx.lineTo(x-2*s,0);
        ctx.lineTo(x,-s);
        ctx.closePath();
        ctx.fill();
    };
    drawTriangle(0);
    drawTriangle(2*s);
    ctx.restore();
};
var drawUpSymbol = function(ctx,x,y,color) {
    ctx.save();
    ctx.translate(x,y);
    var s = tileSize;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0,-s/2);
    ctx.lineTo(s/2,s/2);
    ctx.lineTo(-s/2,s/2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
};
var drawDownSymbol = function(ctx,x,y,color) {
    ctx.save();
    ctx.translate(x,y);
    var s = tileSize;
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0,s/2);
    ctx.lineTo(s/2,-s/2);
    ctx.lineTo(-s/2,-s/2);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
};
var drawSnail = (function(){
    var plotSolid = function(points,color) {
        var len = points.length;
        var i;
        ctx.beginPath();
        ctx.moveTo(points[0],points[1]);
        for (i=2; i<len; i+=2) {
            ctx.lineTo(points[i],points[i+1]);
        }
        ctx.closePath();
        ctx.lineWidth = 1.0;
        ctx.lineJoin = "round";
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.fill();
        ctx.stroke();
    };
    return function(ctx,x,y,color) {
        ctx.save();
        ctx.translate(x,y);
        ctx.beginPath();
        ctx.moveTo(-7,3);
        ctx.lineTo(-5,3);
        ctx.bezierCurveTo(-6,0,-5,-3,-2,-3);
        ctx.bezierCurveTo(0,-3,2,-2,2,2);
        ctx.bezierCurveTo(3,-1,3,-2,5,-2);
        ctx.bezierCurveTo(6,-2,6,0,5,0);
        ctx.bezierCurveTo(4,1,4,3,2,3);
        ctx.closePath();
        ctx.lineWidth = 1.0;
        ctx.lineCap = ctx.lineJoin = "round";
        ctx.fillStyle = ctx.strokeStyle = color;
        ctx.fill();
        ctx.stroke();
        ctx.beginPath();
        ctx.moveTo(4,-2);
        ctx.lineTo(3,-5);
        ctx.moveTo(5,-1);
        ctx.lineTo(7,-5);
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(3,-5, 1, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.arc(7,-5, 1, 0, Math.PI*2);
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(-4,1);
        ctx.bezierCurveTo(-5,-1,-3,-3, -1,-2);
        ctx.bezierCurveTo(0,-1,0,0,-1,1);
        ctx.bezierCurveTo(-2,1,-3,0,-2,-0.5);
        ctx.lineWidth = 0.5;
        ctx.strokeStyle = "#000";
        ctx.stroke();
        ctx.restore();
    };
})();
var drawHeartSprite = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.fillStyle = "#ffb8ff";
    ctx.beginPath();
    ctx.moveTo(0,-3);
    ctx.bezierCurveTo(-1,-4,-2,-6,-3.5,-6);
    ctx.quadraticCurveTo(-7,-6,-7,-0.5);
    ctx.bezierCurveTo(-7,2,-2,5,0,7);
    ctx.bezierCurveTo(2,5,7,2,7,-0.5);
    ctx.quadraticCurveTo(7,-6,3.5,-6);
    ctx.bezierCurveTo(2,-6,1,-4,0,-3);
    ctx.closePath();
    ctx.fill();
    ctx.restore();
};
var drawExclamationPoint = function(ctx,x,y) {
    ctx.save();
    ctx.translate(x,y);
    ctx.lineWidth = 0.5;
    ctx.strokeStyle = ctx.fillStyle = "#ff0";
    ctx.beginPath();
    ctx.moveTo(-1,1);
    ctx.bezierCurveTo(-1,0,-1,-3,0,-3);
    ctx.lineTo(2,-3);
    ctx.bezierCurveTo(2,-2,0,0,-1,1);
    ctx.fill();
    ctx.stroke();
    ctx.beginPath();
    ctx.arc(-2,3,0.5,0,Math.PI*2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();
};
var Actor = function() {
    this.dir = {};
    this.pixel = {};
    this.tile = {};
    this.tilePixel = {};
    this.distToMid = {};
    this.targetTile = {};
    this.frames = 0;
    this.steps = 0;
    this.isDrawTarget = false;
    this.isDrawPath = false;
    this.savedSteps = {};
    this.savedFrames = {};
    this.savedDirEnum = {};
    this.savedPixel = {};
    this.savedTargetting = {};
    this.savedTargetTile = {};
};
Actor.prototype.save = function(t) {
    this.savedSteps[t] = this.steps;
    this.savedFrames[t] = this.frames;
    this.savedDirEnum[t] = this.dirEnum;
    this.savedPixel[t] = { x:this.pixel.x, y:this.pixel.y };
    this.savedTargetting[t] = this.targetting;
    this.savedTargetTile[t] = { x: this.targetTile.x, y: this.targetTile.y };
};
Actor.prototype.load = function(t) {
    this.steps = this.savedSteps[t];
    this.frames = this.savedFrames[t];
    this.setDir(this.savedDirEnum[t]);
    this.setPos(this.savedPixel[t].x, this.savedPixel[t].y);
    this.targetting = this.savedTargetting[t];
    this.targetTile.x = this.savedTargetTile[t].x;
    this.targetTile.y = this.savedTargetTile[t].y;
};
Actor.prototype.reset = function() {
    this.setDir(this.startDirEnum);
    this.setPos(this.startPixel.x, this.startPixel.y);
    this.frames = 0;
    this.steps = 0;
    this.targetting = false;
};
Actor.prototype.setPos = function(px,py) {
    this.pixel.x = px;
    this.pixel.y = py;
    this.commitPos();
};
Actor.prototype.getTilePixel = function(pixel,tilePixel) {
    if (pixel == undefined) {
        pixel = this.pixel;
    }
    if (tilePixel == undefined) {
        tilePixel = {};
    }
    tilePixel.x = pixel.x % tileSize;
    tilePixel.y = pixel.y % tileSize;
    if (tilePixel.x < 0) {
        tilePixel.x += tileSize;
    }
    if (tilePixel.y < 0) {
        tilePixel.y += tileSize;
    }
    return tilePixel;
};
Actor.prototype.commitPos = function() {
    if (map) {
        map.teleport(this);
    }
    this.tile.x = Math.floor(this.pixel.x / tileSize);
    this.tile.y = Math.floor(this.pixel.y / tileSize);
    this.getTilePixel(this.pixel,this.tilePixel);
    this.distToMid.x = midTile.x - this.tilePixel.x;
    this.distToMid.y = midTile.y - this.tilePixel.y;
};
Actor.prototype.setDir = function(dirEnum) {
    setDirFromEnum(this.dir, dirEnum);
    this.dirEnum = dirEnum;
};
var STEP_PACMAN = 0;
var STEP_GHOST = 1;
var STEP_PACMAN_FRIGHT = 2;
var STEP_GHOST_FRIGHT = 3;
var STEP_GHOST_TUNNEL = 4;
var STEP_ELROY1 = 5;
var STEP_ELROY2 = 6;
Actor.prototype.getStepSizeFromTable = (function(){
    var stepSizes = (
    "1111111111111111" +
    "0111111111111111" +
    "1111211111112111" +
    "0110110101101101" +
    "0101010101010101" +
    "1111111111111111" +
    "1111111121111111" +
    "1111211111112111" +
    "1111111121111111" +
    "1111211112111121" +
    "0110110110110111" +
    "0110101011010101" +
    "1111211111112111" +
    "1111211112111121" +
    "1121112111211121" +
    "1111211112111121" +
    "1121112111211121" +
    "0111011101110111" +
    "0110110101101101" +
    "1121112111211121" +
    "1121121121121121" +
    "1111211111112111" +
    "1111211112111121" +
    "0000000000000000" +
    "0000000000000000" +
    "0110110101101101" +
    "1121112111211121" +
    "1121121121121121");
    return function(level, pattern) {
        var entry;
        if (level < 1) return;
        else if (level==1)                  entry = 0;
        else if (level >= 2 && level <= 4)  entry = 1;
        else if (level >= 5 && level <= 20) entry = 2;
        else if (level >= 21)               entry = 3;
        return stepSizes[entry*7*16 + pattern*16 + this.frames%16];
    };
})();
Actor.prototype.update = function(j) {
    var numSteps = this.getNumSteps();
    if (j >= numSteps)
        return;
    this.steps += this.step();
    this.steer();
};
var GHOST_OUTSIDE = 0;
var GHOST_EATEN = 1;
var GHOST_GOING_HOME = 2;
var GHOST_ENTERING_HOME = 3;
var GHOST_PACING_HOME = 4;
var GHOST_LEAVING_HOME = 5;
var Ghost = function() {
    Actor.apply(this);
    this.randomScatter = false;
    this.faceDirEnum = this.dirEnum;
};
Ghost.prototype = newChildObject(Actor.prototype);
Ghost.prototype.getBounceY = (function(){
    var bounceY = {};
    bounceY[DIR_UP] =    [-4,-2,0,2,4,3,2,3];
    bounceY[DIR_DOWN] =  [3,5,7,5,4,5,7,8];
    bounceY[DIR_LEFT] =  [2,3,3,4,3,2,2,2];
    bounceY[DIR_RIGHT] = [2,2,3,4,3,3,2,2];
    return function(px,py,dirEnum) {
        if (px == undefined) {
            px = this.pixel.x;
        }
        if (py == undefined) {
            py = this.pixel.y;
        }
        if (dirEnum == undefined) {
            dirEnum = this.dirEnum;
        }
        if (this.mode != GHOST_OUTSIDE || !this.scared || gameMode != GAME_COOKIE) {
            return py;
        }
        var tilePixel = this.getTilePixel({x:px,y:py});
        var tileY = Math.floor(py / tileSize);
        var y = tileY*tileSize;
        if (dirEnum == DIR_UP || dirEnum == DIR_DOWN) {
            y += bounceY[dirEnum][tilePixel.y];
        }
        else {
            y += bounceY[dirEnum][tilePixel.x];
        }
        return y;
    };
})();
Ghost.prototype.getAnimFrame = function(frames) {
    if (frames == undefined) {
        frames = this.frames;
    }
    return Math.floor(frames/8)%2;
};
Ghost.prototype.reset = function() {
    this.sigReverse = false;
    this.sigLeaveHome = false;
    this.mode = this.startMode;
    this.scared = false;
    audio.ghostReset();
    this.savedSigReverse = {};
    this.savedSigLeaveHome = {};
    this.savedMode = {};
    this.savedScared = {};
    this.savedElroy = {};
    this.savedFaceDirEnum = {};
    Actor.prototype.reset.apply(this);
    this.faceDirEnum = this.dirEnum;
};
Ghost.prototype.save = function(t) {
    this.savedSigReverse[t] = this.sigReverse;
    this.savedSigLeaveHome[t] = this.sigLeaveHome;
    this.savedMode[t] = this.mode;
    this.savedScared[t] = this.scared;
    if (this == blinky) {
        this.savedElroy[t] = this.elroy;
    }
    this.savedFaceDirEnum[t] = this.faceDirEnum;
    Actor.prototype.save.call(this,t);
};
Ghost.prototype.load = function(t) {
    this.sigReverse = this.savedSigReverse[t];
    this.sigLeaveHome = this.savedSigLeaveHome[t];
    this.mode = this.savedMode[t];
    this.scared = this.savedScared[t];
    if (this == blinky) {
        this.elroy = this.savedElroy[t];
    }
    this.faceDirEnum = this.savedFaceDirEnum[t];
    Actor.prototype.load.call(this,t);
};
Ghost.prototype.isSlowInTunnel = function() {
    if (gameMode == GAME_MSPACMAN || gameMode == GAME_OTTO || gameMode == GAME_COOKIE)
        return level <= 3;
    else
        return true;
};
Ghost.prototype.getNumSteps = function() {
    var pattern = STEP_GHOST;
    if (this.mode == GHOST_GOING_HOME || this.mode == GHOST_ENTERING_HOME)
        return 2;
    else if (this.mode == GHOST_LEAVING_HOME || this.mode == GHOST_PACING_HOME)
        return this.getStepSizeFromTable(1, STEP_GHOST_TUNNEL);
    else if (map.isTunnelTile(this.tile.x, this.tile.y) && this.isSlowInTunnel())
        pattern = STEP_GHOST_TUNNEL;
    else if (this.scared)
        pattern = STEP_GHOST_FRIGHT;
    else if (this.elroy == 1)
        pattern = STEP_ELROY1;
    else if (this.elroy == 2)
        pattern = STEP_ELROY2;
    return this.getStepSizeFromTable(level ? level : 1, pattern);
};
Ghost.prototype.reverse = function() {
    this.sigReverse = true;
};
Ghost.prototype.goHome = function() {
    audio.silence();
    audio.eatingGhost.play();
    this.mode = GHOST_EATEN;
};
Ghost.prototype.leaveHome = function() {
    this.playSounds();
    this.sigLeaveHome = true;
};
Ghost.prototype.playSounds = function() {
    var ghostsOutside = 0;
    var ghostsGoingHome = 0;
    for (var i=0; i<4; i++) {
        if (ghosts[i].mode == GHOST_OUTSIDE)    ghostsOutside++;
        if (ghosts[i].mode == GHOST_GOING_HOME) ghostsGoingHome++;
    }
    if (ghostsGoingHome > 0) {
        audio.ghostNormalMove.stopLoop();
        audio.ghostReturnToHome.startLoop(true);
        return;
    }
    else {
        audio.ghostReturnToHome.stopLoop();
    }
    if (ghostsOutside > 0 ) {
        if (! this.scared)
            audio.ghostNormalMove.startLoop(true);
    }
    else {
        audio.ghostNormalMove.stopLoop();
    }
}
Ghost.prototype.onEnergized = function() {
    this.reverse();
    if (this.mode != GHOST_GOING_HOME && this.mode != GHOST_ENTERING_HOME) {
        this.scared = true;
        this.targetting = undefined;
    }
};
Ghost.prototype.onEaten = function() {
    this.goHome();
    this.scared = false;
};
Ghost.prototype.step = function() {
    this.setPos(this.pixel.x+this.dir.x, this.pixel.y+this.dir.y);
    return 1;
};
Ghost.prototype.homeSteer = (function(){
    var steerFuncs = {};
    steerFuncs[GHOST_GOING_HOME] = function() {
        if (this.tile.x == map.doorTile.x && this.tile.y == map.doorTile.y) {
            this.faceDirEnum = DIR_DOWN;
            this.targetting = false;
            if (this.pixel.x == map.doorPixel.x) {
                this.mode = GHOST_ENTERING_HOME;
                this.playSounds();
                this.setDir(DIR_DOWN);
                this.faceDirEnum = this.dirEnum;
            }
            else {
                this.setDir(DIR_RIGHT);
                this.faceDirEnum = this.dirEnum;
            }
        }
    };
    steerFuncs[GHOST_ENTERING_HOME] = function() {
        if (this.pixel.y == map.homeBottomPixel) {
            if (this.pixel.x == this.startPixel.x) {
                this.setDir(DIR_UP);
                this.mode = this.arriveHomeMode;
            }
            else {
                this.setDir(this.startPixel.x < this.pixel.x ? DIR_LEFT : DIR_RIGHT);
            }
            this.faceDirEnum = this.dirEnum;
        }
    };
    steerFuncs[GHOST_PACING_HOME] = function() {
        if (this.sigLeaveHome) {
            this.sigLeaveHome = false;
            this.mode = GHOST_LEAVING_HOME;
            if (this.pixel.x == map.doorPixel.x)
                this.setDir(DIR_UP);
            else
                this.setDir(this.pixel.x < map.doorPixel.x ? DIR_RIGHT : DIR_LEFT);
        }
        else {
            if (this.pixel.y == map.homeTopPixel)
                this.setDir(DIR_DOWN);
            else if (this.pixel.y == map.homeBottomPixel)
                this.setDir(DIR_UP);
        }
        this.faceDirEnum = this.dirEnum;
    };
    steerFuncs[GHOST_LEAVING_HOME] = function() {
        if (this.pixel.x == map.doorPixel.x) {
            if (this.pixel.y == map.doorPixel.y) {
                this.mode = GHOST_OUTSIDE;
                this.setDir(DIR_LEFT);
            }
            else {
                this.setDir(DIR_UP);
            }
            this.faceDirEnum = this.dirEnum;
        }
    };
    return function() {
        var f = steerFuncs[this.mode];
        if (f)
            f.apply(this);
    };
})();
Ghost.prototype.isScatterBrain = function() {
    var scatter = false;
    if (ghostCommander.getCommand() == GHOST_CMD_SCATTER) {
        if (gameMode == GAME_MSPACMAN || gameMode == GAME_COOKIE) {
            scatter = (this == blinky || this == pinky);
        }
        else if (gameMode == GAME_OTTO) {
            scatter = true;
        }
    }
    return scatter;
};
Ghost.prototype.steer = function() {
    var dirEnum;
    var openTiles;
    var oppDirEnum = rotateAboutFace(this.dirEnum);
    var actor;
    this.homeSteer();
    oppDirEnum = rotateAboutFace(this.dirEnum);
    if (this.mode != GHOST_OUTSIDE && this.mode != GHOST_GOING_HOME) {
        this.targetting = false;
        return;
    }
    if (this.distToMid.x == 0 && this.distToMid.y == 0) {
        if (this.sigReverse) {
            this.faceDirEnum = oppDirEnum;
            this.sigReverse = false;
        }
        this.setDir(this.faceDirEnum);
    }
    else if (
            this.dirEnum == DIR_RIGHT && this.tilePixel.x == midTile.x+1 ||
            this.dirEnum == DIR_LEFT  && this.tilePixel.x == midTile.x-1 ||
            this.dirEnum == DIR_UP    && this.tilePixel.y == midTile.y-1 ||
            this.dirEnum == DIR_DOWN  && this.tilePixel.y == midTile.y+1) {
        var nextTile = {
            x: this.tile.x + this.dir.x,
            y: this.tile.y + this.dir.y,
        };
        openTiles = getOpenTiles(nextTile, this.dirEnum);
        if (this.scared) {
            dirEnum = Math.floor(Math.random()*4);
            while (!openTiles[dirEnum])
                dirEnum = (dirEnum+1)%4;
            this.targetting = false;
        }
        else {
            /* SET TARGET */
            if (this.mode == GHOST_GOING_HOME) {
                this.targetTile.x = map.doorTile.x;
                this.targetTile.y = map.doorTile.y;
            }
            else if (!this.elroy && ghostCommander.getCommand() == GHOST_CMD_SCATTER) {
                actor = this.isScatterBrain() ? actors[Math.floor(Math.random()*4)] : this;
                this.targetTile.x = actor.cornerTile.x;
                this.targetTile.y = actor.cornerTile.y;
                this.targetting = 'corner';
            }
            else {
                this.setTarget();
            }
            /* CHOOSE TURN */
            var dirDecided = false;
            if (this.mode == GHOST_GOING_HOME && map.getExitDir) {
                var exitDir = map.getExitDir(nextTile.x,nextTile.y);
                if (exitDir != undefined && exitDir != oppDirEnum) {
                    dirDecided = true;
                    dirEnum = exitDir;
                }
            }
            if (!dirDecided) {
                if (this.mode != GHOST_GOING_HOME) {
                    if (map.constrainGhostTurns) {
                        map.constrainGhostTurns(nextTile, openTiles, this.dirEnum);
                    }
                }
                dirEnum = getTurnClosestToTarget(nextTile, this.targetTile, openTiles);
            }
        }
        this.faceDirEnum = dirEnum;
    }
};
Ghost.prototype.getPathDistLeft = function(fromPixel, dirEnum) {
    var distLeft = tileSize;
    var pixel = this.getTargetPixel();
    if (this.targetting == 'pacman') {
        if (dirEnum == DIR_UP || dirEnum == DIR_DOWN)
            distLeft = Math.abs(fromPixel.y - pixel.y);
        else {
            distLeft = Math.abs(fromPixel.x - pixel.x);
        }
    }
    return distLeft;
};
Ghost.prototype.setTarget = function() {
    this.targetTile = this.getTargetTile();
    if (this != clyde) {
        this.targetting = 'pacman';
    }
};
var Player = function() {
    Actor.apply(this);
    if (gameMode == GAME_MSPACMAN || gameMode == GAME_COOKIE) {
        this.frames = 1;
    }
    this.nextDir = {};
    this.lastMeal = { x:-1, y:-1 };
    this.ai = false;
    this.invincible = false;
    this.savedNextDirEnum = {};
    this.savedStopped = {};
    this.savedEatPauseFramesLeft = {};
};
Player.prototype = newChildObject(Actor.prototype);
Player.prototype.save = function(t) {
    this.savedEatPauseFramesLeft[t] = this.eatPauseFramesLeft;
    this.savedNextDirEnum[t] = this.nextDirEnum;
    this.savedStopped[t] = this.stopped;
    Actor.prototype.save.call(this,t);
};
Player.prototype.load = function(t) {
    this.eatPauseFramesLeft = this.savedEatPauseFramesLeft[t];
    this.setNextDir(this.savedNextDirEnum[t]);
    this.stopped = this.savedStopped[t];
    Actor.prototype.load.call(this,t);
};
Player.prototype.reset = function() {
    this.setNextDir(this.startDirEnum);
    this.stopped = false;
    this.inputDirEnum = undefined;
    this.eatPauseFramesLeft = 0;
    Actor.prototype.reset.apply(this);
};
Player.prototype.setNextDir = function(nextDirEnum) {
    setDirFromEnum(this.nextDir, nextDirEnum);
    this.nextDirEnum = nextDirEnum;
};
Player.prototype.getNumSteps = function() {
    if (turboMode)
        return 2;
    var pattern = energizer.isActive() ? STEP_PACMAN_FRIGHT : STEP_PACMAN;
    return this.getStepSizeFromTable(level, pattern);
};
Player.prototype.getStepFrame = function(steps) {
    if (steps == undefined) {
        steps = this.steps;
    }
    return Math.floor(steps/2)%4;
};
Player.prototype.getAnimFrame = function(frame) {
    if (frame == undefined) {
        frame = this.getStepFrame();
    }
    if (gameMode == GAME_MSPACMAN || gameMode == GAME_COOKIE) {
        frame = (frame+1)%4;
        if (state == deadState)
            frame = 1;
    }
    if (gameMode != GAME_OTTO) {
        if (frame == 3)
            frame = 1;
    }
    return frame;
};
Player.prototype.setInputDir = function(dirEnum) {
    this.inputDirEnum = dirEnum;
};
Player.prototype.clearInputDir = function(dirEnum) {
    if (dirEnum == undefined || this.inputDirEnum == dirEnum) {
        this.inputDirEnum = undefined;
    }
};
Player.prototype.step = (function(){
    var sign = function(x) {
        if (x<0) return -1;
        if (x>0) return 1;
        return 0;
    };
    return function() {
        if (!map) {
            this.setPos(this.pixel.x+this.dir.x, this.pixel.y+this.dir.y);
            return 1;
        }
        var a = (this.dir.x != 0) ? 'x' : 'y';
        var b = (this.dir.x != 0) ? 'y' : 'x';
        this.stopped = this.stopped || (this.distToMid[a] == 0 && !isNextTileFloor(this.tile, this.dir));
        if (!this.stopped) {
            this.pixel[a] += this.dir[a];
            this.pixel[b] += sign(this.distToMid[b]);
        }
        this.commitPos();
        return this.stopped ? 0 : 1;
    };
})();
Player.prototype.steer = function() {
    if (this.ai) {
        if (this.distToMid.x != 0 || this.distToMid.y != 0)
            return;
        var openTiles = getOpenTiles(this.tile, this.dirEnum);
        this.setTarget();
        this.setNextDir(getTurnClosestToTarget(this.tile, this.targetTile, openTiles));
    }
    else {
        this.targetting = undefined;
    }
    if (this.inputDirEnum == undefined) {
        if (this.stopped) {
            this.setDir(this.nextDirEnum);
        }
    }
    else {
        var inputDir = {};
        setDirFromEnum(inputDir, this.inputDirEnum);
        var inputDirOpen = isNextTileFloor(this.tile, inputDir);
        if (inputDirOpen) {
            this.setDir(this.inputDirEnum);
            this.setNextDir(this.inputDirEnum);
            this.stopped = false;
        }
        else {
            if (!this.stopped) {
                this.setNextDir(this.inputDirEnum);
            }
        }
    }
    if (this.stopped) {
        audio.eating.stopLoop(true);
    }
};
Player.prototype.update = function(j) {
    var numSteps = this.getNumSteps();
    if (j >= numSteps)
        return;
    if (this.eatPauseFramesLeft > 0) {
        if (j == numSteps-1)
            this.eatPauseFramesLeft--;
        return;
    }
    Actor.prototype.update.call(this,j);
    if (map) {
        var t = map.getTile(this.tile.x, this.tile.y);
        if (t == '.' || t == 'o') {
            this.lastMeal.x = this.tile.x;
            this.lastMeal.y = this.tile.y
            if (!turboMode) {
                this.eatPauseFramesLeft = (t=='.') ? 1 : 3;
            }
            audio.eating.startLoop(true);
            map.onDotEat(this.tile.x, this.tile.y);
            ghostReleaser.onDotEat();
            fruit.onDotEat();
            addScore((t=='.') ? 10 : 50);
            if (t=='o')
                energizer.activate();
        }
        if (t == ' ' && ! (this.lastMeal.x == this.tile.x && this.lastMeal.y == this.tile.y)) {
            audio.eating.stopLoop(true);
        }
    }
};
var blinky = new Ghost();
blinky.name = "blinky";
blinky.color = "#FF0000";
blinky.pathColor = "rgba(255,0,0,0.8)";
blinky.isVisible = true;
var pinky = new Ghost();
pinky.name = "pinky";
pinky.color = "#FFB8FF";
pinky.pathColor = "rgba(255,184,255,0.8)";
pinky.isVisible = true;
var inky = new Ghost();
inky.name = "inky";
inky.color = "#00FFFF";
inky.pathColor = "rgba(0,255,255,0.8)";
inky.isVisible = true;
var clyde = new Ghost();
clyde.name = "clyde";
clyde.color = "#FFB851";
clyde.pathColor = "rgba(255,184,81,0.8)";
clyde.isVisible = true;
var pacman = new Player();
pacman.name = "pacman";
pacman.color = "#FFFF00";
pacman.pathColor = "rgba(255,255,0,0.8)";
var actors = [blinky, pinky, inky, clyde, pacman];
var ghosts = [blinky, pinky, inky, clyde];
var actorPathLength = 16;
(function() {
var targetSize = midTile.y;
pacman.pathCenter = { x:0, y:0};
blinky.pathCenter = { x:-2, y:-2 };
pinky.pathCenter = { x:-1, y:-1 };
inky.pathCenter = { x:1, y:1 };
clyde.pathCenter = { x:2, y:2 };
blinky.getTargetTile = function() {
    return { x: pacman.tile.x, y: pacman.tile.y };
};
blinky.getTargetPixel = function() {
    return { x: pacman.pixel.x, y: pacman.pixel.y };
};
blinky.drawTarget = function(ctx) {
    if (!this.targetting) return;
    ctx.fillStyle = this.color;
    if (this.targetting == 'pacman')
        renderer.drawCenterPixelSq(ctx, pacman.pixel.x, pacman.pixel.y, targetSize);
    else
        renderer.drawCenterTileSq(ctx, this.targetTile.x, this.targetTile.y, targetSize);
};
pinky.getTargetTile = function() {
    var px = pacman.tile.x + 4*pacman.dir.x;
    var py = pacman.tile.y + 4*pacman.dir.y;
    if (pacman.dirEnum == DIR_UP) {
        px -= 4;
    }
    return { x : px, y : py };
};
pinky.getTargetPixel = function() {
    var px = pacman.pixel.x + 4*pacman.dir.x*tileSize;
    var py = pacman.pixel.y + 4*pacman.dir.y*tileSize;
    if (pacman.dirEnum == DIR_UP) {
        px -= 4*tileSize;
    }
    return { x : px, y : py };
};
pinky.drawTarget = function(ctx) {
    if (!this.targetting) return;
    ctx.fillStyle = this.color;
    var pixel = this.getTargetPixel();
    if (this.targetting == 'pacman') {
        ctx.beginPath();
        ctx.moveTo(pacman.pixel.x, pacman.pixel.y);
        if (pacman.dirEnum == DIR_UP) {
            ctx.lineTo(pacman.pixel.x, pixel.y);
        }
        ctx.lineTo(pixel.x, pixel.y);
        ctx.stroke();
        renderer.drawCenterPixelSq(ctx, pixel.x, pixel.y, targetSize);
    }
    else
        renderer.drawCenterTileSq(ctx, this.targetTile.x, this.targetTile.y, targetSize);
};
inky.getTargetTile = function() {
    var px = pacman.tile.x + 2*pacman.dir.x;
    var py = pacman.tile.y + 2*pacman.dir.y;
    if (pacman.dirEnum == DIR_UP) {
        px -= 2;
    }
    return {
        x : blinky.tile.x + 2*(px - blinky.tile.x),
        y : blinky.tile.y + 2*(py - blinky.tile.y),
    };
};
inky.getJointPixel = function() {
    var px = pacman.pixel.x + 2*pacman.dir.x*tileSize;
    var py = pacman.pixel.y + 2*pacman.dir.y*tileSize;
    if (pacman.dirEnum == DIR_UP) {
        px -= 2*tileSize;
    }
    return { x: px, y: py };
};
inky.getTargetPixel = function() {
    var px = pacman.pixel.x + 2*pacman.dir.x*tileSize;
    var py = pacman.pixel.y + 2*pacman.dir.y*tileSize;
    if (pacman.dirEnum == DIR_UP) {
        px -= 2*tileSize;
    }
    return {
        x : blinky.pixel.x + 2*(px-blinky.pixel.x),
        y : blinky.pixel.y + 2*(py-blinky.pixel.y),
    };
};
inky.drawTarget = function(ctx) {
    if (!this.targetting) return;
    var pixel;
    var joint = this.getJointPixel();
    if (this.targetting == 'pacman') {
        pixel = this.getTargetPixel();
        ctx.beginPath();
        ctx.moveTo(pacman.pixel.x, pacman.pixel.y);
        if (pacman.dirEnum == DIR_UP) {
            ctx.lineTo(pacman.pixel.x, joint.y);
        }
        ctx.lineTo(joint.x, joint.y);
        ctx.moveTo(blinky.pixel.x, blinky.pixel.y);
        ctx.lineTo(pixel.x, pixel.y);
        ctx.closePath();
        ctx.stroke();
        ctx.beginPath();
        ctx.arc(joint.x, joint.y, 2,0,Math.PI*2);
        ctx.fillStyle = ctx.strokeStyle;
        ctx.fill();
        ctx.fillStyle = this.color;
        renderer.drawCenterPixelSq(ctx, pixel.x, pixel.y, targetSize);
    }
    else {
        ctx.fillStyle = this.color;
        renderer.drawCenterTileSq(ctx, this.targetTile.x, this.targetTile.y, targetSize);
    }
};
clyde.getTargetTile = function() {
    var dx = pacman.tile.x - (this.tile.x + this.dir.x);
    var dy = pacman.tile.y - (this.tile.y + this.dir.y);
    var dist = dx*dx+dy*dy;
    if (dist >= 64) {
        this.targetting = 'pacman';
        return { x: pacman.tile.x, y: pacman.tile.y };
    }
    else {
        this.targetting = 'corner';
        return { x: this.cornerTile.x, y: this.cornerTile.y };
    }
};
clyde.getTargetPixel = function() {
    return { x: pacman.pixel.x, y: pacman.pixel.y };
};
clyde.drawTarget = function(ctx) {
    if (!this.targetting) return;
    ctx.fillStyle = this.color;
    if (this.targetting == 'pacman') {
        ctx.beginPath();
        if (true) {
            ctx.arc(pacman.pixel.x, pacman.pixel.y, tileSize*8,0, 2*Math.PI);
            ctx.closePath();
        }
        else {
            ctx.moveTo(pacman.pixel.x, pacman.pixel.y);
            var dx = clyde.pixel.x - pacman.pixel.x;
            var dy = clyde.pixel.y - pacman.pixel.y;
            var dist = Math.sqrt(dx*dx+dy*dy);
            dx = dx/dist*tileSize*8;
            dy = dy/dist*tileSize*8;
            ctx.lineTo(pacman.pixel.x + dx, pacman.pixel.y + dy);
        }
        ctx.stroke();
        renderer.drawCenterPixelSq(ctx, pacman.pixel.x, pacman.pixel.y, targetSize);
    }
    else {
        if (ghostCommander.getCommand() == GHOST_CMD_CHASE) {
            ctx.beginPath();
            ctx.arc(pacman.pixel.x, pacman.pixel.y, tileSize*8,0, 2*Math.PI);
            ctx.strokeStyle = "rgba(255,255,255,0.25)";
            ctx.stroke();
        }
        renderer.drawCenterTileSq(ctx, this.targetTile.x, this.targetTile.y, targetSize);
    }
};
pacman.setTarget = function() {
    if (blinky.mode == GHOST_GOING_HOME || blinky.scared) {
        this.targetTile.x = pinky.tile.x;
        this.targetTile.y = pinky.tile.y;
        this.targetting = 'pinky';
    }
    else {
        this.targetTile.x = pinky.tile.x + 2*(pacman.tile.x-pinky.tile.x);
        this.targetTile.y = pinky.tile.y + 2*(pacman.tile.y-pinky.tile.y);
        this.targetting = 'flee';
    }
};
pacman.drawTarget = function(ctx) {
    if (!this.ai) return;
    ctx.fillStyle = this.color;
    var px,py;
    if (this.targetting == 'flee') {
        px = pacman.pixel.x - pinky.pixel.x;
        py = pacman.pixel.y - pinky.pixel.y;
        px = pinky.pixel.x + 2*px;
        py = pinky.pixel.y + 2*py;
        ctx.beginPath();
        ctx.moveTo(pinky.pixel.x, pinky.pixel.y);
        ctx.lineTo(px,py);
        ctx.closePath();
        ctx.stroke();
        renderer.drawCenterPixelSq(ctx, px, py, targetSize);
    }
    else {
        renderer.drawCenterPixelSq(ctx, pinky.pixel.x, pinky.pixel.y, targetSize);
    };
};
pacman.getPathDistLeft = function(fromPixel, dirEnum) {
    var distLeft = tileSize;
    var px,py;
    if (this.targetting == 'pinky') {
        if (dirEnum == DIR_UP || dirEnum == DIR_DOWN)
            distLeft = Math.abs(fromPixel.y - pinky.pixel.y);
        else
            distLeft = Math.abs(fromPixel.x - pinky.pixel.x);
    }
    else {
        px = pacman.pixel.x - pinky.pixel.x;
        py = pacman.pixel.y - pinky.pixel.y;
        px = pinky.pixel.x + 2*px;
        py = pinky.pixel.y + 2*py;
        if (dirEnum == DIR_UP || dirEnum == DIR_DOWN)
            distLeft = Math.abs(py - fromPixel.y);
        else
            distLeft = Math.abs(px - fromPixel.x);
    }
    return distLeft;
};
})();
var GHOST_CMD_CHASE = 0;
var GHOST_CMD_SCATTER = 1;
var ghostCommander = (function() {
    var getNewCommand = (function(){
        var t;
        var times = [{},{},{}];
        times[0][t=7*60] = GHOST_CMD_CHASE;
        times[0][t+=20*60] = GHOST_CMD_SCATTER;
        times[0][t+=7*60] = GHOST_CMD_CHASE;
        times[0][t+=20*60] = GHOST_CMD_SCATTER;
        times[0][t+=5*60] = GHOST_CMD_CHASE;
        times[0][t+=20*60] = GHOST_CMD_SCATTER;
        times[0][t+=5*60] = GHOST_CMD_CHASE;
        times[1][t=7*60] = GHOST_CMD_CHASE;
        times[1][t+=20*60] = GHOST_CMD_SCATTER;
        times[1][t+=7*60] = GHOST_CMD_CHASE;
        times[1][t+=20*60] = GHOST_CMD_SCATTER;
        times[1][t+=5*60] = GHOST_CMD_CHASE;
        times[1][t+=1033*60] = GHOST_CMD_SCATTER;
        times[1][t+=1] = GHOST_CMD_CHASE;
        times[2][t=5*60] = GHOST_CMD_CHASE;
        times[2][t+=20*60] = GHOST_CMD_SCATTER;
        times[2][t+=5*60] = GHOST_CMD_CHASE;
        times[2][t+=20*60] = GHOST_CMD_SCATTER;
        times[2][t+=5*60] = GHOST_CMD_CHASE;
        times[2][t+=1037*60] = GHOST_CMD_SCATTER;
        times[2][t+=1] = GHOST_CMD_CHASE;
        return function(frame) {
            var i;
            if (level == 1)
                i = 0;
            else if (level >= 2 && level <= 4)
                i = 1;
            else
                i = 2;
            var newCmd = times[i][frame];
            if (gameMode == GAME_PACMAN) {
                return newCmd;
            }
            else if (frame <= 27*60) {
                if (newCmd != undefined) {
                    return GHOST_CMD_CHASE;
                }
            }
        };
    })();
    var frame;
    var command;
    var savedFrame = {};
    var savedCommand = {};
    var save = function(t) {
        savedFrame[t] = frame;
        savedCommand[t] = command;
    };
    var load = function(t) {
        frame = savedFrame[t];
        command = savedCommand[t];
    };
    return {
        save: save,
        load: load,
        reset: function() {
            command = GHOST_CMD_SCATTER;
            frame = 0;
        },
        update: function() {
            var newCmd;
            if (!energizer.isActive()) {
                newCmd = getNewCommand(frame);
                if (newCmd != undefined) {
                    command = newCmd;
                    for (i=0; i<4; i++)
                        ghosts[i].reverse();
                }
                frame++;
            }
        },
        getCommand: function() {
            return command;
        },
        setCommand: function(cmd) {
            command = cmd;
        },
    };
})();
var ghostReleaser = (function(){
    var MODE_PERSONAL = 0;
    var MODE_GLOBAL = 1;
    var PINKY = 1;
    var INKY = 2;
    var CLYDE = 3;
    var getTimeoutLimit = function() { return (level < 5) ? 4*60 : 3*60; };
    var personalDotLimit = {};
    personalDotLimit[PINKY] = function() { return 0; };
    personalDotLimit[INKY] = function() { return (level==1) ? 30 : 0; };
    personalDotLimit[CLYDE] = function() {
        if (level == 1) return 60;
        if (level == 2) return 50;
        return 0;
    };
    var globalDotLimit = {};
    globalDotLimit[PINKY] = 7;
    globalDotLimit[INKY] = 17;
    globalDotLimit[CLYDE] = 32;
    var framesSinceLastDot;
    var mode;
    var ghostCounts = {};
    var globalCount;
    var savedGlobalCount = {};
    var savedFramesSinceLastDot = {};
    var savedGhostCounts = {};
    var save = function(t) {
        savedFramesSinceLastDot[t] = framesSinceLastDot;
        if (mode == MODE_GLOBAL) {
            savedGlobalCount[t] = globalCount;
        }
        else if (mode == MODE_PERSONAL) {
            savedGhostCounts[t] = {};
            savedGhostCounts[t][PINKY] = ghostCounts[PINKY];
            savedGhostCounts[t][INKY] = ghostCounts[INKY];
            savedGhostCounts[t][CLYDE] = ghostCounts[CLYDE];
        }
    };
    var load = function(t) {
        framesSinceLastDot = savedFramesSinceLastDot[t];
        if (mode == MODE_GLOBAL) {
            globalCount = savedGlobalCount[t];
        }
        else if (mode == MODE_PERSONAL) {
            ghostCounts[PINKY] = savedGhostCounts[t][PINKY];
            ghostCounts[INKY] = savedGhostCounts[t][INKY];
            ghostCounts[CLYDE] = savedGhostCounts[t][CLYDE];
        }
    };
    return {
        save: save,
        load: load,
        onNewLevel: function() {
            mode = MODE_PERSONAL;
            framesSinceLastDot = 0;
            ghostCounts[PINKY] = 0;
            ghostCounts[INKY] = 0;
            ghostCounts[CLYDE] = 0;
        },
        onRestartLevel: function() {
            mode = MODE_GLOBAL;
            framesSinceLastDot = 0;
            globalCount = 0;
        },
        onDotEat: function() {
            var i;
            framesSinceLastDot = 0;
            if (mode == MODE_GLOBAL) {
                globalCount++;
            }
            else {
                for (i=1;i<4;i++) {
                    if (ghosts[i].mode == GHOST_PACING_HOME) {
                        ghostCounts[i]++;
                        break;
                    }
                }
            }
        },
        update: function() {
            var g;
            if (mode == MODE_PERSONAL) {
                for (i=1;i<4;i++) {
                    g = ghosts[i];
                    if (g.mode == GHOST_PACING_HOME) {
                        if (ghostCounts[i] >= personalDotLimit[i]()) {
                            g.leaveHome();
                            return;
                        }
                        break;
                    }
                }
            }
            else if (mode == MODE_GLOBAL) {
                if (globalCount == globalDotLimit[PINKY] && pinky.mode == GHOST_PACING_HOME) {
                    pinky.leaveHome();
                    return;
                }
                else if (globalCount == globalDotLimit[INKY] && inky.mode == GHOST_PACING_HOME) {
                    inky.leaveHome();
                    return;
                }
                else if (globalCount == globalDotLimit[CLYDE] && clyde.mode == GHOST_PACING_HOME) {
                    globalCount = 0;
                    mode = MODE_PERSONAL;
                    clyde.leaveHome();
                    return;
                }
            }
            if (framesSinceLastDot > getTimeoutLimit()) {
                framesSinceLastDot = 0;
                for (i=1;i<4;i++) {
                    g = ghosts[i];
                    if (g.mode == GHOST_PACING_HOME) {
                        g.leaveHome();
                        break;
                    }
                }
            }
            else
                framesSinceLastDot++;
        },
    };
})();
var elroyTimer = (function(){
    var getDotsEatenLimit = (function(){
        var dotsLeft = [
            [20,30,40,40,40,50,50,50,60,60,60,70,70,70,100,100,100,100,120,120,120],
            [10,15,20,20,20,25,25,25,30,30,30,40,40,40, 50, 50, 50, 50, 60, 60, 60]];
        return function(stage) {
            var i = level;
            if (i>21) i = 21;
            var pacman_max_pellets = 244;
            return pacman_max_pellets - dotsLeft[stage-1][i-1];
        };
    })();
    var waitForClyde;
    var savedWaitForClyde = {};
    var save = function(t) {
        savedWaitForClyde[t] = waitForClyde;
    };
    var load = function(t) {
        waitForClyde = savedWaitForClyde[t];
    };
    return {
        onNewLevel: function() {
            waitForClyde = false;
        },
        onRestartLevel: function() {
            waitForClyde = true;
        },
        update: function() {
            if (waitForClyde && clyde.mode != GHOST_PACING_HOME)
                waitForClyde = false;
            if (waitForClyde) {
                blinky.elroy = 0;
            }
            else {
                if (map.dotsEaten >= getDotsEatenLimit(2)) {
                    blinky.elroy = 2;
                }
                else if (map.dotsEaten >= getDotsEatenLimit(1)) {
                    blinky.elroy = 1;
                }
                else {
                    blinky.elroy = 0;
                }
            }
        },
        save: save,
        load: load,
    };
})();
var energizer = (function() {
    var pointsDuration = 1;
    var getDuration = (function(){
        var seconds = [6,5,4,3,2,5,2,2,1,5,2,1,1,3,1,1,0,1];
        return function() {
            var i = level;
            return (i > 18) ? 0 : 60*seconds[i-1];
        };
    })();
    var getFlashes = (function(){
        var flashes = [5,5,5,5,5,5,5,5,3,5,5,3,3,5,3,3,0,3];
        return function() {
            var i = level;
            return (i > 18) ? 0 : flashes[i-1];
        };
    })();
    var flashInterval = 14;
    var count;
    var active;
    var points;
    var pointsFramesLeft;
    var savedCount = {};
    var savedActive = {};
    var savedPoints = {};
    var savedPointsFramesLeft = {};
    var save = function(t) {
        savedCount[t] = count;
        savedActive[t] = active;
        savedPoints[t] = points;
        savedPointsFramesLeft[t] = pointsFramesLeft;
    };
    var load = function(t) {
        count = savedCount[t];
        active = savedActive[t];
        points = savedPoints[t];
        pointsFramesLeft = savedPointsFramesLeft[t];
    };
    return {
        save: save,
        load: load,
        reset: function() {
            audio.ghostTurnToBlue.stopLoop();
            count = 0;
            active = false;
            points = 100;
            pointsFramesLeft = 0;
            for (i=0; i<4; i++)
                ghosts[i].scared = false;
        },
        update: function() {
            var i;
            if (active) {
                if (count == getDuration())
                    this.reset();
                else
                    count++;
            }
        },
        activate: function() {
            audio.ghostNormalMove.stopLoop();
            audio.ghostTurnToBlue.startLoop();
            active = true;
            count = 0;
            points = 100;
            for (i=0; i<4; i++) {
                ghosts[i].onEnergized();
            }
            if (getDuration() == 0) {
                this.reset();
            }
        },
        isActive: function() { return active; },
        isFlash: function() {
            var i = Math.floor((getDuration()-count)/flashInterval);
            return (i<=2*getFlashes()-1) ? (i%2==0) : false;
        },
        getPoints: function() {
            return points;
        },
        addPoints: function() {
            addScore(points*=2);
            pointsFramesLeft = pointsDuration*60;
        },
        showingPoints: function() { return pointsFramesLeft > 0; },
        updatePointsTimer: function() { if (pointsFramesLeft > 0) pointsFramesLeft--; },
    };
})();
var BaseFruit = function() {
    this.pixel = {x:0, y:0};
    this.fruitHistory = {};
    this.scoreDuration = 2;
    this.scoreFramesLeft;
    this.savedScoreFramesLeft = {};
};
BaseFruit.prototype = {
    isScorePresent: function() {
        return this.scoreFramesLeft > 0;
    },
    onNewLevel: function() {
        this.buildFruitHistory();
    },
    setCurrentFruit: function(i) {
        this.currentFruitIndex = i;
    },
    onDotEat: function() {
        if (!this.isPresent() && (map.dotsEaten == this.dotLimit1 || map.dotsEaten == this.dotLimit2)) {
            this.initiate();
        }
    },
    save: function(t) {
        this.savedScoreFramesLeft[t] = this.scoreFramesLeft;
    },
    load: function(t) {
        this.scoreFramesLeft = this.savedScoreFramesLeft[t];
    },
    reset: function() {
        this.scoreFramesLeft = 0;
    },
    getCurrentFruit: function() {
        return this.fruits[this.currentFruitIndex];
    },
    getPoints: function() {
        return this.getCurrentFruit().points;
    },
    update: function() {
        if (this.scoreFramesLeft > 0)
            this.scoreFramesLeft--;
    },
    isCollide: function() {
        return Math.abs(pacman.pixel.y - this.pixel.y) <= midTile.y && Math.abs(pacman.pixel.x - this.pixel.x) <= midTile.x;
    },
    testCollide: function() {
        if (this.isPresent() && this.isCollide()) {
            addScore(this.getPoints());
            audio.silence(true);
            audio.eatingFruit.play();
            setTimeout(ghosts[0].playSounds, 500);
            this.reset();
            this.scoreFramesLeft = this.scoreDuration*60;
        }
    },
};
var PacFruit = function() {
    BaseFruit.call(this);
    this.fruits = [
        {name:'cherry',     points:100},
        {name:'strawberry', points:300},
        {name:'orange',     points:500},
        {name:'apple',      points:700},
        {name:'melon',      points:1000},
        {name:'galaxian',   points:2000},
        {name:'bell',       points:3000},
        {name:'key',        points:5000},
    ];
    this.order = [
        0,
        1,
        2,
        2,
        3,
        3,
        4,
        4,
        5,
        5,
        6,
        6,
        7];
    this.dotLimit1 = 70;
    this.dotLimit2 = 170;
    this.duration = 9;
    this.framesLeft;
    this.savedFramesLeft = {};
};
PacFruit.prototype = newChildObject(BaseFruit.prototype, {
    onNewLevel: function() {
        this.setCurrentFruit(this.getFruitIndexFromLevel(level));
        BaseFruit.prototype.onNewLevel.call(this);
    },
    getFruitFromLevel: function(i) {
        return this.fruits[this.getFruitIndexFromLevel(i)];
    },
    getFruitIndexFromLevel: function(i) {
        if (i > 13) {
            i = 13;
        }
        return this.order[i-1];
    },
    buildFruitHistory: function() {
        this.fruitHistory = {};
        var i;
        for (i=1; i<= level; i++) {
            this.fruitHistory[i] = this.fruits[this.getFruitIndexFromLevel(i)];
        }
    },
    initiate: function() {
        var x = 13;
        var y = 20;
        this.pixel.x = tileSize*(1+x)-1;
        this.pixel.y = tileSize*y + midTile.y;
        this.framesLeft = 60*this.duration;
    },
    isPresent: function() {
        return this.framesLeft > 0;
    },
    reset: function() {
        BaseFruit.prototype.reset.call(this);
        this.framesLeft = 0;
    },
    update: function() {
        BaseFruit.prototype.update.call(this);
        if (this.framesLeft > 0)
            this.framesLeft--;
    },
    save: function(t) {
        BaseFruit.prototype.save.call(this,t);
        this.savedFramesLeft[t] = this.framesLeft;
    },
    load: function(t) {
        BaseFruit.prototype.load.call(this,t);
        this.framesLeft = this.savedFramesLeft[t];
    },
});
var PATH_ENTER = 0;
var PATH_PEN = 1;
var PATH_EXIT = 2;
var MsPacFruit = function() {
    BaseFruit.call(this);
    this.fruits = [
        {name: 'cherry',     points: 100},
        {name: 'strawberry', points: 200},
        {name: 'orange',     points: 500},
        {name: 'pretzel',    points: 700},
        {name: 'apple',      points: 1000},
        {name: 'pear',       points: 2000},
        {name: 'banana',     points: 5000},
    ];
    this.dotLimit1 = 64;
    this.dotLimit2 = 176;
    this.pen_path = "<<<<<<^^^^^^>>>>>>>>>vvvvvv<<";
    this.savedIsPresent = {};
    this.savedPixel = {};
    this.savedPathMode = {};
    this.savedFrame = {};
    this.savedNumFrames = {};
    this.savedPath = {};
};
MsPacFruit.prototype = newChildObject(BaseFruit.prototype, {
    shouldRandomizeFruit: function() {
        return level > 7;
    },
    getFruitFromLevel: function(i) {
        if (i <= 7) {
            return this.fruits[i-1];
        }
        else {
            return undefined;
        }
    },
    onNewLevel: function() {
        if (!this.shouldRandomizeFruit()) {
            this.setCurrentFruit(level-1);
        }
        else {
            this.setCurrentFruit(0);
        }
        BaseFruit.prototype.onNewLevel.call(this);
    },
    buildFruitHistory: function() {
        this.fruitHistory = {};
        var i;
        for (i=1; i<= Math.max(level,7); i++) {
            this.fruitHistory[i] = this.fruits[i-1];
        }
    },
    reset: function() {
        BaseFruit.prototype.reset.call(this);
        this.frame = 0;
        this.numFrames = 0;
        this.path = undefined;
    },
    initiatePath: function(p) {
        this.frame = 0;
        this.numFrames = p.length*16;
        this.path = p;
    },
    initiate: function() {
        if (this.shouldRandomizeFruit()) {
            this.setCurrentFruit(getRandomInt(0,6));
        }
        var entrances = map.fruitPaths.entrances;
        var e = entrances[getRandomInt(0,entrances.length-1)];
        this.initiatePath(e.path);
        this.pathMode = PATH_ENTER;
        this.pixel.x = e.start.x;
        this.pixel.y = e.start.y;
    },
    isPresent: function() {
        return this.frame < this.numFrames;
    },
    bounceFrames: (function(){
        var U = { dx:0, dy:-1 };
        var D = { dx:0, dy:1 };
        var L = { dx:-1, dy:0 };
        var R = { dx:1, dy:0 };
        var UL = { dx:-1, dy:-1 };
        var UR = { dx:1, dy:-1 };
        var DL = { dx:-1, dy:1 };
        var DR = { dx:1, dy:1 };
        var Z = { dx:0, dy:0 };
        return {
            '^': [U, U, U, U, U, U, U, U, U, Z, U, Z, Z, D, Z, D],
            '>': [Z, UR,Z, R, Z, UR,Z, R, Z, R, Z, R, Z, DR,DR,Z],
            '<': [Z, Z, UL,Z, L, Z, UL,Z, L, Z, L, Z, L, Z, DL,DL],
            'v': [Z, D, D, D, D, D, D, D, D, D, D, D, U, U, Z, U],
        };
    })(),
    move: function() {
        var p = this.path[Math.floor(this.frame/16)];
        var b = this.bounceFrames[p][this.frame%16];
        this.pixel.x += b.dx;
        this.pixel.y += b.dy;
        this.frame++;
    },
    setNextPath: function() {
        if (this.pathMode == PATH_ENTER) {
            this.pathMode = PATH_PEN;
            this.initiatePath(this.pen_path);
        }
        else if (this.pathMode == PATH_PEN) {
            this.pathMode = PATH_EXIT;
            var exits = map.fruitPaths.exits;
            var e = exits[getRandomInt(0,exits.length-1)];
            this.initiatePath(e.path);
        }
        else if (this.pathMode == PATH_EXIT) {
            this.reset();
        }
    },
    update: function() {
        BaseFruit.prototype.update.call(this);
        if (this.isPresent()) {
            this.move();
            if (this.frame == this.numFrames) {
                this.setNextPath();
            }
        }
    },
    save: function(t) {
        BaseFruit.prototype.save.call(this,t);
        this.savedPixel[t] =        this.isPresent() ? {x:this.pixel.x, y:this.pixel.y} : undefined;
        this.savedPathMode[t] =     this.pathMode;
        this.savedFrame[t] =        this.frame;
        this.savedNumFrames[t] =    this.numFrames;
        this.savedPath[t] =         this.path;
    },
    load: function(t) {
        BaseFruit.prototype.load.call(this,t);
        if (this.savedPixel[t]) {
            this.pixel.x =      this.savedPixel[t].x;
            this.pixel.y =      this.savedPixel[t].y;
        }
        this.pathMode =     this.savedPathMode[t];
        this.frame =        this.savedFrame[t];
        this.numFrames =    this.savedNumFrames[t];
        this.path =         this.savedPath[t];
    },
});
var fruit;
var setFruitFromGameMode = (function() {
    var pacfruit = new PacFruit();
    var mspacfruit = new MsPacFruit();
    fruit = pacfruit;
    return function() {
        if (gameMode == GAME_PACMAN) {
            fruit = pacfruit;
        }
        else {
            fruit = mspacfruit;
        }
    };
})();
var executive = (function(){
    var framePeriod = 1000/60;
    var gameTime;
    var paused = false;
    var running = false;
    /**********/
    (function() {
        var lastTime = 0;
        var vendors = ['ms', 'moz', 'webkit', 'o'];
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
            window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame']
                                       || window[vendors[x]+'CancelRequestAnimationFrame'];
        }
        if (!window.requestAnimationFrame)
            window.requestAnimationFrame = function(callback, element) {
                var currTime = new Date().getTime();
                var timeToCall = Math.max(0, 16 - (currTime - lastTime));
                var id = window.setTimeout(function() { callback(currTime + timeToCall); },
                  timeToCall);
                lastTime = currTime + timeToCall;
                return id;
            };
        if (!window.cancelAnimationFrame)
            window.cancelAnimationFrame = function(id) {
                clearTimeout(id);
            };
    }());
    /**********/
    var fps;
    var updateFps = (function(){
        var length = 60;
        var times = [];
        var startIndex = 0;
        var endIndex = -1;
        var filled = false;
        return function(now) {
            if (filled) {
                startIndex = (startIndex+1) % length;
            }
            endIndex = (endIndex+1) % length;
            if (endIndex == length-1) {
                filled = true;
            }
            times[endIndex] = now;
            var seconds = (now - times[startIndex]) / 1000;
            var frames = endIndex - startIndex;
            if (frames < 0) {
                frames += length;
            }
            fps = frames / seconds;
        };
    })();
    var reqFrame;
    var tick = function(now) {
        if (gameTime == undefined) {
            gameTime = now;
        }
        updateFps(now);
        var maxFrameSkip = 3;
        gameTime = Math.max(gameTime, now-maxFrameSkip*framePeriod);
        if (paused || inGameMenu.isOpen()) {
            gameTime = now;
        }
        hud.update();
        while (gameTime < now) {
            state.update();
            gameTime += framePeriod;
        }
        renderer.beginFrame();
        state.draw();
        if (hud.isValidState()) {
            renderer.renderFunc(hud.draw);
        }
        renderer.endFrame();
        reqFrame = requestAnimationFrame(tick);
    };
    return {
        getFramePeriod: function() {
            return framePeriod;
        },
        setUpdatesPerSecond: function(ups) {
            framePeriod = 1000/ups;
            vcr.onFramePeriodChange();
        },
        init: function() {
            var that = this;
            window.addEventListener('focus', function() {that.start();});
            window.addEventListener('blur', function() {that.stop();});
            this.start();
        },
        start: function() {
            if (!running) {
                reqFrame = requestAnimationFrame(tick);
                running = true;
            }
        },
        stop: function() {
            if (running) {
                cancelAnimationFrame(reqFrame);
                running = false;
            }
        },
        togglePause: function() { paused = !paused; },
        isPaused: function() { return paused; },
        getFps: function() { return fps; },
    };
})();
var state;
var switchState = function(nextState,fadeDuration, continueUpdate1, continueUpdate2) {
    state = (fadeDuration) ? fadeNextState(state,nextState,fadeDuration,continueUpdate1, continueUpdate2) : nextState;
    audio.silence();
    state.init();
    if (executive.isPaused()) {
        executive.togglePause();
    }
};
var fadeNextState = function (prevState, nextState, frameDuration, continueUpdate1, continueUpdate2) {
    var frames;
    var midFrame = Math.floor(frameDuration/2);
    var inFirstState = function() { return frames < midFrame; };
    var getStateTime = function() { return frames/frameDuration*2 + (inFirstState() ? 0 : -1); };
    var initialized = false;
    return {
        init: function() {
            frames = 0;
            initialized = true;
        },
        draw: function() {
            if (!initialized) return;
            var t = getStateTime();
            if (frames < midFrame) {
                if (prevState) {
                    prevState.draw();
                    renderer.setOverlayColor("rgba(0,0,0,"+t+")");
                }
            }
            else if (frames > midFrame) {
                nextState.draw();
                renderer.setOverlayColor("rgba(0,0,0,"+(1-t)+")");
            }
        },
        update: function() {
            if (frames < midFrame) {
                if (continueUpdate1) {
                    prevState.update();
                }
            }
            else if (frames == midFrame) {
                nextState.init();
            }
            else if (frames < frameDuration) {
                if (continueUpdate2) {
                    nextState.update();
                }
            }
            else {
                state = nextState;
                initialized = false;
            }
            frames++;
        },
    }
};
var homeState = (function(){
    var exitTo = function(s) {
        switchState(s);
        menu.disable();
    };
    var menu = new Menu("CHOOSE A GAME",2*tileSize,0*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    var getIconAnimFrame = function(frame) {
        frame = Math.floor(frame/3)+1;
        frame %= 4;
        if (frame == 3) {
            frame = 1;
        }
        return frame;
    };
    var getOttoAnimFrame = function(frame) {
        frame = Math.floor(frame/3);
        frame %= 4;
        return frame;
    };
    menu.addTextIconButton(getGameName(GAME_PACMAN),
        function() {
            gameMode = GAME_PACMAN;
            exitTo(preNewGameState);
        },
        function(ctx,x,y,frame) {
            atlas.drawPacmanSprite(ctx,x,y,DIR_RIGHT,getIconAnimFrame(frame));
        });
    menu.addTextIconButton(getGameName(GAME_MSPACMAN),
        function() {
            gameMode = GAME_MSPACMAN;
            exitTo(preNewGameState);
        },
        function(ctx,x,y,frame) {
            atlas.drawMsPacmanSprite(ctx,x,y,DIR_RIGHT,getIconAnimFrame(frame));
        });
    menu.addTextIconButton(getGameName(GAME_COOKIE),
        function() {
            gameMode = GAME_COOKIE;
            exitTo(preNewGameState);
        },
        function(ctx,x,y,frame) {
            drawCookiemanSprite(ctx,x,y,DIR_RIGHT,getIconAnimFrame(frame), true);
        });
    menu.addSpacer(0.5);
    menu.addTextIconButton("LEARN",
        function() {
            exitTo(learnState);
        },
        function(ctx,x,y,frame) {
            atlas.drawGhostSprite(ctx,x,y,Math.floor(frame/8)%2,DIR_RIGHT,false,false,false,blinky.color);
        });
    return {
        init: function() {
            menu.enable();
            audio.coffeeBreakMusic.startLoop();
        },
        draw: function() {
            renderer.clearMapFrame();
            renderer.beginMapClip();
            renderer.renderFunc(menu.draw,menu);
            renderer.endMapClip();
        },
        update: function() {
            menu.update();
        },
        getMenu: function() {
            return menu;
        },
    };
})();
var learnState = (function(){
    var exitTo = function(s) {
        switchState(s);
        menu.disable();
        forEachCharBtn(function (btn) {
            btn.disable();
        });
        setAllVisibility(true);
        clearCheats();
    };
    var menu = new Menu("LEARN", 2*tileSize,-tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    menu.addSpacer(7);
    menu.addTextButton("BACK",
        function() {
            exitTo(homeState);
        });
    menu.backButton = menu.buttons[menu.buttonCount-1];
    menu.noArrowKeys = true;
    var pad = tileSize;
    var w = 30;
    var h = 30;
    var x = mapWidth/2 - 2*(w) - 1.5*pad;
    var y = 4*tileSize;
    var redBtn = new Button(x,y,w,h,function(){
        setAllVisibility(false);
        blinky.isVisible = true;
        setVisibility(blinky,true);
    });
    redBtn.setIcon(function (ctx,x,y,frame) {
        getGhostDrawFunc()(ctx,x,y,Math.floor(frame/6)%2,DIR_DOWN,undefined,undefined,undefined,blinky.color);
    });
    x += w+pad;
    var pinkBtn = new Button(x,y,w,h,function(){
        setAllVisibility(false);
        setVisibility(pinky,true);
    });
    pinkBtn.setIcon(function (ctx,x,y,frame) {
        getGhostDrawFunc()(ctx,x,y,Math.floor(frame/6)%2,DIR_DOWN,undefined,undefined,undefined,pinky.color);
    });
    x += w+pad;
    var cyanBtn = new Button(x,y,w,h,function(){
        setAllVisibility(false);
        setVisibility(inky,true);
    });
    cyanBtn.setIcon(function (ctx,x,y,frame) {
        getGhostDrawFunc()(ctx,x,y,Math.floor(frame/6)%2,DIR_DOWN,undefined,undefined,undefined,inky.color);
    });
    x += w+pad;
    var orangeBtn = new Button(x,y,w,h,function(){
        setAllVisibility(false);
        setVisibility(clyde,true);
    });
    orangeBtn.setIcon(function (ctx,x,y,frame) {
        getGhostDrawFunc()(ctx,x,y,Math.floor(frame/6)%2,DIR_DOWN,undefined,undefined,undefined,clyde.color);
    });
    var forEachCharBtn = function(callback) {
        callback(redBtn);
        callback(pinkBtn);
        callback(cyanBtn);
        callback(orangeBtn);
    };
    var setVisibility = function(g,visible) {
        g.isVisible = g.isDrawTarget = g.isDrawPath = visible;
    };
    var setAllVisibility = function(visible) {
        setVisibility(blinky,visible);
        setVisibility(pinky,visible);
        setVisibility(inky,visible);
        setVisibility(clyde,visible);
    };
    return {
        init: function() {
            menu.enable();
            forEachCharBtn(function (btn) {
                btn.enable();
            });
            map = mapLearn;
            renderer.drawMap();
            level = 1;
            practiceMode = false;
            turboMode = false;
            gameMode = GAME_PACMAN;
            ghostCommander.reset();
            energizer.reset();
            ghostCommander.setCommand(GHOST_CMD_CHASE);
            ghostReleaser.onNewLevel();
            elroyTimer.onNewLevel();
            for (i=0; i<4; i++) {
                var a = actors[i];
                a.reset();
                a.mode = GHOST_OUTSIDE;
            }
            blinky.setPos(14*tileSize-1, 13*tileSize+midTile.y);
            pinky.setPos(15*tileSize+midTile.x, 13*tileSize+midTile.y);
            inky.setPos(9*tileSize+midTile.x, 16*tileSize+midTile.y);
            clyde.setPos(18*tileSize+midTile.x, 16*tileSize+midTile.y);
            pacman.reset();
            pacman.setPos(14*tileSize-1,22*tileSize+midTile.y);
            redBtn.onclick();
        },
        draw: function() {
            renderer.blitMap();
            renderer.renderFunc(menu.draw,menu);
            forEachCharBtn(function (btn) {
                renderer.renderFunc(btn.draw,btn);
            });
            renderer.beginMapClip();
            renderer.drawPaths();
            renderer.drawActors();
            renderer.drawTargets();
            renderer.endMapClip();
        },
        update: function() {
            menu.update();
            forEachCharBtn(function (btn) {
                btn.update();
            });
            var i,j;
            for (j=0; j<2; j++) {
                pacman.update(j);
                for (i=0;i<4;i++) {
                    actors[i].update(j);
                }
            }
            for (i=0; i<5; i++)
                actors[i].frames++;
        },
        getMenu: function() {
            return menu;
        },
    };
})();
var gameTitleState = (function() {
    var name,nameColor;
    var resetTitle = function() {
        if (yellowBtn.isSelected) {
            name = getGameName();
            nameColor = gameMode == GAME_COOKIE ? "#47b8ff" : pacman.color;
        }
        else if (redBtn.isSelected) {
            name = getGhostNames()[0];
            nameColor = blinky.color;
        }
        else if (pinkBtn.isSelected) {
            name = getGhostNames()[1];
            nameColor = pinky.color;
        }
        else if (cyanBtn.isSelected) {
            name = getGhostNames()[2];
            nameColor = inky.color;
        }
        else if (orangeBtn.isSelected) {
            name = getGhostNames()[3];
            nameColor = clyde.color;
        }
        else {
            name = getGameName();
            nameColor = "#FFF";
        }
    };
    var w = 20;
    var h = 30;
    var x = mapWidth/2 - 3*w;
    var y = 3*tileSize;
    var yellowBtn = new Button(x,y,w,h,function() {
        if (gameMode == GAME_MSPACMAN) {
            gameMode = GAME_OTTO;
        }
        else if (gameMode == GAME_OTTO) {
            gameMode = GAME_MSPACMAN;
        }
    });
    yellowBtn.setIcon(function (ctx,x,y,frame) {
        getPlayerDrawFunc()(ctx,x,y,DIR_RIGHT,pacman.getAnimFrame(pacman.getStepFrame(Math.floor((gameMode==GAME_PACMAN?frame+4:frame)/1.5))),true);
    });
    x += 2*w;
    var redBtn = new Button(x,y,w,h);
    redBtn.setIcon(function (ctx,x,y,frame) {
        getGhostDrawFunc()(ctx,x,y,Math.floor(frame/6)%2,DIR_LEFT,undefined,undefined,undefined,blinky.color);
    });
    x += w;
    var pinkBtn = new Button(x,y,w,h);
    pinkBtn.setIcon(function (ctx,x,y,frame) {
        getGhostDrawFunc()(ctx,x,y,Math.floor(frame/6)%2,DIR_LEFT,undefined,undefined,undefined,pinky.color);
    });
    x += w;
    var cyanBtn = new Button(x,y,w,h)
    cyanBtn.setIcon(function (ctx,x,y,frame) {
        getGhostDrawFunc()(ctx,x,y,Math.floor(frame/6)%2,DIR_LEFT,undefined,undefined,undefined,inky.color);
    });
    x += w;
    var orangeBtn = new Button(x,y,w,h);
    orangeBtn.setIcon(function (ctx,x,y,frame) {
        getGhostDrawFunc()(ctx,x,y,Math.floor(frame/6)%2,DIR_LEFT,undefined,undefined,undefined,clyde.color);
    });
    var forEachCharBtn = function(callback) {
        callback(yellowBtn);
        callback(redBtn);
        callback(pinkBtn);
        callback(cyanBtn);
        callback(orangeBtn);
    };
    forEachCharBtn(function(btn) {
        btn.borderBlurColor = btn.borderFocusColor = "#000";
    });
    return {
        init: function() {
            resetTitle();
            forEachCharBtn(function (btn) {
                btn.enable();
            });
        },
        shutdown: function() {
            forEachCharBtn(function (btn) {
                btn.disable();
            });
        },
        draw: function() {
            forEachCharBtn(function (btn) {
                renderer.renderFunc(btn.draw,btn);
            });
            resetTitle();
            renderer.renderFunc(function(ctx){
                ctx.font = tileSize+"px ArcadeR";
                ctx.fillStyle = nameColor;
                ctx.textAlign = "center";
                ctx.textBaseline = "top";
                ctx.fillText(name, mapWidth/2, tileSize);
            });
        },
        update: function() {
            forEachCharBtn(function (btn) {
                btn.update();
            });
        },
        getYellowBtn: function() {
            return yellowBtn;
        },
    };
})();
var preNewGameState = (function() {
    var exitTo = function(s,fade) {
        gameTitleState.shutdown();
        menu.disable();
        switchState(s,fade);
    };
    var menu = new Menu("",2*tileSize,0,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    menu.addSpacer(2);
    menu.addTextButton("PLAY",
        function() {
            practiceMode = false;
            turboMode = false;
            newGameState.setStartLevel(1);
            exitTo(newGameState, 60);
        });
    menu.addTextButton("PLAY TURBO",
        function() {
            practiceMode = false;
            turboMode = true;
            newGameState.setStartLevel(1);
            exitTo(newGameState, 60);
        });
    menu.addTextButton("PRACTICE",
        function() {
            practiceMode = true;
            turboMode = false;
            exitTo(selectActState);
        });
    menu.addSpacer(0.5);
    menu.addTextButton("CUTSCENES",
        function() {
            exitTo(cutSceneMenuState);
        });
    menu.addTextButton("ABOUT",
        function() {
            exitTo(aboutGameState);
        });
    menu.addSpacer(0.5);
    menu.addTextButton("BACK",
        function() {
            exitTo(homeState);
        });
    menu.backButton = menu.buttons[menu.buttonCount-1];
    return {
        init: function() {
            audio.startMusic.play();
            menu.enable();
            gameTitleState.init();
            map = undefined;
        },
        draw: function() {
            renderer.clearMapFrame();
            renderer.renderFunc(menu.draw,menu);
            gameTitleState.draw();
        },
        update: function() {
            gameTitleState.update();
        },
        getMenu: function() {
            return menu;
        },
    };
})();
var selectActState = (function() {
    var menu;
    var numActs = 4;
    var defaultStartAct = 1;
    var startAct = defaultStartAct;
    var exitTo = function(state,fade) {
        gameTitleState.shutdown();
        menu.disable();
        switchState(state,fade);
    };
    var chooseLevelFromAct = function(act) {
        selectLevelState.setAct(act);
        exitTo(selectLevelState);
    };
    var scrollToAct = function(act) {
        selectActState.setStartAct(act);
        exitTo(selectActState);
    };
    var drawArrow = function(ctx,x,y,dir) {
        ctx.save();
        ctx.translate(x,y);
        ctx.scale(1,dir);
        ctx.beginPath();
        ctx.moveTo(0,-tileSize/2);
        ctx.lineTo(tileSize,tileSize/2);
        ctx.lineTo(-tileSize,tileSize/2);
        ctx.closePath();
        ctx.fillStyle = "#FFF";
        ctx.fill();
        ctx.restore();
    };
    var buildMenu = function(act) {
        startAct = act;
        menu = new Menu("",2*tileSize,0,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
        var i;
        var range;
        menu.addSpacer(2);
        menu.addIconButton(
            function(ctx,x,y) {
                drawArrow(ctx,x,y,1);
            },
            function() {
                scrollToAct(Math.max(1,act-numActs));
            });
        for (i=0; i<numActs; i++) {
            range = getActRange(act+i);
            menu.addTextIconButton("LEVELS "+range[0]+"-"+range[1],
                (function(j){
                    return function() {
                        chooseLevelFromAct(act+j);
                    };
                })(i),
                (function(j){
                    return function(ctx,x,y) {
                        var s = tileSize/3*2;
                        var r = tileSize/6;
                        ctx.save();
                        ctx.translate(x,y);
                        ctx.beginPath();
                        ctx.moveTo(-s,0);
                        ctx.lineTo(-s,-r);
                        ctx.quadraticCurveTo(-s,-s,-r,-s);
                        ctx.lineTo(r,-s);
                        ctx.quadraticCurveTo(s,-s,s,-r);
                        ctx.lineTo(s,r);
                        ctx.quadraticCurveTo(s,s,r,s);
                        ctx.lineTo(-r,s);
                        ctx.quadraticCurveTo(-s,s,-s,r);
                        ctx.closePath();
                        var colors = getActColor(act+j);
                        ctx.fillStyle = colors.wallFillColor;
                        ctx.strokeStyle = colors.wallStrokeColor;
                        ctx.fill();
                        ctx.stroke();
                        ctx.restore();
                    };
                })(i));
        }
        menu.addIconButton(
            function(ctx,x,y) {
                drawArrow(ctx,x,y,-1);
            },
            function() {
                scrollToAct(act+numActs);
            });
        menu.addTextButton("BACK",
            function() {
                exitTo(preNewGameState);
            });
        menu.backButton = menu.buttons[menu.buttonCount-1];
        menu.enable();
    };
    return {
        init: function() {
            buildMenu(startAct);
            gameTitleState.init();
        },
        setStartAct: function(act) {
            startAct = act;
        },
        draw: function() {
            renderer.clearMapFrame();
            renderer.renderFunc(menu.draw,menu);
            gameTitleState.draw();
        },
        update: function() {
            gameTitleState.update();
        },
        getMenu: function() {
            return menu;
        },
    };
})();
var selectLevelState = (function() {
    var menu;
    var act = 1;
    var exitTo = function(state,fade) {
        gameTitleState.shutdown();
        menu.disable();
        switchState(state,fade);
    };
    var playLevel = function(i) {
        newGameState.setStartLevel(i);
        exitTo(newGameState, 60);
    };
    var buildMenu = function(act) {
        var range = getActRange(act);
        menu = new Menu("",2*tileSize,0,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
        var i;
        menu.addSpacer(2);
        if (range[0] < range[1]) {
            for (i=range[0]; i<=range[1]; i++) {
                menu.addTextIconButton("LEVEL "+i,
                    (function(j){
                        return function() {
                            playLevel(j);
                        };
                    })(i),
                    (function(j){
                        return function(ctx,x,y) {
                            var f = fruit.getFruitFromLevel(j);
                            if (f) {
                                atlas.drawFruitSprite(ctx,x,y,f.name);
                            }
                        };
                    })(i));
            }
        }
        menu.addSpacer(0.5);
        menu.addTextButton("BACK",
            function() {
                exitTo(selectActState);
            });
        menu.backButton = menu.buttons[menu.buttonCount-1];
        menu.enable();
    };
    return {
        init: function() {
            setFruitFromGameMode();
            buildMenu(act);
            gameTitleState.init();
        },
        setAct: function(a) {
            act = a;
        },
        draw: function() {
            renderer.clearMapFrame();
            renderer.renderFunc(menu.draw,menu);
            gameTitleState.draw();
        },
        update: function() {
            gameTitleState.update();
        },
        getMenu: function() {
            return menu;
        },
    };
})();
var aboutGameState = (function() {
    var exitTo = function(s,fade) {
        gameTitleState.shutdown();
        menu.disable();
        switchState(s,fade);
    };
    var menu = new Menu("",2*tileSize,0,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    menu.addSpacer(8);
    menu.addTextButton("BACK",
        function() {
            exitTo(preNewGameState);
        });
    menu.backButton = menu.buttons[menu.buttonCount-1];
    var desc;
    var numDescLines;
    var drawDesc = function(ctx){
        ctx.font = tileSize+"px ArcadeR";
        ctx.fillStyle = "#FFF";
        ctx.textBaseline = "top";
        ctx.textAlign = "center";
        var y = 12*tileSize;
        var i;
        for (i=0; i<numDescLines; i++) {
            ctx.fillText(desc[i],14*tileSize,y+i*2*tileSize);
        }
    };
    return {
        init: function() {
            menu.enable();
            gameTitleState.init();
        },
        draw: function() {
            renderer.clearMapFrame();
            renderer.renderFunc(menu.draw,menu);
            gameTitleState.draw();
            desc = getGameDescription();
            numDescLines = desc.length;
            renderer.renderFunc(drawDesc);
        },
        update: function() {
            gameTitleState.update();
        },
        getMenu: function() {
            return menu;
        },
    };
})();
var cutSceneMenuState = (function() {
    var exitTo = function(s,fade) {
        gameTitleState.shutdown();
        menu.disable();
        switchState(s,fade);
    };
    var exitToCutscene = function(s) {
        if (s) {
            gameTitleState.shutdown();
            menu.disable();
            playCutScene(s,cutSceneMenuState);
        }
    };
    var menu = new Menu("",2*tileSize,0,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    menu.addSpacer(2);
    menu.addTextButton("CUTSCENE 1",
        function() {
            exitToCutscene(cutscenes[gameMode][0]);
        });
    menu.addTextButton("CUTSCENE 2",
        function() {
            exitToCutscene(cutscenes[gameMode][1]);
        });
    menu.addTextButton("CUTSCENE 3",
        function() {
            exitToCutscene(cutscenes[gameMode][2]);
        });
    menu.addSpacer();
    menu.addTextButton("BACK",
        function() {
            exitTo(preNewGameState);
        });
    menu.backButton = menu.buttons[menu.buttonCount-1];
    return {
        init: function() {
            menu.enable();
            gameTitleState.init();
            level = 0;
        },
        draw: function() {
            renderer.clearMapFrame();
            renderer.renderFunc(menu.draw,menu);
            gameTitleState.draw();
        },
        update: function() {
            gameTitleState.update();
        },
        getMenu: function() {
            return menu;
        },
    };
})();
var scoreState = (function(){
    var exitTo = function(s) {
        switchState(s);
        menu.disable();
    };
    var menu = new Menu("", 2*tileSize,mapHeight-6*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    menu.addTextButton("BACK",
        function() {
            exitTo(homeState);
        });
    menu.backButton = menu.buttons[menu.buttonCount-1];
    var frame = 0;
    var bulbs = {};
    var numBulbs;
    (function(){
        var x = -1.5*tileSize;
        var y = -1*tileSize;
        var w = 18*tileSize;
        var h = 29*tileSize;
        var s = 3;
        var i=0;
        var x0 = x;
        var y0 = y;
        var addBulb = function(x,y) { bulbs[i++] = { x:x, y:y }; };
        for (; y0<y+h; y0+=s) { addBulb(x0,y0); }
        for (; x0<x+w; x0+=s) { addBulb(x0,y0); }
        for (; y0>y; y0-=s) { addBulb(x0,y0); }
        for (; x0>x; x0-=s) { addBulb(x0,y0); }
        numBulbs = i;
    })();
    var drawScoreBox = function(ctx) {
        ctx.fillStyle = "#555";
        var i,b,s=2;
        for (i=0; i<numBulbs; i++) {
            b = bulbs[i];
            ctx.fillRect(b.x, b.y, s, s);
        }
        ctx.fillStyle = "#FFF";
        for (i=0; i<63; i++) {
            b = bulbs[(i*4+Math.floor(frame/2))%numBulbs];
            ctx.fillRect(b.x, b.y, s, s);
        }
        ctx.font = tileSize+"px ArcadeR";
        ctx.textBaseline = "top";
        ctx.textAlign = "right";
        var scoreColor = "#AAA";
        var captionColor = "#444";
        var x,y;
        x = 9*tileSize;
        y = 0;
        ctx.fillStyle = "#FFF"; ctx.fillText("HIGH SCORES", x+4*tileSize,y);
        y += tileSize*4;
        var drawContrails = function(x,y) {
            ctx.lineWidth = 1.0;
            ctx.lineCap = "round";
            ctx.strokeStyle = "rgba(255,255,255,0.5)";
            ctx.save();
            ctx.translate(-2.5,0);
            var dy;
            for (dy=-4; dy<=4; dy+=2) {
                ctx.beginPath();
                ctx.moveTo(x+tileSize,y+dy);
                ctx.lineTo(x+tileSize*(Math.random()*0.5+1.5),y+dy);
                ctx.stroke();
            }
            ctx.restore();
        };
        ctx.fillStyle = scoreColor; ctx.fillText(highScores[0], x,y);
        atlas.drawPacmanSprite(ctx,x+2*tileSize,y+tileSize/2,DIR_LEFT,1);
        y += tileSize*2;
        ctx.fillStyle = scoreColor; ctx.fillText(highScores[1], x,y);
        drawContrails(x+2*tileSize,y+tileSize/2);
        atlas.drawPacmanSprite(ctx,x+2*tileSize,y+tileSize/2,DIR_LEFT,1);
        y += tileSize*3;
        ctx.fillStyle = scoreColor; ctx.fillText(highScores[2], x,y);
        atlas.drawMsPacmanSprite(ctx,x+2*tileSize,y+tileSize/2,DIR_LEFT,1);
        y += tileSize*2;
        ctx.fillStyle = scoreColor; ctx.fillText(highScores[3], x,y);
        drawContrails(x+2*tileSize,y+tileSize/2);
        atlas.drawMsPacmanSprite(ctx,x+2*tileSize,y+tileSize/2,DIR_LEFT,1);
        y += tileSize*3;
        ctx.fillStyle = scoreColor; ctx.fillText(highScores[6], x,y);
        atlas.drawOttoSprite(ctx,x+2*tileSize,y+tileSize/2,DIR_LEFT,0);
        y += tileSize*2;
        ctx.fillStyle = scoreColor; ctx.fillText(highScores[7], x,y);
        drawContrails(x+2*tileSize,y+tileSize/2);
        atlas.drawOttoSprite(ctx,x+2*tileSize,y+tileSize/2,DIR_LEFT,0);
        y += tileSize*3;
        ctx.fillStyle = scoreColor; ctx.fillText(highScores[4], x,y);
        atlas.drawCookiemanSprite(ctx,x+2*tileSize,y+tileSize/2,DIR_LEFT,1);
        y += tileSize*2;
        ctx.fillStyle = scoreColor; ctx.fillText(highScores[5], x,y);
        drawContrails(x+2*tileSize,y+tileSize/2);
        atlas.drawCookiemanSprite(ctx,x+2*tileSize,y+tileSize/2,DIR_LEFT,1);
    };
    var drawFood = function(ctx) {
        ctx.globalAlpha = 0.5;
        ctx.font = tileSize + "px sans-serif";
        ctx.textBaseline = "middle";
        ctx.textAlign = "left";
        var x = 20*tileSize;
        var y = 0;
        ctx.fillStyle = "#ffb8ae";
        ctx.fillRect(x-1,y-1.5,2,2);
        ctx.fillStyle = "#FFF";
        ctx.fillText("10",x+tileSize,y);
        y += 1.5*tileSize;
        ctx.fillStyle = "#ffb8ae";
        ctx.beginPath();
        ctx.arc(x,y-0.5,tileSize/2,0,Math.PI*2);
        ctx.fill();
        ctx.fillStyle = "#FFF";
        ctx.fillText("50",x+tileSize,y);
        y += 3*tileSize;
        atlas.drawGhostSprite(ctx,x,y,0,DIR_RIGHT,true);
        atlas.drawGhostPoints(ctx,x+2*tileSize,y,200);
        var alpha = ctx.globalAlpha;
        y += 2*tileSize;
        ctx.globalAlpha = alpha*0.5;
        atlas.drawGhostSprite(ctx,x,y,0,DIR_RIGHT,true);
        ctx.globalAlpha = alpha;
        atlas.drawGhostSprite(ctx,x+2*tileSize,y,0,DIR_RIGHT,true);
        atlas.drawGhostPoints(ctx,x+4*tileSize,y,400);
        y += 2*tileSize;
        ctx.globalAlpha = alpha*0.5;
        atlas.drawGhostSprite(ctx,x,y,0,DIR_RIGHT,true);
        atlas.drawGhostSprite(ctx,x+2*tileSize,y,0,DIR_RIGHT,true);
        ctx.globalAlpha = alpha;
        atlas.drawGhostSprite(ctx,x+4*tileSize,y,0,DIR_RIGHT,true);
        atlas.drawGhostPoints(ctx,x+6*tileSize,y,800);
        y += 2*tileSize;
        ctx.globalAlpha = alpha*0.5;
        atlas.drawGhostSprite(ctx,x,y,0,DIR_RIGHT,true);
        atlas.drawGhostSprite(ctx,x+2*tileSize,y,0,DIR_RIGHT,true);
        atlas.drawGhostSprite(ctx,x+4*tileSize,y,0,DIR_RIGHT,true);
        ctx.globalAlpha = alpha;
        atlas.drawGhostSprite(ctx,x+6*tileSize,y,0,DIR_RIGHT,true);
        atlas.drawGhostPoints(ctx,x+8*tileSize,y,1600);
        var mspac_fruits = [
            {name: 'cherry',     points: 100},
            {name: 'strawberry', points: 200},
            {name: 'orange',     points: 500},
            {name: 'pretzel',    points: 700},
            {name: 'apple',      points: 1000},
            {name: 'pear',       points: 2000},
            {name: 'banana',     points: 5000},
        ];
        var pac_fruits = [
            {name:'cherry',     points:100},
            {name:'strawberry', points:300},
            {name:'orange',     points:500},
            {name:'apple',      points:700},
            {name:'melon',      points:1000},
            {name:'galaxian',   points:2000},
            {name:'bell',       points:3000},
            {name:'key',        points:5000},
        ];
        var i,f;
        y += 3*tileSize;
        for (i=0; i<pac_fruits.length; i++) {
            f = pac_fruits[i];
            atlas.drawFruitSprite(ctx,x,y,f.name);
            atlas.drawPacFruitPoints(ctx,x+2*tileSize,y,f.points);
            y += 2*tileSize;
        }
        x += 6*tileSize;
        y = 13.5*tileSize;
        for (i=0; i<mspac_fruits.length; i++) {
            f = mspac_fruits[i];
            atlas.drawFruitSprite(ctx,x,y,f.name);
            atlas.drawMsPacFruitPoints(ctx,x+2*tileSize,y,f.points);
            y += 2*tileSize;
        }
        ctx.globalAlpha = 1;
    };
    return {
        init: function() {
            menu.enable();
        },
        draw: function() {
            renderer.clearMapFrame();
            renderer.renderFunc(drawScoreBox);
            renderer.renderFunc(drawFood);
            renderer.renderFunc(menu.draw,menu);
        },
        update: function() {
            menu.update();
            frame++;
        },
        getMenu: function() {
            return menu;
        },
    };
})();
var aboutState = (function(){
    var exitTo = function(s) {
        switchState(s);
        menu.disable();
    };
    var menu = new Menu("", 2*tileSize,mapHeight-11*tileSize,mapWidth-4*tileSize,3*tileSize,tileSize,tileSize+"px ArcadeR", "#EEE");
    menu.addTextButton("GO TO PROJECT PAGE",
        function() {
            window.open("https://github.com/shaunew/Pac-Man");
        });
    menu.addTextButton("BACK",
        function() {
            exitTo(homeState);
        });
    menu.backButton = menu.buttons[menu.buttonCount-1];
    var drawBody = function(ctx) {
        ctx.font = tileSize+"px ArcadeR";
        ctx.textBaseline = "top";
        ctx.textAlign = "left";
        var x,y;
        x = 2*tileSize;
        y = 0*tileSize;
        ctx.fillStyle = "#0FF";
        ctx.fillText("DEVELOPER", x,y);
        y += tileSize*2;
        ctx.fillStyle = "#777";
        ctx.fillText("SHAUN WILLIAMS", x,y);
        y += tileSize*4;
        ctx.fillStyle = "#0FF";
        ctx.fillText("REVERSE-ENGINEERS",x,y);
        y += tileSize*2;
        ctx.fillStyle = "#777";
        ctx.fillText("JAMEY PITTMAN",x,y);
        y += tileSize*2;
        ctx.fillText("BART GRANTHAM",x,y);
        y += tileSize*4;
        ctx.fillStyle = "#FF0";
        ctx.fillText("PAC-MAN",x,y);
        y += tileSize*2;
        ctx.fillStyle = "#777";
        ctx.fillText("NAMCO",x,y);
        y += tileSize*4;
        ctx.fillStyle = "#FF0";
        ctx.fillText("MS. PAC-MAN / CRAZY OTTO",x,y);
        y += tileSize*2;
        ctx.fillStyle = "#777";
        ctx.fillText("GENERAL COMPUTING",x,y);
    };
    return {
        init: function() {
            menu.enable();
            galagaStars.init();
        },
        draw: function() {
            renderer.clearMapFrame();
            renderer.beginMapClip();
            renderer.renderFunc(galagaStars.draw);
            renderer.renderFunc(drawBody);
            renderer.renderFunc(menu.draw,menu);
            renderer.endMapClip();
        },
        update: function() {
            galagaStars.update();
            menu.update();
        },
        getMenu: function() {
            return menu;
        },
    };
})();
var newGameState = (function() {
    var frames;
    var duration = 0;
    var startLevel = 1;
    return {
        init: function() {
            clearCheats();
            frames = 0;
            level = startLevel-1;
            extraLives = practiceMode ? Infinity : 3;
            setScore(0);
            setFruitFromGameMode();
            readyNewState.init();
        },
        setStartLevel: function(i) {
            startLevel = i;
        },
        draw: function() {
            if (!map)
                return;
            renderer.blitMap();
            renderer.drawScore();
            renderer.drawMessage("PLAYER ONE", "#0FF", 9, 14);
            renderer.drawReadyMessage();
        },
        update: function() {
            if (frames == duration*60) {
                extraLives--;
                state = readyNewState;
                renderer.drawMap();
            }
            else
                frames++;
        },
    };
})();
var readyState =  (function(){
    var frames;
    var duration = 4;
    return {
        init: function() {
            audio.startMusic.play();
            var i;
            for (i=0; i<5; i++)
                actors[i].reset();
            ghostCommander.reset();
            fruit.reset();
            energizer.reset();
            map.resetTimeEaten();
            frames = 0;
            vcr.init();
        },
        draw: function() {
            if (!map)
                return;
            renderer.blitMap();
            renderer.drawScore();
            renderer.drawActors();
            renderer.drawReadyMessage();
        },
        update: function() {
            if (frames == duration*60)
                switchState(playState);
            else
                frames++;
        },
    };
})();
var readyNewState = newChildObject(readyState, {
    init: function() {
        level++;
        if (gameMode == GAME_PACMAN) {
            map = mapPacman;
        }
        else if (gameMode == GAME_MSPACMAN || gameMode == GAME_OTTO) {
            setNextMsPacMap();
        }
        else if (gameMode == GAME_COOKIE) {
            setNextCookieMap();
        }
        map.resetCurrent();
        fruit.onNewLevel();
        renderer.drawMap();
        ghostReleaser.onNewLevel();
        elroyTimer.onNewLevel();
        readyState.init.call(this);
    },
});
var readyRestartState = newChildObject(readyState, {
    init: function() {
        extraLives--;
        ghostReleaser.onRestartLevel();
        elroyTimer.onRestartLevel();
        renderer.drawMap();
        readyState.init.call(this);
    },
});
var playState = {
    init: function() {
        if (practiceMode) {
            vcr.reset();
        }
    },
    draw: function() {
        renderer.setLevelFlash(false);
        renderer.blitMap();
        renderer.drawScore();
        renderer.beginMapClip();
        renderer.drawFruit();
        renderer.drawPaths();
        renderer.drawActors();
        renderer.drawTargets();
        renderer.endMapClip();
    },
    isPacmanCollide: function() {
        var i,g;
        for (i = 0; i<4; i++) {
            g = ghosts[i];
            if (g.tile.x == pacman.tile.x && g.tile.y == pacman.tile.y && g.mode == GHOST_OUTSIDE) {
                if (g.scared) {
                    energizer.addPoints();
                    g.onEaten();
                }
                else if (pacman.invincible)
                    continue;
                else
                    switchState(deadState);
                return true;
            }
        }
        return false;
    },
    update: function() {
        if (vcr.isSeeking()) {
            vcr.seek();
        }
        else {
            if (vcr.getMode() == VCR_RECORD) {
                vcr.record();
            }
            var i,j;
            var maxSteps = 2;
            var skip = false;
            if (energizer.showingPoints()) {
                for (j=0; j<maxSteps; j++)
                    for (i=0; i<4; i++)
                        if (ghosts[i].mode == GHOST_GOING_HOME || ghosts[i].mode == GHOST_ENTERING_HOME)
                            ghosts[i].update(j);
                energizer.updatePointsTimer();
                skip = true;
            }
            else {
                for (i=0; i<4; i++)
                    if (ghosts[i].mode == GHOST_EATEN) {
                        ghosts[i].mode = GHOST_GOING_HOME;
                        ghosts[i].targetting = 'door';
                    }
                    ghosts[0].playSounds();
            }
            if (!skip) {
                ghostReleaser.update();
                ghostCommander.update();
                elroyTimer.update();
                fruit.update();
                energizer.update();
                for (j=0; j<maxSteps; j++) {
                    pacman.update(j);
                    fruit.testCollide();
                    if (map.allDotsEaten()) {
                        switchState(finishState);
                        audio.extend.play();
                        break;
                    }
                    if (this.isPacmanCollide()) break;
                    for (i=0;i<4;i++) actors[i].update(j);
                    if (this.isPacmanCollide()) break;
                }
                for (i=0; i<5; i++)
                    actors[i].frames++;
            }
        }
    },
};
var scriptState = (function(){
    return {
        init: function() {
            this.frames = 0;
            this.triggerFrame = 0;
            var trigger = this.triggers[0];
            this.drawFunc = trigger ? trigger.draw : undefined;
            this.updateFunc = trigger ? trigger.update : undefined;
        },
        update: function() {
            var trigger = this.triggers[this.frames];
            if (trigger) {
                if (trigger.init) trigger.init();
                this.drawFunc = trigger.draw;
                this.updateFunc = trigger.update;
                this.triggerFrame = 0;
            }
            if (this.updateFunc)
                this.updateFunc(this.triggerFrame);
            this.frames++;
            this.triggerFrame++;
        },
        draw: function() {
            if (this.drawFunc)
                this.drawFunc(this.triggerFrame);
        },
    };
})();
var seekableScriptState = newChildObject(scriptState, {
    init: function() {
        scriptState.init.call(this);
        this.savedFrames = {};
        this.savedTriggerFrame = {};
        this.savedDrawFunc = {};
        this.savedUpdateFunc = {};
    },
    save: function(t) {
        this.savedFrames[t] = this.frames;
        this.savedTriggerFrame[t] = this.triggerFrame;
        this.savedDrawFunc[t] = this.drawFunc;
        this.savedUpdateFunc[t] = this.updateFunc;
    },
    load: function(t) {
        this.frames = this.savedFrames[t];
        this.triggerFrame = this.savedTriggerFrame[t];
        this.drawFunc = this.savedDrawFunc[t];
        this.updateFunc = this.savedUpdateFunc[t];
    },
    update: function() {
        if (vcr.isSeeking()) {
            vcr.seek();
        }
        else {
            if (vcr.getMode() == VCR_RECORD) {
                vcr.record();
            }
            scriptState.update.call(this);
        }
    },
    draw: function() {
        if (this.drawFunc) {
            scriptState.draw.call(this);
        }
    },
});
var deadState = (function() {
    var commonDraw = function() {
        renderer.blitMap();
        renderer.drawScore();
    };
    return newChildObject(seekableScriptState, {
        triggers: {
            0: {
                init: function() {
                    audio.die.play();
                },
                update: function() {
                    var i;
                    for (i=0; i<4; i++)
                        actors[i].frames++;
                },
                draw: function() {
                    commonDraw();
                    renderer.beginMapClip();
                    renderer.drawFruit();
                    renderer.drawActors();
                    renderer.endMapClip();
                }
            },
            60: {
                draw: function() {
                    commonDraw();
                    renderer.beginMapClip();
                    renderer.drawPlayer();
                    renderer.endMapClip();
                },
            },
            120: {
                draw: function(t) {
                    commonDraw();
                    renderer.beginMapClip();
                    renderer.drawDyingPlayer(t/75);
                    renderer.endMapClip();
                },
            },
            195: {
                draw: function() {
                    commonDraw();
                    renderer.beginMapClip();
                    renderer.drawDyingPlayer(1);
                    renderer.endMapClip();
                },
            },
            240: {
                draw: function() {
                    commonDraw();
                    renderer.beginMapClip();
                    renderer.drawDyingPlayer(1);
                    renderer.endMapClip();
                },
                init: function() {
                    switchState( extraLives == 0 ? overState : readyRestartState);
                }
            },
        },
    });
})();
var finishState = (function(){
    var commonDraw = function() {
        renderer.blitMap();
        renderer.drawScore();
        renderer.beginMapClip();
        renderer.drawPlayer();
        renderer.endMapClip();
    };
    var flashFloorAndDraw = function(on) {
        renderer.setLevelFlash(on);
        commonDraw();
    };
    return newChildObject(seekableScriptState, {
        triggers: {
            0:   { draw: function() {
                    renderer.setLevelFlash(false);
                    renderer.blitMap();
                    renderer.drawScore();
                    renderer.beginMapClip();
                    renderer.drawFruit();
                    renderer.drawActors();
                    renderer.drawTargets();
                    renderer.endMapClip();
            } },
            120:  { draw: function() { flashFloorAndDraw(true); } },
            132: { draw: function() { flashFloorAndDraw(false); } },
            144: { draw: function() { flashFloorAndDraw(true); } },
            156: { draw: function() { flashFloorAndDraw(false); } },
            168: { draw: function() { flashFloorAndDraw(true); } },
            180: { draw: function() { flashFloorAndDraw(false); } },
            192: { draw: function() { flashFloorAndDraw(true); } },
            204: { draw: function() { flashFloorAndDraw(false); } },
            216: {
                init: function() {
                    if (!triggerCutsceneAtEndLevel()) {
                        switchState(readyNewState,60);
                    }
                }
            },
        },
    });
})();
var overState = (function() {
    var frames;
    return {
        init: function() {
            frames = 0;
        },
        draw: function() {
            renderer.blitMap();
            renderer.drawScore();
            renderer.drawMessage("GAME  OVER", "#F00", 9, 20);
        },
        update: function() {
            if (frames == 120) {
                switchState(homeState,60);
            }
            else
                frames++;
        },
    };
})();
(function(){
    var KeyEventListener = function() {
        this.listeners = {};
    };
    KeyEventListener.prototype = {
        add: function(key, callback, isActive) {
            this.listeners[key] = this.listeners[key] || [];
            this.listeners[key].push({
                isActive: isActive,
                callback: callback,
            });
        },
        exec: function(key, e) {
            var keyListeners = this.listeners[key];
            if (!keyListeners) {
                return;
            }
            var i,l;
            var numListeners = keyListeners.length;
            for (i=0; i<numListeners; i++) {
                l = keyListeners[i];
                if (!l.isActive || l.isActive()) {
                    e.preventDefault();
                    if (l.callback()) {
                        break;
                    }
                }
            }
        },
    };
    var keyDownListeners = new KeyEventListener();
    var keyUpListeners = new KeyEventListener();
    var addKeyDown = function(key,callback,isActive) { keyDownListeners.add(key,callback,isActive); };
    var addKeyUp   = function(key,callback,isActive) { keyUpListeners.add(key,callback,isActive); };
    var keyStates = {};
    window.addEventListener("keydown", function(e) {
        var key = (e||window.event).keyCode;
        if (!keyStates[key]) {
            keyStates[key] = true;
            keyDownListeners.exec(key, e);
        }
    });
    window.addEventListener("keyup",function(e) {
        var key = (e||window.event).keyCode;
        keyStates[key] = false;
        keyUpListeners.exec(key, e);
    });
    var KEY_ENTER = 13;
    var KEY_ESC = 27;
    var KEY_LEFT = 37;
    var KEY_RIGHT = 39;
    var KEY_UP = 38;
    var KEY_DOWN = 40;
    var KEY_SHIFT = 16;
    var KEY_CTRL = 17;
    var KEY_ALT = 18;
    var KEY_SPACE = 32;
    var KEY_M = 77;
    var KEY_N = 78;
    var KEY_Q = 81;
    var KEY_W = 87;
    var KEY_E = 69;
    var KEY_R = 82;
    var KEY_T = 84;
    var KEY_A = 65;
    var KEY_S = 83;
    var KEY_D = 68;
    var KEY_F = 70;
    var KEY_G = 71;
    var KEY_I = 73;
    var KEY_O = 79;
    var KEY_P = 80;
    var KEY_1 = 49;
    var KEY_2 = 50;
    var KEY_END = 35;
    var menu;
    var isInMenu = function() {
        menu = (state.getMenu && state.getMenu());
        if (!menu && inGameMenu.isOpen()) {
            menu = inGameMenu.getMenu();
        }
        return menu;
    };
    addKeyDown(KEY_ESC,   function(){ menu.backButton ? menu.backButton.onclick():0; return true; }, isInMenu);
    addKeyDown(KEY_ENTER, function(){ menu.clickCurrentOption(); }, isInMenu);
    var isMenuKeysAllowed = function() {
        var menu = isInMenu();
        return menu && !menu.noArrowKeys;
    };
    addKeyDown(KEY_UP,    function(){ menu.selectPrevOption(); }, isMenuKeysAllowed);
    addKeyDown(KEY_DOWN,  function(){ menu.selectNextOption(); }, isMenuKeysAllowed);
    var isInGameMenuButtonClickable = function() {
        return hud.isValidState() && !inGameMenu.isOpen();
    };
    addKeyDown(KEY_ESC, function() { inGameMenu.getMenuButton().onclick(); return true; }, isInGameMenuButtonClickable);
    var isPlayState = function() { return state == learnState || state == newGameState || state == playState || state == readyNewState || state == readyRestartState; };
    addKeyDown(KEY_LEFT,  function() { pacman.setInputDir(DIR_LEFT); },  isPlayState);
    addKeyDown(KEY_RIGHT, function() { pacman.setInputDir(DIR_RIGHT); }, isPlayState);
    addKeyDown(KEY_UP,    function() { pacman.setInputDir(DIR_UP); },    isPlayState);
    addKeyDown(KEY_DOWN,  function() { pacman.setInputDir(DIR_DOWN); },  isPlayState);
    addKeyUp  (KEY_LEFT,  function() { pacman.clearInputDir(DIR_LEFT); },  isPlayState);
    addKeyUp  (KEY_RIGHT, function() { pacman.clearInputDir(DIR_RIGHT); }, isPlayState);
    addKeyUp  (KEY_UP,    function() { pacman.clearInputDir(DIR_UP); },    isPlayState);
    addKeyUp  (KEY_DOWN,  function() { pacman.clearInputDir(DIR_DOWN); },  isPlayState);
    var isPracticeMode = function() { return isPlayState() && practiceMode; };
    addKeyDown(KEY_1, function() { executive.setUpdatesPerSecond(30); }, isPracticeMode);
    addKeyDown(KEY_2,  function() { executive.setUpdatesPerSecond(15); }, isPracticeMode);
    addKeyUp  (KEY_1, function() { executive.setUpdatesPerSecond(60); }, isPracticeMode);
    addKeyUp  (KEY_2,  function() { executive.setUpdatesPerSecond(60); }, isPracticeMode);
    var canSeek = function() { return !isInMenu() && vcr.getMode() != VCR_NONE; };
    addKeyDown(KEY_SHIFT, function() { vcr.startSeeking(); },   canSeek);
    addKeyUp  (KEY_SHIFT, function() { vcr.startRecording(); }, canSeek);
    var isSeekState = function() { return vcr.isSeeking(); };
    addKeyDown(KEY_UP,   function() { vcr.nextSpeed(1); },  isSeekState);
    addKeyDown(KEY_DOWN, function() { vcr.nextSpeed(-1); }, isSeekState);
    var canSkip = function() {
        return isPracticeMode() &&
            (state == newGameState ||
            state == readyNewState ||
            state == readyRestartState ||
            state == playState ||
            state == deadState ||
            state == finishState ||
            state == overState);
    };
    addKeyDown(KEY_N, function() { switchState(readyNewState, 60); }, canSkip);
    addKeyDown(KEY_M, function() { switchState(finishState); }, function() { return state == playState; });
    addKeyDown(KEY_Q, function() { blinky.isDrawTarget = !blinky.isDrawTarget; }, isPracticeMode);
    addKeyDown(KEY_W, function() { pinky.isDrawTarget = !pinky.isDrawTarget; }, isPracticeMode);
    addKeyDown(KEY_E, function() { inky.isDrawTarget = !inky.isDrawTarget; }, isPracticeMode);
    addKeyDown(KEY_R, function() { clyde.isDrawTarget = !clyde.isDrawTarget; }, isPracticeMode);
    addKeyDown(KEY_T, function() { pacman.isDrawTarget = !pacman.isDrawTarget; }, isPracticeMode);
    addKeyDown(KEY_A, function() { blinky.isDrawPath = !blinky.isDrawPath; }, isPracticeMode);
    addKeyDown(KEY_S, function() { pinky.isDrawPath = !pinky.isDrawPath; }, isPracticeMode);
    addKeyDown(KEY_D, function() { inky.isDrawPath = !inky.isDrawPath; }, isPracticeMode);
    addKeyDown(KEY_F, function() { clyde.isDrawPath = !clyde.isDrawPath; }, isPracticeMode);
    addKeyDown(KEY_G, function() { pacman.isDrawPath = !pacman.isDrawPath; }, isPracticeMode);
    addKeyDown(KEY_I, function() { pacman.invincible = !pacman.invincible; }, isPracticeMode);
    addKeyDown(KEY_O, function() { turboMode = !turboMode; }, isPracticeMode);
    addKeyDown(KEY_P, function() { pacman.ai = !pacman.ai; }, isPracticeMode);
    addKeyDown(KEY_END, function() { executive.togglePause(); });
})();
var initSwipe = function() {
    var x = 0;
    var y = 0;
    var dx = 0;
    var dy = 0;
    var r = 4;
    var touchStart = function(event) {
        event.preventDefault();
        var fingerCount = event.touches.length;
        if (fingerCount == 1) {
            x = event.touches[0].pageX;
            y = event.touches[0].pageY;
        }
        else {
            touchCancel(event);
        }
    };
    var touchMove = function(event) {
        event.preventDefault();
        var fingerCount = event.touches.length;
        if (fingerCount == 1) {
            dx = event.touches[0].pageX - x;
            dy = event.touches[0].pageY - y;
            if (dx*dx+dy*dy >= r*r) {
                x += dx;
                y += dy;
                if (Math.abs(dx) >= Math.abs(dy)) {
                    pacman.setInputDir(dx>0 ? DIR_RIGHT : DIR_LEFT);
                }
                else {
                    pacman.setInputDir(dy>0 ? DIR_DOWN : DIR_UP);
                }
            }
        }
        else {
            touchCancel(event);
        }
    };
    var touchEnd = function(event) {
        event.preventDefault();
    };
    var touchCancel = function(event) {
        event.preventDefault();
        x=y=dx=dy=0;
    };
    var touchTap = function(event) {
        pacman.clearInputDir(undefined);
    };
    document.onclick = touchTap;
    document.ontouchstart = touchStart;
    document.ontouchend = touchEnd;
    document.ontouchmove = touchMove;
    document.ontouchcancel = touchCancel;
};
var playCutScene = function(cutScene, nextState) {
    map = undefined;
    renderer.drawMap(true);
    setTimeout(audio.coffeeBreakMusic.startLoop, 1200);
    cutScene.nextState = nextState;
    switchState(cutScene, 60);
};
var pacmanCutscene1 = newChildObject(scriptState, {
    init: function() {
        scriptState.init.call(this);
        pacman.setPos(232, 164);
        blinky.setPos(257, 164);
        blinky.setDir(DIR_LEFT);
        blinky.faceDirEnum = DIR_LEFT;
        pacman.setDir(DIR_LEFT);
        blinky.scared = false;
        blinky.mode = GHOST_OUTSIDE;
        backupCheats();
        clearCheats();
        energizer.reset();
        pacman.getNumSteps = function() {
            return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_PACMAN);
        };
        blinky.getNumSteps = function() {
            return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_ELROY2);
        };
        pacman.steer = blinky.steer = function(){};
    },
    triggers: {
        0: {
            update: function() {
                var j;
                for (j=0; j<2; j++) {
                    pacman.update(j);
                    blinky.update(j);
                }
                pacman.frames++;
                blinky.frames++;
            },
            draw: function() {
                renderer.blitMap();
                renderer.beginMapClip();
                renderer.drawPlayer();
                renderer.drawGhost(blinky);
                renderer.endMapClip();
            },
        },
        260: {
            init: function() {
                pacman.setPos(-193, 155);
                blinky.setPos(-8, 164);
                blinky.setDir(DIR_RIGHT);
                blinky.faceDirEnum = DIR_RIGHT;
                pacman.setDir(DIR_RIGHT);
                blinky.scared = true;
                pacman.getNumSteps = function() {
                    return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_PACMAN_FRIGHT);
                };
                blinky.getNumSteps = function() {
                    return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_GHOST_FRIGHT);
                };
            },
            update: function() {
                var j;
                for (j=0; j<2; j++) {
                    pacman.update(j);
                    blinky.update(j);
                }
                pacman.frames++;
                blinky.frames++;
            },
            draw: function() {
                renderer.blitMap();
                renderer.beginMapClip();
                renderer.drawGhost(blinky);
                renderer.renderFunc(function(ctx) {
                    var frame = Math.floor(pacman.steps/4) % 4;
                    if (frame == 3) {
                        frame = 1;
                    }
                    drawGiantPacmanSprite(ctx, pacman.pixel.x, pacman.pixel.y, pacman.dirEnum, frame);
                });
                renderer.endMapClip();
            },
        },
        640: {
            init: function() {
                delete pacman.getNumSteps;
                delete blinky.getNumSteps;
                delete pacman.steer;
                delete blinky.steer;
                restoreCheats();
                switchState(pacmanCutscene1.nextState, 60);
            },
        },
    },
});
var mspacmanCutscene1 = (function() {
    var pac = new Player();
    var mspac = new Player();
    var drawPlayer = function(ctx,player) {
        var frame = player.getAnimFrame();
        var func;
        if (player == pac) {
            func = gameMode == GAME_MSPACMAN ? atlas.drawPacmanSprite : atlas.drawOttoSprite;
        }
        else if (player == mspac) {
            func = gameMode == GAME_MSPACMAN ? atlas.drawMsPacmanSprite : atlas.drawMsOttoSprite;
        }
        func(ctx, player.pixel.x, player.pixel.y, player.dirEnum, frame);
    };
    var draw = function() {
        renderer.blitMap();
        renderer.beginMapClip();
        renderer.renderFunc(function(ctx) {
            drawPlayer(ctx,pac);
            drawPlayer(ctx,mspac);
        });
        renderer.drawGhost(inky);
        renderer.drawGhost(pinky);
        renderer.endMapClip();
    };
    var update = function() {
        var j;
        for (j=0; j<2; j++) {
            pac.update(j);
            mspac.update(j);
            inky.update(j);
            pinky.update(j);
        }
        pac.frames++;
        mspac.frames++;
        inky.frames++;
        pinky.frames++;
    };
    var exit = function() {
        delete inky.getNumSteps;
        delete pinky.getNumSteps;
        delete inky.steer;
        delete pinky.steer;
        delete inky.getAnimFrame;
        delete pinky.getAnimFrame;
        restoreCheats();
        switchState(mspacmanCutscene1.nextState, 60);
    };
    return newChildObject(scriptState, {
        init: function() {
            scriptState.init.call(this);
            mspac.frames = 20;
            pac.frames = 12;
            pac.setPos(-10, 99);
            pac.setDir(DIR_RIGHT);
            mspac.setPos(232, 180);
            mspac.setDir(DIR_LEFT);
            inky.frames = 0;
            inky.mode = GHOST_OUTSIDE;
            inky.scared = false;
            inky.setPos(pac.pixel.x-42, 99);
            inky.setDir(DIR_RIGHT);
            inky.faceDirEnum = DIR_RIGHT;
            pinky.frames = 3;
            pinky.mode = GHOST_OUTSIDE;
            pinky.scared = false;
            pinky.setPos(mspac.pixel.x+49, 180);
            pinky.setDir(DIR_LEFT);
            pinky.faceDirEnum = DIR_LEFT;
            backupCheats();
            clearCheats();
            energizer.reset();
            pac.getStepFrame = function() { return Math.floor(this.frames/4)%4; };
            mspac.getStepFrame = function() { return Math.floor(this.frames/4)%4; };
            inky.getAnimFrame = function() { return Math.floor(this.frames/8)%2; };
            pinky.getAnimFrame = function() { return Math.floor(this.frames/8)%2; };
            pac.getNumSteps = function() { return 1; };
            mspac.getNumSteps = function() { return 1; };
            inky.getNumSteps = function() { return 1; };
            pinky.getNumSteps = function() { return 1; };
            pac.steer = function(){};
            mspac.steer = function(){};
            inky.steer = function(){};
            pinky.steer = function(){};
        },
        triggers: {
            0: {
                update: function() {
                    update();
                    if (inky.pixel.x == 105) {
                        inky.getNumSteps = function() {
                            return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_ELROY2);
                        };
                        pinky.getNumSteps = function() {
                            return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_ELROY2);
                        };
                    }
                },
                draw: draw,
            },
            300: (function(){
                var inkyBounceX =  [ 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
                var inkyBounceY =  [-1, 0,-1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0,-1, 0,-1, 0, 0, 0, 0, 0, 1, 0, 1];
                var pinkyBounceX = [ 0, 0, 0, 0,-1, 0,-1, 0, 0,-1, 0,-1, 0,-1, 0, 0,-1, 0,-1, 0,-1, 0, 0,-1, 0,-1, 0,-1, 0, 0];
                var pinkyBounceY = [ 0, 0, 0,-1, 0,-1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0,-1, 0,-1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0];
                var inkyBounceFrame = 0;
                var pinkyBounceFrame = 0;
                var inkyBounceFrameLen = inkyBounceX.length;
                var pinkyBounceFrameLen = pinkyBounceX.length;
                var rampX = [0, 1, 1, 1, 1, 0, 0];
                var rampY = [0, 0,-1,-1,-1, 0, 0];
                var rampFrame = 0;
                var rampFrameLen = rampX.length;
                var climbFrame = 0;
                var meetFrame = 0;
                var ghostMode;
                var GHOST_RUN = 0;
                var GHOST_BUMP = 1;
                var playerMode;
                var PLAYER_RUN = 0;
                var PLAYER_RAMP = 1;
                var PLAYER_CLIMB = 2;
                var PLAYER_MEET = 3;
                return {
                    init: function() {
                        inkyBounceFrame = pinkyBounceFrame = rampFrame = climbFrame = meetFrame = 0;
                        ghostMode = GHOST_RUN;
                        playerMode = PLAYER_RUN;
                        mspac.setPos(-8,143);
                        mspac.setDir(DIR_RIGHT);
                        pinky.setPos(-81,143);
                        pinky.faceDirEnum = DIR_RIGHT;
                        pinky.setDir(DIR_RIGHT);
                        pac.setPos(223+8+3,142);
                        pac.setDir(DIR_LEFT);
                        inky.setPos(302,143);
                        inky.faceDirEnum = DIR_LEFT;
                        inky.setDir(DIR_LEFT);
                        inky.getNumSteps = pinky.getNumSteps = function() {
                            return "11211212"[this.frames%8];
                        };
                    },
                    update: function() {
                        var j;
                        if (playerMode == PLAYER_RUN) {
                            for (j=0; j<2; j++) {
                                pac.update(j);
                                mspac.update(j);
                            }
                            if (mspac.pixel.x == 102) {
                                playerMode++;
                            }
                        }
                        else if (playerMode == PLAYER_RAMP) {
                            pac.pixel.x -= rampX[rampFrame];
                            pac.pixel.y += rampY[rampFrame];
                            pac.commitPos();
                            mspac.pixel.x += rampX[rampFrame];
                            mspac.pixel.y += rampY[rampFrame];
                            mspac.commitPos();
                            rampFrame++;
                            if (rampFrame == rampFrameLen) {
                                playerMode++;
                            }
                        }
                        else if (playerMode == PLAYER_CLIMB) {
                            if (climbFrame == 0) {
                                mspac.pixel.y -= 2;
                                mspac.commitPos();
                                mspac.setDir(DIR_UP);
                                pac.pixel.x -= 1;
                                pac.commitPos();
                                pac.setDir(DIR_UP);
                            }
                            else {
                                for (j=0; j<2; j++) {
                                    pac.update(j);
                                    mspac.update(j);
                                }
                            }
                            climbFrame++;
                            if (mspac.pixel.y == 91) {
                                playerMode++;
                            }
                        }
                        else if (playerMode == PLAYER_MEET) {
                            if (meetFrame == 0) {
                                mspac.pixel.y++;
                                mspac.setDir(DIR_RIGHT);
                                mspac.commitPos();
                                pac.pixel.y--;
                                pac.pixel.x++;
                                pac.setDir(DIR_LEFT);
                                pac.commitPos();
                            }
                            if (meetFrame > 18) {
                                pac.frames--;
                                mspac.frames--;
                            }
                            if (meetFrame == 78) {
                                exit();
                            }
                            meetFrame++;
                        }
                        pac.frames++;
                        mspac.frames++;
                        if (ghostMode == GHOST_RUN) {
                            for (j=0; j<2; j++) {
                                inky.update(j);
                                pinky.update(j);
                            }
                            inky.pixel.x = Math.max(120, inky.pixel.x);
                            inky.commitPos();
                            pinky.pixel.x = Math.min(105, pinky.pixel.x);
                            pinky.commitPos();
                            if (pinky.pixel.x == 105) {
                                ghostMode++;
                            }
                        }
                        else if (ghostMode == GHOST_BUMP) {
                            if (inkyBounceFrame < inkyBounceFrameLen) {
                                inky.pixel.x += inkyBounceX[inkyBounceFrame];
                                inky.pixel.y += inkyBounceY[inkyBounceFrame];
                            }
                            if (pinkyBounceFrame < pinkyBounceFrameLen) {
                                pinky.pixel.x += pinkyBounceX[pinkyBounceFrame];
                                pinky.pixel.y += pinkyBounceY[pinkyBounceFrame];
                            }
                            inkyBounceFrame++;
                            pinkyBounceFrame++;
                        }
                        inky.frames++;
                        pinky.frames++;
                    },
                    draw: function() {
                        renderer.blitMap();
                        renderer.beginMapClip();
                        renderer.renderFunc(function(ctx) {
                            drawPlayer(ctx,pac);
                            drawPlayer(ctx,mspac);
                        });
                        if (inkyBounceFrame < inkyBounceFrameLen) {
                            renderer.drawGhost(inky);
                        }
                        if (pinkyBounceFrame < pinkyBounceFrameLen) {
                            renderer.drawGhost(pinky);
                        }
                        if (playerMode == PLAYER_MEET) {
                            renderer.renderFunc(function(ctx) {
                                drawHeartSprite(ctx, 112, 73);
                            });
                        }
                        renderer.endMapClip();
                    },
                };
            })(),
        },
    });
})();
var mspacmanCutscene2 = (function() {
    var pac = new Player();
    var mspac = new Player();
    var drawPlayer = function(ctx,player) {
        var frame = player.getAnimFrame();
        var func;
        if (player == pac) {
            func = gameMode == GAME_MSPACMAN ? atlas.drawPacmanSprite : atlas.drawOttoSprite;
        }
        else if (player == mspac) {
            func = gameMode == GAME_MSPACMAN ? atlas.drawMsPacmanSprite : atlas.drawMsOttoSprite;
        }
        func(ctx, player.pixel.x, player.pixel.y, player.dirEnum, frame);
    };
    var draw = function() {
        renderer.blitMap();
        renderer.beginMapClip();
        renderer.renderFunc(function(ctx) {
            drawPlayer(ctx,pac);
            drawPlayer(ctx,mspac);
        });
        renderer.endMapClip();
    };
    var update = function() {
        var j;
        for (j=0; j<7; j++) {
            pac.update(j);
            mspac.update(j);
        }
        pac.frames++;
        mspac.frames++;
    };
    var exit = function() {
        restoreCheats();
        switchState(mspacmanCutscene2.nextState, 60);
    };
    var getChaseSteps = function() { return 3; };
    var getFleeSteps = function() { return "32"[this.frames%2]; };
    var getDartSteps = function() { return 7; };
    return newChildObject(scriptState, {
        init: function() {
            scriptState.init.call(this);
            mspac.frames = 20;
            pac.frames = 12;
            pac.getStepFrame = function() { return Math.floor(this.frames/4)%4; };
            mspac.getStepFrame = function() { return Math.floor(this.frames/4)%4; };
            pac.steer = function(){};
            mspac.steer = function(){};
            backupCheats();
            clearCheats();
        },
        triggers: {
            0: {
                draw: function() {
                    renderer.blitMap();
                },
            },
            160: {
                init: function() {
                    pac.setPos(-8, 67);
                    pac.setDir(DIR_RIGHT);
                    mspac.setPos(-106, 68);
                    mspac.setDir(DIR_RIGHT);
                    pac.getNumSteps = getFleeSteps;
                    mspac.getNumSteps = getChaseSteps;
                },
                update: update,
                draw: draw,
            },
            410: {
                init: function() {
                    pac.setPos(329, 163);
                    pac.setDir(DIR_LEFT);
                    mspac.setPos(223+8, 164);
                    mspac.setDir(DIR_LEFT);
                    pac.getNumSteps = getChaseSteps;
                    mspac.getNumSteps = getFleeSteps;
                },
                update: update,
                draw: draw,
            },
            670: {
                init: function() {
                    pac.setPos(-8,142);
                    pac.setDir(DIR_RIGHT);
                    mspac.setPos(-106, 143);
                    mspac.setDir(DIR_RIGHT);
                    pac.getNumSteps = getFleeSteps;
                    mspac.getNumSteps = getChaseSteps;
                },
                update: update,
                draw: draw,
            },
            930: {
                init: function() {
                    pac.setPos(233+148,99);
                    pac.setDir(DIR_LEFT);
                    mspac.setPos(233,100);
                    mspac.setDir(DIR_LEFT);
                    pac.getNumSteps = getDartSteps;
                    mspac.getNumSteps = getDartSteps;
                },
                update: function() {
                    if (pac.pixel.x <= 17 && pac.dirEnum == DIR_LEFT) {
                        pac.setPos(-2,195);
                        pac.setDir(DIR_RIGHT);
                        mspac.setPos(-2-148,196);
                        mspac.setDir(DIR_RIGHT);
                    }
                    update();
                },
                draw: draw,
            },
            1140: {
                init: exit,
            },
        },
    });
})();
var cookieCutscene1 = newChildObject(scriptState, {
    init: function() {
        scriptState.init.call(this);
        pacman.setPos(232, 164);
        blinky.setPos(257, 164);
        blinky.setDir(DIR_LEFT);
        blinky.faceDirEnum = DIR_LEFT;
        pacman.setDir(DIR_LEFT);
        blinky.scared = false;
        blinky.mode = GHOST_OUTSIDE;
        backupCheats();
        clearCheats();
        energizer.reset();
        pacman.getNumSteps = function() {
            return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_PACMAN);
        };
        blinky.getNumSteps = function() {
            return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_ELROY2);
        };
        pacman.steer = blinky.steer = function(){};
    },
    triggers: {
        0: {
            update: function() {
                var j;
                for (j=0; j<2; j++) {
                    pacman.update(j);
                    blinky.update(j);
                }
                pacman.frames++;
                blinky.frames++;
            },
            draw: function() {
                renderer.blitMap();
                renderer.beginMapClip();
                renderer.drawPlayer();
                renderer.drawGhost(blinky);
                renderer.endMapClip();
            },
        },
        260: {
            init: function() {
                pacman.setPos(-193, 164);
                blinky.setPos(-8, 155);
                blinky.setDir(DIR_RIGHT);
                blinky.faceDirEnum = DIR_RIGHT;
                pacman.setDir(DIR_RIGHT);
                blinky.scared = true;
                pacman.getNumSteps = function() {
                    return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_PACMAN_FRIGHT);
                };
                blinky.getNumSteps = function() {
                    return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_GHOST_FRIGHT);
                };
            },
            update: function() {
                var j;
                for (j=0; j<2; j++) {
                    pacman.update(j);
                    blinky.update(j);
                }
                pacman.frames++;
                blinky.frames++;
            },
            draw: function() {
                renderer.blitMap();
                renderer.beginMapClip();
                renderer.drawPlayer();
                renderer.renderFunc(function(ctx) {
                    var y = blinky.getBounceY(blinky.pixel.x, blinky.pixel.y, DIR_RIGHT);
                    var x = blinky.pixel.x;
                    ctx.save();
                    ctx.translate(x,y);
                    var s = 16/6;
                    ctx.scale(s,s);
                    drawCookie(ctx,0,0);
                    ctx.restore();
                });
                renderer.endMapClip();
            },
        },
        640: {
            init: function() {
                delete pacman.getNumSteps;
                delete blinky.getNumSteps;
                delete pacman.steer;
                delete blinky.steer;
                restoreCheats();
                switchState(cookieCutscene1.nextState, 60);
            },
        },
    },
});
var cookieCutscene2 = (function() {
    /*
    NOTE:
    This is a copy-paste of mspacmanCutscene1.
    pac is replaced with a scared ghost (bouncing cookie)
    mspac is replaced with Cookie-Man
    */
    var pac = new Ghost();
    pac.scared = true;
    pac.mode = GHOST_OUTSIDE;
    var mspac = new Player();
    var drawPlayer = function(ctx,player) {
        var frame = player.getAnimFrame();
        var func;
        if (player == pac) {
            var y = player.getBounceY(player.pixel.x, player.pixel.y, player.dirEnum);
            atlas.drawMuppetSprite(ctx, player.pixel.x, y, 0, player.dirEnum, true, false);
        }
        else if (player == mspac) {
            drawCookiemanSprite(ctx, player.pixel.x, player.pixel.y, player.dirEnum, frame, true);
        }
    };
    var draw = function() {
        renderer.blitMap();
        renderer.beginMapClip();
        renderer.renderFunc(function(ctx) {
            drawPlayer(ctx,pac);
            drawPlayer(ctx,mspac);
        });
        renderer.drawGhost(inky);
        renderer.drawGhost(pinky);
        renderer.endMapClip();
    };
    var update = function() {
        var j;
        for (j=0; j<2; j++) {
            pac.update(j);
            mspac.update(j);
            inky.update(j);
            pinky.update(j);
        }
        pac.frames++;
        mspac.frames++;
        inky.frames++;
        pinky.frames++;
    };
    var exit = function() {
        delete inky.getNumSteps;
        delete pinky.getNumSteps;
        delete inky.steer;
        delete pinky.steer;
        delete inky.getAnimFrame;
        delete pinky.getAnimFrame;
        restoreCheats();
        switchState(cookieCutscene2.nextState, 60);
    };
    return newChildObject(scriptState, {
        init: function() {
            scriptState.init.call(this);
            mspac.frames = 14;
            pac.frames = 12;
            pac.setPos(-10, 99);
            pac.setDir(DIR_RIGHT);
            mspac.setPos(232, 180);
            mspac.setDir(DIR_LEFT);
            inky.frames = 0;
            inky.mode = GHOST_OUTSIDE;
            inky.scared = false;
            inky.setPos(pac.pixel.x-42, 99);
            inky.setDir(DIR_RIGHT);
            inky.faceDirEnum = DIR_RIGHT;
            pinky.frames = 3;
            pinky.mode = GHOST_OUTSIDE;
            pinky.scared = false;
            pinky.setPos(mspac.pixel.x+49, 180);
            pinky.setDir(DIR_LEFT);
            pinky.faceDirEnum = DIR_LEFT;
            backupCheats();
            clearCheats();
            energizer.reset();
            pac.getStepFrame = function() { return Math.floor(this.frames/4)%4; };
            mspac.getStepFrame = function() { return Math.floor(this.frames/4)%4; };
            inky.getAnimFrame = function() { return Math.floor(this.frames/8)%2; };
            pinky.getAnimFrame = function() { return Math.floor(this.frames/8)%2; };
            pac.getNumSteps = function() { return 1; };
            mspac.getNumSteps = function() { return 1; };
            inky.getNumSteps = function() { return 1; };
            pinky.getNumSteps = function() { return 1; };
            pac.steer = function(){};
            mspac.steer = function(){};
            inky.steer = function(){};
            pinky.steer = function(){};
        },
        triggers: {
            0: {
                update: function() {
                    update();
                    if (inky.pixel.x == 105) {
                        inky.getNumSteps = function() {
                            return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_ELROY2);
                        };
                        pinky.getNumSteps = function() {
                            return Actor.prototype.getStepSizeFromTable.call(this, 5, STEP_ELROY2);
                        };
                    }
                },
                draw: draw,
            },
            300: (function(){
                var inkyBounceX =  [ 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0];
                var inkyBounceY =  [-1, 0,-1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0,-1, 0,-1, 0, 0, 0, 0, 0, 1, 0, 1];
                var pinkyBounceX = [ 0, 0, 0, 0,-1, 0,-1, 0, 0,-1, 0,-1, 0,-1, 0, 0,-1, 0,-1, 0,-1, 0, 0,-1, 0,-1, 0,-1, 0, 0];
                var pinkyBounceY = [ 0, 0, 0,-1, 0,-1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0,-1, 0,-1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0];
                var inkyBounceFrame = 0;
                var pinkyBounceFrame = 0;
                var inkyBounceFrameLen = inkyBounceX.length;
                var pinkyBounceFrameLen = pinkyBounceX.length;
                var rampX = [0, 1, 1, 1, 1, 0, 0, 1, 1, 1, 1, 1, 1];
                var rampY = [0, 0,-1,-1,-1, 0, 0, 0, 0, 0, 0, 0, 0];
                var rampFrame = 0;
                var rampFrameLen = rampX.length;
                var climbFrame = 0;
                var meetFrame = 0;
                var ghostMode;
                var GHOST_RUN = 0;
                var GHOST_BUMP = 1;
                var playerMode;
                var PLAYER_RUN = 0;
                var PLAYER_RAMP = 1;
                var PLAYER_CLIMB = 2;
                var PLAYER_MEET = 3;
                return {
                    init: function() {
                        inkyBounceFrame = pinkyBounceFrame = rampFrame = climbFrame = meetFrame = 0;
                        ghostMode = GHOST_RUN;
                        playerMode = PLAYER_RUN;
                        mspac.setPos(-8,143);
                        mspac.setDir(DIR_RIGHT);
                        pinky.setPos(-81,143);
                        pinky.faceDirEnum = DIR_RIGHT;
                        pinky.setDir(DIR_RIGHT);
                        pac.setPos(223+8+3,142);
                        pac.setDir(DIR_LEFT);
                        inky.setPos(302,143);
                        inky.faceDirEnum = DIR_LEFT;
                        inky.setDir(DIR_LEFT);
                        inky.getNumSteps = pinky.getNumSteps = function() {
                            return "11211212"[this.frames%8];
                        };
                    },
                    update: function() {
                        var j;
                        if (playerMode == PLAYER_RUN) {
                            for (j=0; j<2; j++) {
                                pac.update(j);
                                mspac.update(j);
                            }
                            if (mspac.pixel.x == 102) {
                                playerMode++;
                            }
                        }
                        else if (playerMode == PLAYER_RAMP) {
                            pac.pixel.x -= rampX[rampFrame];
                            pac.pixel.y += rampY[rampFrame];
                            pac.commitPos();
                            mspac.pixel.x += rampX[rampFrame];
                            mspac.pixel.y += rampY[rampFrame];
                            mspac.commitPos();
                            rampFrame++;
                            if (rampFrame == rampFrameLen) {
                                playerMode++;
                            }
                        }
                        else if (playerMode == PLAYER_CLIMB) {
                            if (climbFrame == 0) {
                                mspac.pixel.y -= 2;
                                mspac.commitPos();
                                mspac.setDir(DIR_UP);
                            }
                            else {
                                for (j=0; j<2; j++) {
                                    mspac.update(j);
                                }
                            }
                            climbFrame++;
                            if (mspac.pixel.y == 91) {
                                playerMode++;
                            }
                        }
                        else if (playerMode == PLAYER_MEET) {
                            if (meetFrame == 0) {
                                mspac.pixel.y++;
                                mspac.setDir(DIR_RIGHT);
                                mspac.commitPos();
                            }
                            if (meetFrame > 18) {
                                mspac.frames--;
                            }
                            if (meetFrame == 78) {
                                exit();
                            }
                            meetFrame++;
                        }
                        pac.frames++;
                        mspac.frames++;
                        if (ghostMode == GHOST_RUN) {
                            for (j=0; j<2; j++) {
                                inky.update(j);
                                pinky.update(j);
                            }
                            inky.pixel.x = Math.max(120, inky.pixel.x);
                            inky.commitPos();
                            pinky.pixel.x = Math.min(105, pinky.pixel.x);
                            pinky.commitPos();
                            if (pinky.pixel.x == 105) {
                                ghostMode++;
                            }
                        }
                        else if (ghostMode == GHOST_BUMP) {
                            if (inkyBounceFrame < inkyBounceFrameLen) {
                                inky.pixel.x += inkyBounceX[inkyBounceFrame];
                                inky.pixel.y += inkyBounceY[inkyBounceFrame];
                            }
                            if (pinkyBounceFrame < pinkyBounceFrameLen) {
                                pinky.pixel.x += pinkyBounceX[pinkyBounceFrame];
                                pinky.pixel.y += pinkyBounceY[pinkyBounceFrame];
                            }
                            inkyBounceFrame++;
                            pinkyBounceFrame++;
                        }
                        inky.frames++;
                        pinky.frames++;
                    },
                    draw: function() {
                        renderer.blitMap();
                        renderer.beginMapClip();
                        renderer.renderFunc(function(ctx) {
                            if (playerMode <= PLAYER_RAMP) {
                                drawPlayer(ctx,pac);
                            }
                            drawPlayer(ctx,mspac);
                        });
                        if (inkyBounceFrame < inkyBounceFrameLen) {
                            renderer.drawGhost(inky);
                        }
                        if (pinkyBounceFrame < pinkyBounceFrameLen) {
                            renderer.drawGhost(pinky);
                        }
                        if (playerMode == PLAYER_MEET) {
                            renderer.renderFunc(function(ctx) {
                                drawHeartSprite(ctx, 112, 73);
                            });
                        }
                        renderer.endMapClip();
                    },
                };
            })(),
        },
    });
})();
var cutscenes = [
    [pacmanCutscene1],
    [mspacmanCutscene1, mspacmanCutscene2],
    [cookieCutscene1, cookieCutscene2],
    [mspacmanCutscene1, mspacmanCutscene2],
];
var isInCutScene = function() {
    var scenes = cutscenes[gameMode];
    var i,len = scenes.length;
    for (i=0; i<len; i++) {
        if (state == scenes[i]) {
            return true;
        }
    }
    return false;
};
var triggerCutsceneAtEndLevel = function() {
    if (gameMode == GAME_PACMAN) {
        if (level == 2) {
            playCutScene(pacmanCutscene1, readyNewState);
            return true;
        }
        /*
        else if (level == 5) {
            playCutScene(pacmanCutscene2, readyNewState);
            return true;
        }
        else if (level >= 9 && (level-9)%4 == 0) {
            playCutScene(pacmanCutscene3, readyNewState);
            return true;
        }
        */
    }
    else if (gameMode == GAME_MSPACMAN || gameMode == GAME_OTTO) {
        if (level == 2) {
            playCutScene(mspacmanCutscene1, readyNewState);
            return true;
        }
        else if (level == 5) {
            playCutScene(mspacmanCutscene2, readyNewState);
            return true;
        }
    }
    else if (gameMode == GAME_COOKIE) {
        if (level == 2) {
            playCutScene(cookieCutscene1, readyNewState);
            return true;
        }
        else if (level == 5) {
            playCutScene(cookieCutscene2, readyNewState);
            return true;
        }
    }
    return false;
};
var map;
blinky.startDirEnum = DIR_LEFT;
blinky.startPixel = {
    x: 14*tileSize-1,
    y: 14*tileSize+midTile.y
};
blinky.cornerTile = {
    x: 28-1-2,
    y: 0
};
blinky.startMode = GHOST_OUTSIDE;
blinky.arriveHomeMode = GHOST_LEAVING_HOME;
pinky.startDirEnum = DIR_DOWN;
pinky.startPixel = {
    x: 14*tileSize-1,
    y: 17*tileSize+midTile.y,
};
pinky.cornerTile = {
    x: 2,
    y: 0
};
pinky.startMode = GHOST_PACING_HOME;
pinky.arriveHomeMode = GHOST_PACING_HOME;
inky.startDirEnum = DIR_UP;
inky.startPixel = {
    x: 12*tileSize-1,
    y: 17*tileSize + midTile.y,
};
inky.cornerTile = {
    x: 28-1,
    y: 36 - 2,
};
inky.startMode = GHOST_PACING_HOME;
inky.arriveHomeMode = GHOST_PACING_HOME;
clyde.startDirEnum = DIR_UP;
clyde.startPixel = {
    x: 16*tileSize-1,
    y: 17*tileSize + midTile.y,
};
clyde.cornerTile = {
    x: 0,
    y: 36-2,
};
clyde.startMode = GHOST_PACING_HOME;
clyde.arriveHomeMode = GHOST_PACING_HOME;
pacman.startDirEnum = DIR_LEFT;
pacman.startPixel = {
    x: 14*tileSize-1,
    y: 26*tileSize + midTile.y,
};
var mapLearn = new Map(28, 36, (
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "__||||||||||||||||||||||||__" +
    "__|                      |__" +
    "__| ||||| |||||||| ||||| |__" +
    "__| ||||| |||||||| ||||| |__" +
    "__| ||    ||    ||    || |__" +
    "__| || || || || || || || |__" +
    "||| || || || || || || || |||" +
    "       ||    ||    ||       " +
    "||| ||||| |||||||| ||||| |||" +
    "__| ||||| |||||||| ||||| |__" +
    "__|    ||          ||    |__" +
    "__| || || |||||||| || || |__" +
    "__| || || |||||||| || || |__" +
    "__| ||    ||    ||    || |__" +
    "__| || || || || || || || |__" +
    "||| || || || || || || || |||" +
    "       ||    ||    ||       " +
    "||| |||||||| || |||||||| |||" +
    "__| |||||||| || |||||||| |__" +
    "__|                      |__" +
    "__||||||||||||||||||||||||__" +
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "____________________________"));
mapLearn.name = "Pac-Man";
mapLearn.wallStrokeColor = "#47b897";
mapLearn.wallFillColor = "#000";
mapLearn.pelletColor = "#ffb8ae";
mapLearn.shouldDrawMapOnly = true;
var mapPacman = new Map(28, 36, (
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "||||||||||||||||||||||||||||" +
    "|............||............|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|o||||.|||||.||.|||||.||||o|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|..........................|" +
    "|.||||.||.||||||||.||.||||.|" +
    "|.||||.||.||||||||.||.||||.|" +
    "|......||....||....||......|" +
    "||||||.||||| || |||||.||||||" +
    "_____|.||||| || |||||.|_____" +
    "_____|.||          ||.|_____" +
    "_____|.|| |||--||| ||.|_____" +
    "||||||.|| |______| ||.||||||" +
    "      .   |______|   .      " +
    "||||||.|| |______| ||.||||||" +
    "_____|.|| |||||||| ||.|_____" +
    "_____|.||          ||.|_____" +
    "_____|.|| |||||||| ||.|_____" +
    "||||||.|| |||||||| ||.||||||" +
    "|............||............|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|o..||.......  .......||..o|" +
    "|||.||.||.||||||||.||.||.|||" +
    "|||.||.||.||||||||.||.||.|||" +
    "|......||....||....||......|" +
    "|.||||||||||.||.||||||||||.|" +
    "|.||||||||||.||.||||||||||.|" +
    "|..........................|" +
    "||||||||||||||||||||||||||||" +
    "____________________________" +
    "____________________________"));
mapPacman.name = "Pac-Man";
mapPacman.wallStrokeColor = "#2121ff";
mapPacman.wallFillColor = "#000";
mapPacman.pelletColor = "#ffb8ae";
mapPacman.constrainGhostTurns = function(tile,openTiles) {
    if ((tile.x == 12 || tile.x == 15) && (tile.y == 14 || tile.y == 26)) {
        openTiles[DIR_UP] = false;
    }
};
var getLevelAct = function(level) {
    if (level <= 2) {
        return 1;
    }
    else if (level <= 5) {
        return 2;
    }
    else {
        return 3 + Math.floor((level - 6)/4);
    }
};
var getActColor = function(act) {
    if (gameMode == GAME_PACMAN) {
        return {
            wallFillColor: mapPacman.wallFillColor,
            wallStrokeColor: mapPacman.wallStrokeColor,
            pelletColor: mapPacman.pelletColor,
        };
    }
    else if (gameMode == GAME_MSPACMAN || gameMode == GAME_OTTO) {
        return getMsPacActColor(act);
    }
    else if (gameMode == GAME_COOKIE) {
        return getCookieActColor(act);
    }
};
var getActRange = function(act) {
    if (act == 1) {
        return [1,2];
    }
    else if (act == 2) {
        return [3,5];
    }
    else {
        var start = act*4-6;
        return [start, start+3];
    }
};
var getCookieActColor = function(act) {
    var colors = [
        "#359c9c", "#80d8fc",
        "#c2b853", "#e6f1e7",
        "#86669c", "#f2c1db",
        "#ed0a04", "#e8b4cd",
        "#2067c1", "#63e0b6",
        "#c55994", "#fd61c3",
        "#12bc76", "#b4e671",
        "#5036d9", "#618dd4",
        "#939473", "#fdfdf4",
    ];
    var i = ((act-1)*2) % colors.length;
    return {
        wallFillColor: colors[i],
        wallStrokeColor: colors[i+1],
        pelletColor: "#ffb8ae",
    };
};
var setNextCookieMap = function() {
    var i;
    var act = getLevelAct(level);
    if (!map || level == 1 || act != getLevelAct(level-1)) {
        map = mapgen();
        var colors = getCookieActColor(act);
        map.wallFillColor = colors.wallFillColor;
        map.wallStrokeColor = colors.wallStrokeColor;
        map.pelletColor = colors.pelletColor;
    }
};
var getMsPacActColor = function(act) {
    act -= 1;
    var mapIndex = (act <= 1) ? act : (act%2)+2;
    var maps = [mapMsPacman1, mapMsPacman2, mapMsPacman3, mapMsPacman4];
    var map = maps[mapIndex];
    if (act >= 4) {
        return [
            {
                wallFillColor: "#ffb8ff",
                wallStrokeColor: "#FFFF00",
                pelletColor: "#00ffff",
            },
            {
                wallFillColor: "#FFB8AE",
                wallStrokeColor: "#FF0000",
                pelletColor: "#dedeff",
            },
            {
                wallFillColor: "#de9751",
                wallStrokeColor: "#dedeff",
                pelletColor: "#ff0000",
            },
            {
                wallFillColor: "#2121ff",
                wallStrokeColor: "#ffb851",
                pelletColor: "#dedeff",
            },
        ][act%4];
    }
    else {
        return {
            wallFillColor: map.wallFillColor,
            wallStrokeColor: map.wallStrokeColor,
            pelletColor: map.pelletColor,
        };
    }
};
var setNextMsPacMap = function() {
    var maps = [mapMsPacman1, mapMsPacman2, mapMsPacman3, mapMsPacman4];
    var act = getLevelAct(level)-1;
    var mapIndex = (act <= 1) ? act : (act%2)+2;
    map = maps[mapIndex];
    if (act >= 4) {
        var colors = getMsPacActColor(act+1);
        map.wallFillColor = colors.wallFillColor;
        map.wallStrokeColor = colors.wallStrokeColor;
        map.pelletColor = colors.pelletColor;
    }
};
var mapMsPacman1 = new Map(28, 36, (
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "||||||||||||||||||||||||||||" +
    "|......||..........||......|" +
    "|o||||.||.||||||||.||.||||o|" +
    "|.||||.||.||||||||.||.||||.|" +
    "|..........................|" +
    "|||.||.|||||.||.|||||.||.|||" +
    "__|.||.|||||.||.|||||.||.|__" +
    "|||.||.|||||.||.|||||.||.|||" +
    "   .||.......||.......||.   " +
    "|||.||||| |||||||| |||||.|||" +
    "__|.||||| |||||||| |||||.|__" +
    "__|.                    .|__" +
    "__|.||||| |||--||| |||||.|__" +
    "__|.||||| |______| |||||.|__" +
    "__|.||    |______|    ||.|__" +
    "__|.|| || |______| || ||.|__" +
    "|||.|| || |||||||| || ||.|||" +
    "   .   ||          ||   .   " +
    "|||.|||||||| || ||||||||.|||" +
    "__|.|||||||| || ||||||||.|__" +
    "__|.......   ||   .......|__" +
    "__|.|||||.||||||||.|||||.|__" +
    "|||.|||||.||||||||.|||||.|||" +
    "|............  ............|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|.||||.||....||....||.||||.|" +
    "|o||||.||.||||||||.||.||||o|" +
    "|.||||.||.||||||||.||.||||.|" +
    "|..........................|" +
    "||||||||||||||||||||||||||||" +
    "____________________________" +
    "____________________________"));
mapMsPacman1.name = "Ms. Pac-Man 1";
mapMsPacman1.wallFillColor = "#FFB8AE";
mapMsPacman1.wallStrokeColor = "#FF0000";
mapMsPacman1.pelletColor = "#dedeff";
mapMsPacman1.fruitPaths = {
             "entrances": [
                 { "start": { "y": 164, "x": 228 }, "path": "<<<<vvv<<<<<<<<<^^^" },
                 { "start": { "y": 164, "x": -4 }, "path": ">>>>vvvvvv>>>>>>>>>>>>>>>^^^<<<^^^" },
                 { "start": { "y": 92, "x": -4 }, "path": ">>>>^^^^>>>vvvv>>>vvv>>>>>>>>>vvvvvv<<<" },
                 { "start": { "y": 92, "x": 228 }, "path": "<<<<vvvvvvvvv<<<^^^<<<vvv<<<" }
             ],
             "exits": [
                 { "path": "<vvv>>>>>>>>>^^^>>>>" },
                 { "path": "<<<<vvv<<<<<<<<<^^^<<<<" },
                 { "path": "<<<<<<<^^^^^^<<<<<<^^^<<<<" },
                 { "path": "<vvv>>>>>>>>>^^^^^^^^^^^^>>>>" }
             ]
         };
var mapMsPacman2 = new Map(28, 36, (
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "||||||||||||||||||||||||||||" +
    "       ||..........||       " +
    "|||||| ||.||||||||.|| ||||||" +
    "|||||| ||.||||||||.|| ||||||" +
    "|o...........||...........o|" +
    "|.|||||||.||.||.||.|||||||.|" +
    "|.|||||||.||.||.||.|||||||.|" +
    "|.||......||.||.||......||.|" +
    "|.||.|||| ||....|| ||||.||.|" +
    "|.||.|||| |||||||| ||||.||.|" +
    "|......|| |||||||| ||......|" +
    "||||||.||          ||.||||||" +
    "||||||.|| |||--||| ||.||||||" +
    "|......|| |______| ||......|" +
    "|.||||.|| |______| ||.||||.|" +
    "|.||||.   |______|   .||||.|" +
    "|...||.|| |||||||| ||.||...|" +
    "|||.||.||          ||.||.|||" +
    "__|.||.|||| |||| ||||.||.|__" +
    "__|.||.|||| |||| ||||.||.|__" +
    "__|.........||||.........|__" +
    "__|.|||||||.||||.|||||||.|__" +
    "|||.|||||||.||||.|||||||.|||" +
    "   ....||...    ...||....   " +
    "|||.||.||.||||||||.||.||.|||" +
    "|||.||.||.||||||||.||.||.|||" +
    "|o..||.......||.......||..o|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|..........................|" +
    "||||||||||||||||||||||||||||" +
    "____________________________" +
    "____________________________"));
mapMsPacman2.name = "Ms. Pac-Man 2";
mapMsPacman2.wallFillColor = "#47b8ff";
mapMsPacman2.wallStrokeColor = "#dedeff";
mapMsPacman2.pelletColor = "#ffff00";
mapMsPacman2.fruitPaths = {
             "entrances": [
                 { "start": { "y": 212, "x": 228 }, "path": "<<<<^^^<<<<<<<<^^^<" },
                 { "start": { "y": 212, "x": -4 }, "path": ">>>>^^^>>>>>>>>vvv>>>>>^^^^^^<" },
                 { "start": { "y": 36, "x": -4 }, "path": ">>>>>>>vvv>>>vvvvvvv>>>>>>>>>vvvvvv<<<" },
                 { "start": { "y": 36, "x": 228 }, "path": "<<<<<<<vvv<<<vvvvvvvvvvvvv<<<" }
             ],
             "exits": [
                 { "path": "vvv>>>>>>>>vvv>>>>" },
                 { "path": "vvvvvv<<<<<^^^<<<<<<<<vvv<<<<" },
                 { "path": "<<<<<<<^^^^^^^^^^^^^<<<^^^<<<<<<<" },
                 { "path": "vvv>>>>>^^^^^^^^^^>>>>>^^^^^^<<<<<^^^>>>>>>>" }
             ]
         };
var mapMsPacman3 = new Map(28, 36, (
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "||||||||||||||||||||||||||||" +
    "|.........||....||.........|" +
    "|.|||||||.||.||.||.|||||||.|" +
    "|o|||||||.||.||.||.|||||||o|" +
    "|.||.........||.........||.|" +
    "|.||.||.||||.||.||||.||.||.|" +
    "|....||.||||.||.||||.||....|" +
    "||||.||.||||.||.||||.||.||||" +
    "||||.||..............||.||||" +
    " ....|||| |||||||| ||||.... " +
    "|.|| |||| |||||||| |||| ||.|" +
    "|.||                    ||.|" +
    "|.|||| || |||--||| || ||||.|" +
    "|.|||| || |______| || ||||.|" +
    "|.     || |______| ||     .|" +
    "|.|| |||| |______| |||| ||.|" +
    "|.|| |||| |||||||| |||| ||.|" +
    "|.||                    ||.|" +
    "|.|||| ||||| || ||||| ||||.|" +
    "|.|||| ||||| || ||||| ||||.|" +
    "|......||....||....||......|" +
    "|||.||.||.||||||||.||.||.|||" +
    "|||.||.||.||||||||.||.||.|||" +
    "|o..||.......  .......||..o|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|.||||.|||||.||.|||||.||||.|" +
    "|......||....||....||......|" +
    "|.||||.||.||||||||.||.||||.|" +
    "|.||||.||.||||||||.||.||||.|" +
    "|......||..........||......|" +
    "||||||||||||||||||||||||||||" +
    "____________________________" +
    "____________________________"));
mapMsPacman3.name = "Ms. Pac-Man 3";
mapMsPacman3.wallFillColor = "#de9751";
mapMsPacman3.wallStrokeColor = "#dedeff";
mapMsPacman3.pelletColor = "#ff0000";
mapMsPacman3.fruitPaths = {
             "entrances": [
                 { "start": { "y": 100, "x": 228 }, "path": "<<<<<vv<<<<<vvvvvv<<<" },
                 { "start": { "y": 100, "x": -4 }, "path": ">>>>>vv>>>>>>>>>>>>>>vvvvvv<<<" },
                 { "start": { "y": 100, "x": -4 }, "path": ">>>>>vv>>>>>>>>>>>>>>vvvvvv<<<" },
                 { "start": { "y": 100, "x": 228 }, "path": "<<vvvvv<<<vvv<<<<<<<<" }
             ],
             "exits": [
                 { "path": "<vvv>>>vvv>>>^^^>>>>>^^^^^^^^^^^>>" },
                 { "path": "<<<<vvv<<<vvv<<<^^^<<<<<^^^^^^^^^^^<<" },
                 { "path": "<<<<vvv<<<vvv<<<^^^<<<<<^^^^^^^^^^^<<" },
                 { "path": "<vvv>>>vvv>>>^^^^^^<<<^^^^^^>>>>>^^>>>>>" }
             ]
         };
mapMsPacman3.constrainGhostTurns = function(tile,openTiles,dirEnum) {
    if (tile.y == 12) {
        if ((tile.x == 1 && dirEnum == DIR_RIGHT) || (tile.x == 26 && dirEnum == DIR_LEFT)) {
            openTiles[DIR_DOWN] = false;
        }
    }
};
var mapMsPacman4 = new Map(28, 36, (
    "____________________________" +
    "____________________________" +
    "____________________________" +
    "||||||||||||||||||||||||||||" +
    "|..........................|" +
    "|.||.||||.||||||||.||||.||.|" +
    "|o||.||||.||||||||.||||.||o|" +
    "|.||.||||.||....||.||||.||.|" +
    "|.||......||.||.||......||.|" +
    "|.||||.||.||.||.||.||.||||.|" +
    "|.||||.||.||.||.||.||.||||.|" +
    "|......||....||....||......|" +
    "|||.|||||||| || ||||||||.|||" +
    "__|.|||||||| || ||||||||.|__" +
    "__|....||          ||....|__" +
    "||| ||.|| |||--||| ||.|| |||" +
    "    ||.|| |______| ||.||    " +
    "||||||.   |______|   .||||||" +
    "||||||.|| |______| ||.||||||" +
    "    ||.|| |||||||| ||.||    " +
    "||| ||.||          ||.|| |||" +
    "__|....||||| || |||||....|__" +
    "__|.||.||||| || |||||.||.|__" +
    "__|.||....   ||   ....||.|__" +
    "__|.|||||.|| || ||.|||||.|__" +
    "|||.|||||.|| || ||.|||||.|||" +
    "|.........||    ||.........|" +
    "|.||||.||.||||||||.||.||||.|" +
    "|.||||.||.||||||||.||.||||.|" +
    "|.||...||..........||...||.|" +
    "|o||.|||||||.||.|||||||.||o|" +
    "|.||.|||||||.||.|||||||.||.|" +
    "|............||............|" +
    "||||||||||||||||||||||||||||" +
    "____________________________" +
    "____________________________"));
mapMsPacman4.name = "Ms. Pac-Man 4";
mapMsPacman4.wallFillColor = "#2121ff";
mapMsPacman4.wallStrokeColor = "#ffb851";
mapMsPacman4.pelletColor = "#dedeff";
mapMsPacman4.fruitPaths = {
             "entrances": [
                 { "start": { "y": 156, "x": 228 }, "path": "<<<<vv<<<vv<<<<<<^^^" },
                 { "start": { "y": 156, "x": -4 }, "path": ">>>>vv>>>vv>>>>>>vvv>>>^^^^^^" },
                 { "start": { "y": 132, "x": -4 }, "path": ">>>>^^^^^>>>^^^>>>vvv>>>vvv>>>>>>vvvvvv<<<" },
                 { "start": { "y": 132, "x": 228 }, "path": "<<<<^^<<<vvv<<<vvv<<<" }
             ],
             "exits": [
                 { "path": "<vvv>>>>>>^^>>>^^>>>>" },
                 { "path": "<<<<vvv<<<<<<^^<<<^^<<<<" },
                 { "path": "<<<<<<<^^^<<<^^^<<<vv<<<<" },
                 { "path": "<vvv>>>>>>^^^^^^^^^>>>vv>>>>" }
             ]
         };
var VCR_NONE = -1;
var VCR_RECORD = 0;
var VCR_REWIND = 1;
var VCR_FORWARD = 2;
var VCR_PAUSE = 3;
var vcr = (function() {
    var mode;
    var initialized;
    var time;
    var speedIndex;
    var speeds = [-8,-4,-2,-1,0,1,2,4,8];
    var speedCount = speeds.length;
    var speedColors = [
        "rgba(255,255,0,0.25)",
        "rgba(255,255,0,0.20)",
        "rgba(255,255,0,0.15)",
        "rgba(255,255,0,0.10)",
        "rgba(0,0,0,0)",
        "rgba(0,0,255,0.10)",
        "rgba(0,0,255,0.15)",
        "rgba(0,0,255,0.20)",
        "rgba(0,0,255,0.25)",
    ];
    var speedPrints = [
        18,
        13,
        8,
        3,
        3,
        10,
        15,
        20,
        25,
    ];
    var speedPrintStep = [
        6,
        5,
        4,
        3,
        3,
        3,
        4,
        5,
        6,
    ];
    var frame;
    var maxFrames = 15*60;
    var startFrame;
    var stopFrame;
    var reset = function() {
        time = 0;
        frame = 0;
        startFrame = 0;
        stopFrame = 0;
        states = {};
        startRecording();
    };
    var load = function() {
        var i;
        for (i=0; i<5; i++) {
            actors[i].load(frame);
        }
        elroyTimer.load(frame);
        energizer.load(frame);
        fruit.load(frame);
        ghostCommander.load(frame);
        ghostReleaser.load(frame);
        map.load(frame,time);
        loadGame(frame);
        if (state == deadState) {
            deadState.load(frame);
        }
        else if (state == finishState) {
            finishState.load(frame);
        }
    };
    var save = function() {
        var i;
        for (i=0; i<5; i++) {
            actors[i].save(frame);
        }
        elroyTimer.save(frame);
        energizer.save(frame);
        fruit.save(frame);
        ghostCommander.save(frame);
        ghostReleaser.save(frame);
        map.save(frame);
        saveGame(frame);
        if (state == deadState) {
            deadState.save(frame);
        }
        else if (state == finishState) {
            finishState.save(frame);
        }
    };
    var eraseFuture = function() {
        map.eraseFuture(time);
        stopFrame = frame;
    };
    var addTime = function(dt) {
        time += dt;
        frame = (frame+dt)%maxFrames;
        if (frame < 0) {
            frame += maxFrames;
        }
    };
    var getForwardDist = function(x0,x1) {
        return (x0 <= x1) ? x1-x0 : x1+maxFrames-x0;
    };
    var capSeekTime = function(dt) {
        if (!initialized || dt == 0) {
            return 0;
        }
        var maxForward = getForwardDist(frame,stopFrame);
        var maxReverse = getForwardDist(startFrame,frame);
        return (dt > 0) ? Math.min(maxForward,dt) : Math.max(-maxReverse,dt);
    };
    var init = function() {
        mode = VCR_NONE;
    };
    var seek = function(dt) {
        if (dt == undefined) {
            dt = speeds[speedIndex];
        }
        if (initialized) {
            addTime(capSeekTime(dt));
            load();
        }
    };
    var record = function() {
        if (initialized) {
            addTime(1);
            if (frame == startFrame) {
                startFrame = (startFrame+1)%maxFrames;
            }
            stopFrame = frame;
        }
        else {
            initialized = true;
        }
        save();
    };
    var startRecording = function() {
        mode = VCR_RECORD;
        initialized = false;
        eraseFuture();
        seekUpBtn.disable();
        seekDownBtn.disable();
        seekToggleBtn.setIcon(function(ctx,x,y,frame) {
            drawRewindSymbol(ctx,x,y,"#FFF");
        });
        seekToggleBtn.setText();
    };
    var refreshSeekDisplay = function() {
        seekToggleBtn.setText(speeds[speedIndex]+"x");
    };
    var startSeeking = function() {
        speedIndex = 3;
        updateMode();
        seekUpBtn.enable();
        seekDownBtn.enable();
        seekToggleBtn.setIcon(undefined);
        refreshSeekDisplay();
    };
    var nextSpeed = function(di) {
        if (speeds[speedIndex+di] != undefined) {
            speedIndex = speedIndex+di;
        }
        updateMode();
        refreshSeekDisplay();
    };
    var x,y,w,h;
    var pad = 5;
    x = mapWidth+1;
    h = 25;
    w = 25;
    y = mapHeight/2-h/2;
    var seekUpBtn = new Button(x,y-h-pad,w,h,
        function() {
            nextSpeed(1);
        });
    seekUpBtn.setIcon(function(ctx,x,y,frame) {
        drawUpSymbol(ctx,x,y,"#FFF");
    });
    var seekDownBtn = new Button(x,y+h+pad,w,h,
        function() {
            nextSpeed(-1);
        });
    seekDownBtn.setIcon(function(ctx,x,y,frame) {
        drawDownSymbol(ctx,x,y,"#FFF");
    });
    var seekToggleBtn = new ToggleButton(x,y,w,h,
        function() {
            return mode != VCR_RECORD;
        },
        function(on) {
            on ? startSeeking() : startRecording();
        });
    seekToggleBtn.setIcon(function(ctx,x,y,frame) {
        drawRewindSymbol(ctx,x,y,"#FFF");
    });
    seekToggleBtn.setFont((tileSize-1)+"px ArcadeR", "#FFF");
    var slowBtn = new ToggleButton(-w-pad-1,y,w,h,
        function() {
            return executive.getFramePeriod() == 1000/15;
        },
        function(on) {
            executive.setUpdatesPerSecond(on ? 15 : 60);
        });
    slowBtn.setIcon(function(ctx,x,y) {
        atlas.drawSnail(ctx,x,y,1);
    });
    var onFramePeriodChange = function() {
        if (slowBtn.isOn()) {
            slowBtn.setIcon(function(ctx,x,y) {
                atlas.drawSnail(ctx,x,y,0);
            });
        }
        else {
            slowBtn.setIcon(function(ctx,x,y) {
                atlas.drawSnail(ctx,x,y,1);
            });
        }
    };
    var onHudEnable = function() {
        if (practiceMode) {
            if (mode == VCR_NONE || mode == VCR_RECORD) {
                seekUpBtn.disable();
                seekDownBtn.disable();
            }
            else {
                seekUpBtn.enable();
                seekDownBtn.enable();
            }
            seekToggleBtn.enable();
            slowBtn.enable();
        }
    };
    var onHudDisable = function() {
        if (practiceMode) {
            seekUpBtn.disable();
            seekDownBtn.disable();
            seekToggleBtn.disable();
            slowBtn.disable();
        }
    };
    var isValidState = function() {
        return (
            !inGameMenu.isOpen() && (
            state == playState ||
            state == finishState ||
            state == deadState));
    };
    var draw = function(ctx) {
        if (practiceMode) {
            if (isValidState() && vcr.getMode() != VCR_RECORD) {
                renderer.setOverlayColor(speedColors[speedIndex]);
            }
            if (seekUpBtn.isEnabled) {
                seekUpBtn.draw(ctx);
            }
            if (seekDownBtn.isEnabled) {
                seekDownBtn.draw(ctx);
            }
            if (seekToggleBtn.isEnabled) {
                seekToggleBtn.draw(ctx);
            }
            if (slowBtn.isEnabled) {
                slowBtn.draw(ctx);
            }
        }
    };
    var updateMode = function() {
        var speed = speeds[speedIndex];
        if (speed == 0) {
            mode = VCR_PAUSE;
        }
        else if (speed < 0) {
            mode = VCR_REWIND;
        }
        else if (speed > 0) {
            mode = VCR_FORWARD;
        }
    };
    return {
        init: init,
        reset: reset,
        seek: seek,
        record: record,
        draw: draw,
        onFramePeriodChange: onFramePeriodChange,
        onHudEnable: onHudEnable,
        onHudDisable: onHudDisable,
        eraseFuture: eraseFuture,
        startRecording: startRecording,
        startSeeking: startSeeking,
        nextSpeed: nextSpeed,
        isSeeking: function() {
            return (
                mode == VCR_REWIND ||
                mode == VCR_FORWARD ||
                mode == VCR_PAUSE);
        },
        getTime: function() { return time; },
        getFrame: function() { return frame; },
        getMode: function() { return mode; },
        drawHistory: function(ctx,callback) {
            if (!this.isSeeking()) {
                return;
            }
            var maxReverse = getForwardDist(startFrame,frame);
            var start = (frame - Math.min(maxReverse,speedPrints[speedIndex])) % maxFrames;
            if (start < 0) {
                start += maxFrames;
            }
            var maxForward = getForwardDist(frame,stopFrame);
            var end = (frame + Math.min(maxForward,speedPrints[speedCount-1-speedIndex])) % maxFrames;
            var backupAlpha = ctx.globalAlpha;
            ctx.globalAlpha = 0.2;
            var t = start;
            var step = speedPrintStep[speedIndex];
            if (start > end) {
                for (; t<maxFrames; t+=step) {
                    callback(t);
                }
                t %= maxFrames;
            }
            for (; t<end; t+=step) {
                callback(t);
            }
            ctx.globalAlpha = backupAlpha;
        },
    };
})();
window.addEventListener("load", function() {
    loadHighScores();
    initRenderer();
    atlas.create();
    initSwipe();
	var anchor = window.location.hash.substring(1);
	if (anchor == "learn") {
		switchState(learnState);
	}
	else if (anchor == "cheat_pac" || anchor == "cheat_mspac") {
		gameMode = (anchor == "cheat_pac") ? GAME_PACMAN : GAME_MSPACMAN;
		practiceMode = true;
        switchState(newGameState);
		for (var i=0; i<4; i++) {
			ghosts[i].isDrawTarget = true;
			ghosts[i].isDrawPath = true;
		}
	}
	else {
		switchState(homeState);
	}
    executive.init();
});
})();
