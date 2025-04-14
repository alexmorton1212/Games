
/****************************************/
/* GLOBAL VARIABLES */
/****************************************/

let numColors = 12;
let numTiles = 9;
let numAnswers = 6;
let numRows = 3;
let numCols = 3;

// TO DO - RESTEST THESE
// important not to raise these (without testing)
// can cause maximum recursion error
let keyboardDistanceMin = 175; // 175
let keyboardLoopMax = 100; // 100
let keyboardLoopCount = 0;


// TO DO - RESTEST THESE
// important not to raise these (without testing)
// can cause maximum recursion error
let answerDistanceMin = 125; // 125
let answerLoopMax = 100; // 100
let answerLoopCount = 0;

let keyboardPalette = [];
let keyboardPaletteCount = 0;
let keyboardPaletteDbl = [];

let gameboardPalette = [];

let colorMap = {};
let blendMap = {};

let answersX = [];
let answersY = [];

let isColorSelected = 0;
let colorSelectedDiv = '';

let isGuideOn = 0;

// prevents double tapping to zoom on ios mobile
// happens frequently when trying to place colors
document.ondblclick = function(e) { e.preventDefault(); }


/****************************************/
/* GLOBAL FUNCTIONS */
/****************************************/

function getColorDistance(color1, color2) {

    let r = Math.abs(color1[0] - color2[0]);
    let g = Math.abs(color1[1] - color2[1]);
    let b = Math.abs(color1[2] - color2[2]);
    return (r + g + b);
}

function convertToTextRGB(arr) {

    return `rgb(${arr[0]},${arr[1]},${arr[2]})`;
}

function convertToArrayRGB(str) {

    const values = str.match(/(\d)+/g);
    return values ? values.map(Number) : null;
}


/****************************************/
/* BUTTONS */
/****************************************/

//const hintButton = document.querySelector('#hint');
//hintButton.addEventListener('click', onHintButtonClick);

function onHintButtonClick() {

    // find colors that weren't used

    for (let k = 0; k < keyboardPalette.length; k++) {

        let kFound = 0;

        for (let x1 = 0; x1 < answersX.length; x1++) {

            for (let x2 = 0; x2 < 3; x2++) {

                if (answersX[x1][x2][0] == keyboardPalette[k][0]
                && answersX[x1][x2][1] == keyboardPalette[k][1]
                && answersX[x1][x2][2] == keyboardPalette[k][2]) {
                    kFound = 1;
                }
            }
        }

        if (kFound == 0) {

            let herringColor = document.getElementById('color-' + (k+1));
            herringColor.classList.remove('color-unused');
            herringColor.classList.add('color-used');
            herringColor.style.backgroundColor = 'transparent';
        }

    }


    //console.log(keyboardPalette);

    //console.log(answersX);

}

const newButton = document.querySelector('#new');
newButton.addEventListener('click', onNewButtonClick);

function onNewButtonClick() {

    runGame();
}

const guideButton = document.querySelector('#guide');
guideButton.addEventListener('click', onGuideButtonClick);

function onGuideButtonClick() {

    let answerGuide = document.querySelectorAll('.tile-answer');
    let blendGuide = document.querySelectorAll('.tile-blend');

    if (isGuideOn == 0) {

        for (let i = 0; i < numAnswers; i++) {
    
            if (i < 3) { answerGuide[i+3].innerHTML = i+1; } 
            else { answerGuide[i-3].innerHTML = i+1; }
            blendGuide[i].innerHTML = i+1;
        }

    } else {
    
        for (let i = 0; i < numAnswers; i++) {
            if (i < 3) { answerGuide[i+3].innerHTML = ''; } 
            else { answerGuide[i-3].innerHTML = ''; }
            blendGuide[i].innerHTML = '';
        }
    }

    isGuideOn = Math.abs(isGuideOn-1);

}

/****************************************/
/* KEYBOARD */
/****************************************/

function getRandomColor() {
    return Math.floor(Math.random() * 256);
}

function getNonGrayscaleRGB() {

    let r, g, b;
    do { r = getRandomColor(); g = getRandomColor(); b =getRandomColor(); } while (r === g && g === b);
    return [r, g, b];
}

function doubleArrayItems(arr) {
    const result = [];
    for (const item of arr) {
      result.push(item);
    }
    return result;
}

function checkValidKeyboardColor(color1, color2) {

    if (getColorDistance(color1, color2) > keyboardDistanceMin) { return true; } else { return false; }
}

function getKeyboardColors() {

    // get first random color
    if (keyboardPaletteCount == 0) { 
        keyboardPalette.push(getNonGrayscaleRGB()); 
        keyboardPaletteCount++;
    }

    do { 

        let randomColor = getNonGrayscaleRGB();
        let randomCheck = 0;

        // check if new color is far enough from existing colors
        for (let k = 0; k < keyboardPalette.length; k++) {
            if (!checkValidKeyboardColor(randomColor, keyboardPalette[k])) { 
                randomCheck++; 
            }
        }

        // if new color is far enough away from the existing colors --> add to keyboard
        if (randomCheck == 0) { 
            keyboardPalette.push(randomColor); 
            keyboardPaletteCount++; 
        } else {
            keyboardLoopCount++;
        }

    } while ((keyboardPaletteCount < numColors) && (keyboardLoopCount < keyboardLoopMax));

    if (keyboardLoopCount == keyboardLoopMax) {

        keyboardLoopCount = 0;
        keyboardPalette = [];
        keyboardPaletteCount = 0;
        getKeyboardColors();
    }

    keyboardPaletteDbl = doubleArrayItems(keyboardPalette);

}

function createColorMap() {

    for (let c of document.querySelectorAll('.color')) {
        colorMap[c.id] = {};
        colorMap[c.id]['rgb-text'] = c.style.backgroundColor;
        colorMap[c.id]['rgb-array'] = convertToArrayRGB(c.style.backgroundColor);
    }
}

function makeKeyboardClickable() {

    for (let kcolor of document.querySelectorAll(".color")) {
        kcolor.addEventListener("click", clickKeyboard);
    }
}

function clickKeyboard() {

    // if a color is not already selected
    if (isColorSelected == 0) {

        // if selected color is not already used
        if (!this.classList.contains('color-used')) {
            this.classList.add('color-selected');
            this.classList.remove('color-unused');
            isColorSelected = 1;
            colorSelectedDiv = this;
        }

    // if a color is already selected
    } else {

        // if we click the same selected color again --> unselect
        if (this.classList.contains('color-selected')) {
            this.classList.remove('color-selected');
            this.classList.add('color-unused');
            isColorSelected = 0;
            colorSelectedDiv = '';
    
        } else {

            // if we click another color letter --> unselect old, select new
            if (this.classList.contains('color-unused')) {
                colorSelectedDiv.classList.remove('color-selected');
                colorSelectedDiv.classList.add('color-unused');
                this.classList.add('color-selected');
                this.classList.remove('color-unused');
                isColorSelected = 1;
                colorSelectedDiv = this;

            } else {

                // if we try selecting a used letter --> unselect
                if (this.classList.contains('color-used')) {
                    colorSelectedDiv.classList.remove('color-selected');
                    colorSelectedDiv.classList.add('color-unused');
                    isColorSelected = 0;
                    colorSelectedDiv = '';
                }
            }
        }
    }
}

function setKeyboard() {

    for (let i = 1; i <= numColors; i++) {
        let keyboardTile = document.getElementById('color-' + i);
        let randomColor = keyboardPalette[i-1];
        let randomColorRGB = convertToTextRGB(randomColor);
        keyboardTile.style.backgroundColor = randomColorRGB;
    }
}

function resetKeyboard() {

    let usedQ = document.querySelectorAll('.color-used');
    for (let q of usedQ) {
        q.classList.remove('color-used');
        q.classList.add('color-unused');
        q.style.backgroundColor = 'transparent';
    }
}


/****************************************/
/* GAMEBOARD */
/****************************************/

function getRandomKeyboardColor() {

    const randomIndex = Math.floor(Math.random() * keyboardPaletteDbl.length);
    let color = keyboardPaletteDbl[randomIndex];
    keyboardPaletteDbl.splice(randomIndex, 1);

    return color;
}

function blendColors(color1, color2, color3) {

    let colorBlendList = [color1, color2, color3];
    let sumR = 0; let sumG = 0; let sumB = 0;
  
    for (let i = 0; i < colorBlendList.length; i++) {
      sumR += colorBlendList[i][0];
      sumG += colorBlendList[i][1];
      sumB += colorBlendList[i][2];
    }
  
    return [Math.round(sumR / 3), Math.round(sumG / 3), Math.round(sumB / 3)];
}

function blendGameboardColors(arr) {

    let sumR = 0; let sumG = 0; let sumB = 0;
  
    for (let i = 0; i < arr.length; i++) {
        sumR += arr[i][0];
        sumG += arr[i][1];
        sumB += arr[i][2];
    }
      
    return [Math.round(sumR / arr.length), Math.round(sumG / arr.length), Math.round(sumB / arr.length)];
}

function getGameboardAnswerColors() {

    let answersXcopy = []

    for (let i = 0; i < numAnswers/2; i++) {
        let gColor1 = getRandomKeyboardColor();
        let gColor2 = getRandomKeyboardColor();
        let gColor3 = getRandomKeyboardColor();

        answersX.push([gColor1, gColor2, gColor3]);
        answersXcopy.push([gColor1, gColor2, gColor3]);
        answersY.push(blendColors(gColor1, gColor2, gColor3));
    }

    for (let j = 0; j < numAnswers/2; j++) {

        const randomIndex = Math.floor(Math.random() * answersXcopy[0].length);

        let gColor1 = answersXcopy[0][randomIndex];
        let gColor2 = answersXcopy[1][randomIndex];
        let gColor3 = answersXcopy[2][randomIndex];

        answersXcopy[0].splice(randomIndex, 1);
        answersXcopy[1].splice(randomIndex, 1);
        answersXcopy[2].splice(randomIndex, 1);

        answersX.push([gColor1, gColor2, gColor3]);
        answersY.push(blendColors(gColor1, gColor2, gColor3));
    }

}

function checkGameboardAnswerColors() {

    let answerCheckCount = 0;

    for (let i = 0; i < answersY.length; i++) {
        for (let j = i + 1; j < answersY.length; j++) {
          if(getColorDistance(answersY[i], answersY[j]) < answerDistanceMin) { answerCheckCount++; }
        }
    }

    if (answerCheckCount == 0) { return true; } else { return false; }
}

function setGameboardAnswerColor() {

    getGameboardAnswerColors();

    if (checkGameboardAnswerColors()) {

        for (let i = 0; i < numAnswers; i++) {
            let gColorRGB = convertToTextRGB(answersY[i]);
            let tileQ = document.getElementById('tile-answer-' + (i+1));
            tileQ.style.backgroundColor = gColorRGB;
        }

    } else {

        answerLoopCount++;

        if (answerLoopCount == answerLoopMax) {

            // if answer colors are too similar after X attempts, try again with different keyboard
            keyboardPalette = [];
            keyboardPaletteCount = 0;
            getKeyboardColors();
            keyboardPaletteDbl = [];
            keyboardPaletteDbl = doubleArrayItems(keyboardPalette);
            answerLoopCount = 0;

        } else {

            // if answer colors are too similar, try again with same keyboard
            keyboardPaletteDbl = [];
            keyboardPaletteDbl = doubleArrayItems(keyboardPalette);
            answersX = [];
            answersY = [];
        }

        setGameboardAnswerColor();
    }

}

function createBlendMap() {

    blendMap['tile-blend-1'] = {'tiles': ['tile-1', 'tile-2', 'tile-3']};
    blendMap['tile-blend-2'] = {'tiles': ['tile-4', 'tile-5', 'tile-6']};
    blendMap['tile-blend-3'] = {'tiles': ['tile-7', 'tile-8', 'tile-9']};
    blendMap['tile-blend-4'] = {'tiles': ['tile-1', 'tile-4', 'tile-7']};
    blendMap['tile-blend-5'] = {'tiles': ['tile-2', 'tile-5', 'tile-8']};
    blendMap['tile-blend-6'] = {'tiles': ['tile-3', 'tile-6', 'tile-9']};


}

function setBlendedColors() {

    let blendTiles = document.querySelectorAll('.tile-blend');

    for (let b of blendTiles) {

        let usedArrayColors = [];

        for (let i = 0; i < 3; i++) {

            let currentTileID = blendMap[b.id]['tiles'][i];
            let currentTile = document.getElementById(currentTileID);

            if (currentTile.classList.contains('tile-used')) {

                let currentTileColor = currentTile.style.backgroundColor;

                if ((currentTileColor !== '') && (currentTileColor !== 'transparent')) {

                    usedArrayColors.push(convertToArrayRGB(currentTileColor));
                }
            }

        }

        if (usedArrayColors.length == 0) {
            b.style.backgroundColor = 'transparent';
        } else {
            b.style.backgroundColor = convertToTextRGB(blendGameboardColors(usedArrayColors));
        }
    }


}

function makeGameboardClickable(e) {

    // if a color on the keyboard is currently selected
    if (isColorSelected == 1) {
    
        // if we click on something other than the keyboard
        // keyboard cases get handled in the Keyboard Setup section
        if (!e.target.classList.contains('color')) {

            // TO DO - UPDATE BLENDED TILES
            // if we clicked an unused gameboard tile --> add to gameboard
            if (e.target.classList.contains('tile-unused')) {

                e.target.classList.remove("tile-unused");
                e.target.classList.add("tile-used");

                e.target.style.backgroundColor = colorMap[colorSelectedDiv.id]['rgb-text'];
                colorSelectedDiv.classList.remove('color-selected');
                colorSelectedDiv.classList.add('color-used');
                colorSelectedDiv.style.backgroundColor = 'transparent';
                isColorSelected = 0;
                colorSelectedDiv = '';

                setBlendedColors();
                checkColorMatch();
                // checkBoardFull();
                checkGameComplete();

            // if we click on something other than an unused tile
            } else {

                // TO DO - UPDATE BLENDED TILES
                // if we click on a tile-used, tile-row, tile-answer, or tile-blend
                // do nothing on board, keep keyboard color selected
                // otherwise, unselect keyboard letter
                if(!e.target.classList.contains('tile-used') 
                && !e.target.classList.contains('tile-row') 
                && !e.target.classList.contains('tile-answer')
                && !e.target.classList.contains('tile-blend')) {
                    colorSelectedDiv.classList.remove('color-selected');
                    colorSelectedDiv.classList.add('color-unused');
                    isColorSelected = 0;
                    colorSelectedDiv = '';
                }
            }   
        } 
        
        
    // if there is NO color selected on keyboard
    } else {

        // if tile is used --> remove tile from gameboard, add back letter to keyboard
        // also do nothing if game is successfully completed (tile-complete)
        // otherwise do nothing
        if (e.target.classList.contains('tile-used')) {

            let rgbTextValue = e.target.style.backgroundColor;
            let colorKey = Object.keys(colorMap).find(key => colorMap[key]['rgb-text'] === rgbTextValue);
            let colorTile = document.getElementById(colorKey);
            colorTile.classList.remove('color-used');
            colorTile.classList.add('color-unused');
            colorTile.style.backgroundColor = colorMap[colorKey]['rgb-text'];
            e.target.classList.remove('tile-used');
            e.target.classList.add('tile-unused');
            e.target.style.backgroundColor = 'transparent';

            setBlendedColors();
            checkColorMatch();
            // checkBoardFull();
            checkGameComplete();
        }
    }
}

function checkColorMatch() {

    let a1 = document.getElementById('tile-answer-1');
    let a2 = document.getElementById('tile-answer-2');
    let a3 = document.getElementById('tile-answer-3');
    let a4 = document.getElementById('tile-answer-4');
    let a5 = document.getElementById('tile-answer-5');
    let a6 = document.getElementById('tile-answer-6');

    let b1 = document.getElementById('tile-blend-1');
    let b2 = document.getElementById('tile-blend-2');
    let b3 = document.getElementById('tile-blend-3');
    let b4 = document.getElementById('tile-blend-4');
    let b5 = document.getElementById('tile-blend-5');
    let b6 = document.getElementById('tile-blend-6');

    if (a1.style.backgroundColor == b4.style.backgroundColor) { 
        a1.innerHTML = "=";  b4.innerHTML = "=";
    } //else { a1.innerHTML = ""; b4.innerHTML = ""; }

    if (a2.style.backgroundColor == b5.style.backgroundColor) { 
        a2.innerHTML = "=";  b5.innerHTML = "=";
    } //else { a2.innerHTML = ""; b5.innerHTML = ""; }

    if (a3.style.backgroundColor == b6.style.backgroundColor) { 
        a3.innerHTML = "=";  b6.innerHTML = "=";
    } //else { a3.innerHTML = ""; b6.innerHTML = ""; }

    if (a4.style.backgroundColor == b1.style.backgroundColor) { 
        a4.innerHTML = "=";  b1.innerHTML = "=";
    } //else { a4.innerHTML = ""; b1.innerHTML = ""; }

    if (a5.style.backgroundColor == b2.style.backgroundColor) { 
        a5.innerHTML = "=";  b2.innerHTML = "=";
    } //else { a5.innerHTML = ""; b2.innerHTML = ""; }
    
    if (a6.style.backgroundColor == b3.style.backgroundColor) { 
        a6.innerHTML = "=";  b3.innerHTML = "=";
    } //else { a6.innerHTML = ""; b3.innerHTML = ""; }

}

function checkBoardFull() {

    let usedTiles = document.querySelectorAll('.tile-used');
    if (usedTiles.length == numTiles) { 
        setBlendedColors(); 
    } else {
        for (let b of document.querySelectorAll('.tile-blend')) { b.style.background = 'transparent'; }
    }

}

function checkGameComplete() {

    let a1 = document.getElementById('tile-answer-1').style.backgroundColor;
    let a2 = document.getElementById('tile-answer-2').style.backgroundColor;
    let a3 = document.getElementById('tile-answer-3').style.backgroundColor;
    let a4 = document.getElementById('tile-answer-4').style.backgroundColor;
    let a5 = document.getElementById('tile-answer-5').style.backgroundColor;
    let a6 = document.getElementById('tile-answer-6').style.backgroundColor;

    let b1 = document.getElementById('tile-blend-1').style.backgroundColor;
    let b2 = document.getElementById('tile-blend-2').style.backgroundColor;
    let b3 = document.getElementById('tile-blend-3').style.backgroundColor;
    let b4 = document.getElementById('tile-blend-4').style.backgroundColor;
    let b5 = document.getElementById('tile-blend-5').style.backgroundColor;
    let b6 = document.getElementById('tile-blend-6').style.backgroundColor;

    if ((a1==b4) && (a2==b5) && (a3==b6) && (a4==b1) && (a5==b2) && (a6==b3)) { doGameComplete(); }

}

function doGameComplete() {

    /*
    let tileQ = document.querySelectorAll('.tile');
    for (let t of tileQ) { 
        t.style.borderColor = 'green'; 
        //t.style.backgroundColor = 'transparent';    
    }

    let equalQ =document.querySelectorAll('.tile-answer, .tile-blend');
    for (let q of equalQ) {
        q.innerHTML = '';
    }
    */

    console.log("GAME COMPLETE!");

}

function setupBoardInteractions() {

    document.addEventListener('click', makeGameboardClickable);
}

function resetGameboard() {

    let usedQ = document.querySelectorAll('.tile-used');
    for (let q of usedQ) {
        q.classList.remove('tile-used');
        q.classList.add('tile-unused');
        q.style.backgroundColor = 'transparent';
    }

    let equalQ =document.querySelectorAll('.tile-answer, .tile-blend');
    for (let q of equalQ) {
        q.innerHTML = '';
    }
}


/****************************************/
/* START GAME */
/****************************************/

function runGame() {

    keyboardLoopCount = 0;
    answerLoopCount = 0;
    keyboardPalette = [];
    keyboardPaletteCount = 0;
    keyboardPaletteDbl = [];
    gameboardPalette = [];
    colorMap = {};
    blendMap = {};
    answersX = [];
    answersY = [];
    isColorSelected = 0;
    colorSelectedDiv = '';
    isGuideOn = 0;

    resetKeyboard();
    resetGameboard();

    makeKeyboardClickable();
    getKeyboardColors();
    setGameboardAnswerColor();
    setKeyboard();
    createColorMap();
    createBlendMap();
    setupBoardInteractions();
    setBlendedColors();

}

runGame();