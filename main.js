
// DATA

import data from "./data.json" with {type: "json"};


// FRONT-END PUZZLE

var letterSelected = null;
var tileSelected = null;
var boardAnswer = Array(25).fill(null); 
var boardArray = Array(25).fill(null);
var tileArray = Array();
let pairedTileList = ["0-3", "1-0", "0-4", "1-1", "1-3", "2-0", "1-4",
    "2-1", "2-3", "3-0", "2-4", "3-1", "3-3", "4-0", "3-4", "4-1"];
var pairedTile = null;
var difficulty = "HARD";


// BACK-END PUZZLE

var json = getJSON(data);
var words = getPuzzleWords(json);
var board = setBoard(words, difficulty);
var checkSolution = setSolution(words);
var letterlist = setLetterList(words);
setGivenBoardAnswer();


// BUTTONS

const hintButton = document.querySelector('#hint-button');
hintButton.addEventListener('click', onButtonClick);
const clearButton = document.querySelector('#clear-button');
clearButton.addEventListener('click', onButtonClick);
const newButton = document.querySelector('#new-button');
newButton.addEventListener('click', onButtonClick);
const difficultyButton = document.querySelector('#difficulty-button');
difficultyButton.addEventListener('click', onButtonClick);
const modeButton = document.querySelector('#mode-button');
modeButton.addEventListener('click', onButtonClick);


// START GAME

window.onload = function () {
    setGame();
}


// FRONT-END FUNCTIONS

function setGame() {

    createLetterTiles();
    createBoard();

}

function createLetterTiles() {

    let letterTiles = document.querySelectorAll('[class*="letter"]');


    // if not first game (difficulty change)

    if (letterTiles.length != 0) {
        letterTiles.forEach( function (item) { item.remove(); });
    }

    for (let i = 1; i <= letterlist.length; i++) {

        //<div id="1A" class="letter">1</div>
        
        let letter = document.createElement("div");
        letter.id = i.toString() + letterlist[i - 1];
        letter.innerText = letterlist[i - 1];

        letter.addEventListener("click", selectLetter);

        document.addEventListener('click', (e) => {
            if (e.target.nodeName === 'BODY') {
                letter.classList.remove('letter-selected');  
                letterSelected = null;
            }
        });

        letter.classList.add("letter");
        letter.classList.add("letter-unused");
        document.getElementById("letter-panel").appendChild(letter);
    }


}

function createBoard() {

    // Board

    for (let r = 0; r < 5; r++) {

        for (let c = 0; c < 5; c++) {

            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();

            if (board[r][c] != "-") {

                tile.innerText = board[r][c];
                tile.classList.add("tile-start");

            }

            tile.addEventListener("click", selectTile);
            tile.classList.add("tile");
            document.getElementById("board").append(tile);

            tileArray.push(tile);

        }
    }

}

function selectLetter() {

    // if no letter is selected

    if (letterSelected == null) {

        letterSelected = this;

        // if letter has already been used (greyed-out)

        if (letterSelected.classList.contains("letter-used")) {

            letterSelected = null;

        } else {

            // if letter has not already been used

            this.classList.add("letter-selected");

        }

    } else {

        // if some letter is already selected

        // if selected letter is already selected
        // then deselect the letter

        if (this.classList.contains("letter-selected")) {

            this.classList.remove("letter-selected");
            letterSelected = null;

        } else {

            // if selected letter is not already selected
            // then deselect the first letter and select the new one

            if (this.classList.contains("letter-unused")) {

                letterSelected.classList.remove("letter-selected");
                letterSelected = this;
                this.classList.add("letter-selected");

            }

        }
    }
}

// Check Solution Here
function selectTile() {

    console.log(boardAnswer);

    // only do stuff if we didn't click on one of the provided answer tiles

    if (!this.classList.contains("tile-start")) {

        // if we click on an open tile

        if (!this.classList.contains("tile-used")) {

            // only do stuff if we have a letter selected

            if (letterSelected != null) {

                tileSelected = this;
                tileSelected.innerText = letterSelected.id.slice(-1);
                tileSelected.classList.add("tile-used");

                addBoard(tileSelected.id, letterSelected.id);

                letterSelected.classList.remove("letter-selected");
                letterSelected.innerText = null;
                letterSelected.classList.add("letter-used");
                letterSelected.classList.remove("letter-unused");
                letterSelected = null;

                if (boardAnswer.join('') == checkSolution) {

                    console.log(boardAnswer);

                    tileArray.forEach((t) => t.classList.add("tile-game-done"));

                }

            }

        } else {

            // if we click on a tile with a letter already in it
            // if we do not have a letter selected

            if (letterSelected == null) {

                tileSelected = this;
                removeBoard(tileSelected.id);
                tileSelected.classList.remove("tile-used");
                tileSelected.innerText = null;

            }

        }

        tileSelected = null;
        //console.log(boardArray);
        //console.log(boardAnswer);
        //console.log(boardAnswer.join(''));

    }

}

function addBoard(tileID, letterID) {

    let index = getBoardIndex(tileID);
    boardArray[index] = letterID;
    boardAnswer[index] = letterID.slice(-1);

    if (pairedTileList.includes(tileID)) {

        let pairedTile = getPair(tileID);
        let pairedIndex = getBoardIndex(pairedTile.id);
        boardArray[pairedIndex] = letterID;
        boardAnswer[pairedIndex] = letterID.slice(-1);

        pairedTile.innerText = letterID.slice(-1);
        pairedTile.classList.add("tile-used");
    
    }
    
}

function removeBoard(tileID) {

    let index = getBoardIndex(tileID);

    let letterID = boardArray[index];
    let letter = document.getElementById(letterID);
    letter.classList.remove("letter-used");
    letter.classList.add("letter-unused");
    letter.innerText = letterID.slice(-1);

    if (pairedTileList.includes(tileID)) {

        let pairedTile = getPair(tileID);
        let pairedIndex = getBoardIndex(pairedTile.id);
        pairedTile.classList.remove("tile-used");
        pairedTile.innerText = null;
        boardArray[pairedIndex] = null;
        boardAnswer[pairedIndex] = null;

    }

    boardArray[index] = null;
    boardAnswer[index] = null;

}

function getPair(tileID) {

    pairedTile = null;

    if (tileID == "0-3") { pairedTile = document.getElementById("1-0"); }
    if (tileID == "1-0") { pairedTile = document.getElementById("0-3"); }
    if (tileID == "0-4") { pairedTile = document.getElementById("1-1"); }
    if (tileID == "1-1") { pairedTile = document.getElementById("0-4"); }
    if (tileID == "1-3") { pairedTile = document.getElementById("2-0"); }
    if (tileID == "2-0") { pairedTile = document.getElementById("1-3"); }
    if (tileID == "1-4") { pairedTile = document.getElementById("2-1"); }
    if (tileID == "2-1") { pairedTile = document.getElementById("1-4"); }
    if (tileID == "2-3") { pairedTile = document.getElementById("3-0"); }
    if (tileID == "3-0") { pairedTile = document.getElementById("2-3"); }
    if (tileID == "2-4") { pairedTile = document.getElementById("3-1"); }
    if (tileID == "3-1") { pairedTile = document.getElementById("2-4"); }
    if (tileID == "3-3") { pairedTile = document.getElementById("4-0"); }
    if (tileID == "4-0") { pairedTile = document.getElementById("3-3"); }
    if (tileID == "3-4") { pairedTile = document.getElementById("4-1"); }
    if (tileID == "4-1") { pairedTile = document.getElementById("3-4"); }

    return pairedTile;
}

function getBoardIndex(tileID) {

    let r = parseInt(tileID[0]);
    let c = parseInt(tileID[2]);
    let place = (5 * r) + c;

    return place;

}


// BACK-END FUNCTIONS

function setBoard(words, diff) {

    if (diff == "HARD") {

        let w1_temp = words['words_1'].toUpperCase();
        let w2 = "-----";
        let w3 = "-----";
        let w4 = "-----";
        let w5_temp = words['words_5'].toUpperCase();
    
        let w1_a = w1_temp[0];
        let w1_b = w1_temp[1];
        let w1 = w1_a + w1_b + "---";
    
        let w5_a = w5_temp[3];
        let w5_b = w5_temp[4];
        let w5 = "---" + w5_a + w5_b;
    
        return [w1,w2,w3,w4,w5];
        //return ["LE---","-----","-----","-----","---OR"];

    }

    if (diff == "MEDIUM") {

        let w1_temp = words['words_1'].toUpperCase();
        let w2_temp = words['words_2'].toUpperCase();
        let w3_temp = words['words_3'].toUpperCase();
        let w4_temp = words['words_4'].toUpperCase();
        let w5_temp = words['words_5'].toUpperCase();
    
        let w1_a = w1_temp[0];
        let w1_b = w1_temp[1];
        let w1 = w1_a + w1_b + "---";

        let w2_a = w2_temp[3];
        let w2 = "---" + w2_a + "-";

        let w3_a = w3_temp[0];
        let w3_d = w3_temp[4];
        let w3 = w3_a + "---" + w3_d;

        let w4_b = w4_temp[1];
        let w4 = "-" + w4_b + "---";
    
        let w5_a = w5_temp[3];
        let w5_b = w5_temp[4];
        let w5 = "---" + w5_a + w5_b;

        return [w1,w2,w3,w4,w5];
        //return ["LE---","---A-","A---L","-L---","---OR"];

    }

    if (diff == "EASY") {

        let w1_temp = words['words_1'].toUpperCase();
        let w2_temp = words['words_2'].toUpperCase();
        let w3_temp = words['words_3'].toUpperCase();
        let w4_temp = words['words_4'].toUpperCase();
        let w5_temp = words['words_5'].toUpperCase();
    
        let w1_a = w1_temp[0];
        let w1_b = w1_temp[1];
        let w1 = w1_a + w1_b + "---";

        let w2_a = w2_temp[3];
        let w2_b = w2_temp[4];
        let w2 = "---" + w2_a + w2_b;

        let w3_a = w3_temp[0];
        let w3_b = w3_temp[1];
        let w3_c = w3_temp[3];
        let w3_d = w3_temp[4];
        let w3 = w3_a + w3_b + "-" + w3_c + w3_d;

        let w4_a = w4_temp[0];
        let w4_b = w4_temp[1];
        let w4 = w4_a + w4_b + "---";
    
        let w5_a = w5_temp[3];
        let w5_b = w5_temp[4];
        let w5 = "---" + w5_a + w5_b;
    
        return [w1,w2,w3,w4,w5];
        //return ["LE---","---AN","AN-EL","EL---","---OR"];

    }

}

function setSolution(words) {

    let w1 = words['words_1'].toUpperCase();
    let w2 = words['words_2'].toUpperCase();
    let w3 = words['words_3'].toUpperCase();
    let w4 = words['words_4'].toUpperCase();
    let w5 = words['words_5'].toUpperCase();

    console.log(w1+w2+w3+w4+w5);

    return w1+w2+w3+w4+w5;
    //return "LEMONONSETETHICICIERERROR";

}

function setGivenBoardAnswer() {

    if (difficulty == "HARD") {

        boardAnswer[0] = board[0][0];
        boardAnswer[1] = board[0][1];
        boardAnswer[23] = board[4][3];
        boardAnswer[24] = board[4][4];

    }

    if (difficulty == "MEDIUM") {

        boardAnswer[0] = board[0][0];
        boardAnswer[1] = board[0][1];

        boardAnswer[8] = board[1][3];
        boardAnswer[10] = board[2][0];

        boardAnswer[14] = board[2][4];
        boardAnswer[16] = board[3][1];

        boardAnswer[23] = board[4][3];
        boardAnswer[24] = board[4][4];

    }

    if (difficulty == "EASY") {

        boardAnswer[0] = board[0][0];
        boardAnswer[1] = board[0][1];

        boardAnswer[8] = board[1][3];
        boardAnswer[9] = board[1][4];
        boardAnswer[10] = board[2][0];
        boardAnswer[11] = board[2][1];

        boardAnswer[13] = board[2][3];
        boardAnswer[14] = board[2][4];
        boardAnswer[15] = board[3][0];
        boardAnswer[16] = board[3][1];

        boardAnswer[23] = board[4][3];
        boardAnswer[24] = board[4][4];

    }
}

function setLetterList(words) {

    if (difficulty == "HARD") {

        let w1_temp = words['words_1'].toUpperCase();
        let w1 = w1_temp[2] + w1_temp[3] + w1_temp[4];

        let w2_temp = words['words_2'].toUpperCase();
        let w2 = w2_temp[2] + w2_temp[3] + w2_temp[4];

        let w3_temp = words['words_3'].toUpperCase();
        let w3 = w3_temp[2] + w3_temp[3] + w3_temp[4];

        let w4_temp = words['words_4'].toUpperCase();
        let w4 = w4_temp[2] + w4_temp[3] + w4_temp[4];

        let w5 = words['words_5'].toUpperCase()[2];

        let str = w1+w2+w3+w4+w5;
        let str_shuffle = shuffle(str);
    
        return str_shuffle;

    }

    if (difficulty == "MEDIUM") {

        let w1_temp = words['words_1'].toUpperCase();
        let w1 = w1_temp[2] + w1_temp[3] + w1_temp[4];

        let w2_temp = words['words_2'].toUpperCase();
        let w2 = w2_temp[2] + w2_temp[4];

        let w3_temp = words['words_3'].toUpperCase();
        let w3 = w3_temp[2] + w3_temp[3];

        let w4_temp = words['words_4'].toUpperCase();
        let w4 = w4_temp[2] + w4_temp[3] + w4_temp[4];

        let w5 = words['words_5'].toUpperCase()[2];

        let str = w1+w2+w3+w4+w5;
        let str_shuffle = shuffle(str);
    
        return str_shuffle;

    }

    if (difficulty == "EASY") {

        let w1_temp = words['words_1'].toUpperCase();
        let w1 = w1_temp[2] + w1_temp[3] + w1_temp[4];

        let w2_temp = words['words_2'].toUpperCase();
        let w2 = w2_temp[2];

        let w3_temp = words['words_3'].toUpperCase();
        let w3 = w3_temp[2];

        let w4_temp = words['words_4'].toUpperCase();
        let w4 = w4_temp[2] + w4_temp[3] + w4_temp[4];

        let w5 = words['words_5'].toUpperCase()[2];

        let str = w1+w2+w3+w4+w5;
        let str_shuffle = shuffle(str);
    
        return str_shuffle;

    }

}

function getJSON(object) {

    return JSON.parse(object);

}

function getPuzzleWords(json) {

    var num_puzzles = Object.keys(json).length;
    var puzzle_id = Math.floor(Math.random() * num_puzzles);

    return json[puzzle_id];

}

function shuffle(array) {

    const chars = array.split("");
    chars.sort(() => 0.5 - Math.random());
    const scrambled = chars.join("");
    return scrambled;

}


// BUTTON FUNCTIONS

function onButtonClick() {

    let buttonType = this.id;

    if (buttonType == "clear-button") { onClearButton(); }
    //if (buttonType == "hint-button") { onHintButton(); }
    if (buttonType == "new-button") { onNewButton(); }
    if (buttonType == "difficulty-button") { onDifficultyButton(); }
    if (buttonType == "mode-button") { onModeButton(); }

}

function onClearButton() {

    let tiles = document.querySelectorAll('[class*="tile-used"]');

    tiles.forEach( function (item) {
        
        let index = getBoardIndex(item.id);
        let letterID = boardArray[index];
        let letter = document.getElementById(letterID);

        if (letter.classList.contains("letter-used")) {
            letter.classList.remove("letter-used");
            letter.innerText = letterID.slice(-1);
        }

        boardArray[index] = null;
        boardAnswer[index] = null;

        item.classList.remove("tile-used");
        item.innerText = null;

    });

    let doneTiles = document.querySelectorAll('[class*="tile-game-done"]');

    doneTiles.forEach( function (item) {

        item.classList.remove("tile-game-done");

    });

    let letterRemaining = document.querySelectorAll('[class*="letter-selected"]');

    if (letterRemaining.length != 0) {

        letterRemaining[0].classList.remove("letter-selected");
    }

}

function onNewButton() {

    onClearButton(); // clears board

    words = getPuzzleWords(json);
    board = setBoard(words, difficulty);
    checkSolution = setSolution(words);
    letterlist = setLetterList(words);

    let letters = document.querySelectorAll('[class*="letter"]');

    for (let i = 1; i <= letterlist.length; i++) {

        letters[i-1].id = i.toString() + letterlist[i - 1];
        letters[i-1].innerText = letterlist[i - 1];

        if (!letters[i-1].classList.contains("letter-unused")) {
            letters[i-1].classList.add("letter-unused");
        }

    }

    let tiles = document.querySelectorAll('[class*="tile"]');

    for (let r = 0; r < 5; r++) {

        for (let c = 0; c < 5; c++) {

            let index = (5*r)+c;
            let tile = tiles[index];

            if (board[r][c] != "-") {

                tile.innerText = board[r][c];
                tile.classList.add("tile-start");
            } 
        }
    }

    setGivenBoardAnswer();

}

// STILL WORKING HERE
function onHintButton() {

    let hintLetter = null;
    let tiles = document.querySelectorAll('[class*="tile"]');
    let tileHint = null;

    let tileID = null;
    let letterID = null;

    for (let i = 0; i < tiles.length; i++) {

        if (!tiles[i].classList.contains("tile-start") & !tiles[i].classList.contains("tile-used")) {

            let firstOpen = tiles[i].id;
            let r = "words_" + (parseInt(firstOpen[0])+1);
            let c = parseInt(firstOpen[2]);
            hintLetter = words[r][c].toUpperCase();
            tileHint = document.getElementById(firstOpen);
            tileHint.classList.add("tile-used");
            tileID = firstOpen;

            //tileHint.classList.add("tile-start");
            //tileHint.textContent = hintLetter;

            break;
        }
    }

    let lettersHTML = document.querySelectorAll('[class*="letter"]');

    for (let i = 0; i < lettersHTML.length; i++) {

        if (!lettersHTML[i].classList.contains("letter-used")) {

            if (hintLetter == lettersHTML[i].textContent) {

                letterID = lettersHTML[i].id;
                console.log(hintLetter);
                console.log(lettersHTML[i]);
                break;

            }
        }

    }

    addBoard(tileID, letterID);
    console.log(boardAnswer);

    //console.log(letterlist);

}

function onDifficultyButton() {

    let button = document.querySelectorAll('[id*="difficulty-button"]');
    let buttonText = button[0].innerText;

    if(buttonText == "HARD") {
        button[0].innerText = "MEDIUM";
        difficulty = "MEDIUM";
    } else if (buttonText == "MEDIUM") {
        button[0].innerText = "EASY";
        difficulty = "EASY";
    } else {
        button[0].innerText = "HARD";
        difficulty = "HARD";
    }

    let startTiles = document.querySelectorAll('[class*="tile-start"]');

    startTiles.forEach( function (item) {
        
        item.classList.remove("tile-start");
        item.innerText = null;

    });

    let usedTiles = document.querySelectorAll('[class*="tile-used"]');

    usedTiles.forEach( function (item) {
        
        item.classList.remove("tile-used");
        item.innerText = null;

    });

    letterlist = setLetterList(words);
    createLetterTiles();
    onNewButton();

}

function onModeButton() {

    let button = document.querySelectorAll('[id*="mode-button"]');
    let buttonText = button[0].innerText;

    let buttonFormats = document.querySelectorAll('[class*="button-28"]');
    let letterFormats = document.querySelectorAll('[class*="letter"]');
    let letterUsedFormats = document.querySelectorAll('[class*="letter-used"]');
    let tileFormats = document.querySelectorAll('[class*="tile"]');

    if(buttonText == "NORMAL") {

        button[0].innerText = "LIGHT";
        document.getElementById("header").style.color="black";
        document.body.style.backgroundColor="#e0e0e0";

        buttonFormats.forEach((e) => {
            e.style.borderColor="black";
            e.style.color="black";
        });

        /*
        letterFormats.forEach((e) => {
            e.style.borderColor="#eaeaea";
            e.style.backgroundColor="#eaeaea";
        });
        */

        /*
        letterUsedFormats.forEach((e) => {
            e.style.backgroundColor="#eaeaea";
            e.style.borderColor="#eaeaea";
        });
        */

        /*
        tileFormats.forEach((e) => {
            e.style.borderColor="black";
            e.style.border="solid"
        });
        */

    } else if (buttonText == "LIGHT") {

        button[0].innerText = "DARK";
        document.getElementById("header").style.color="white";
        document.body.style.backgroundColor="#262626";

        buttonFormats.forEach((e) => {
            e.style.borderColor="#ffffff";
            e.style.color="white";
        });

        /*
        letterFormats.forEach((e) => {
            e.style.borderColor="white";
        });
        */

        /*
        tileFormats.forEach((e) => {
            e.style.borderColor="black";
            e.style.border="solid"
        });
        */

    } else {

        button[0].innerText = "NORMAL";
        document.getElementById("header").style.color="white";
        document.body.style.backgroundColor="#1e453e";
        
        buttonFormats.forEach((e) => {
            e.style.borderColor="#ffffff";
            e.style.color="white";
        });

        /*
        letterFormats.forEach((e) => {
            e.style.borderColor="white";
        });
        */

    }


    
}