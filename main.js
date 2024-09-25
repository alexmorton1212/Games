
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

// BACK-END PUZZLE

var json = getJSON(data);
var words = getPuzzleWords(json);
var board = setBoard(words);
var checkSolution = setSolution(words);
var letterlist = setLetterList(words);

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

setGivenBoardAnswer();

window.onload = function () {
    setGame();
}

function setGame() {

    // Letter Tiles

    for (let i = 1; i <= letterlist.length; i++) {

        //<div id="1A" class="letter">1</div>
        
        let letter = document.createElement("div");
        letter.id = i.toString() + letterlist[i - 1];
        letter.innerText = letterlist[i - 1];
        letter.addEventListener("click", selectLetter);
        letter.classList.add("letter");
        document.getElementById("letter-panel").appendChild(letter);
    }

    // Board

    for (let r = 0; r < 5; r++) {

        for (let c = 0; c < 5; c++) {

            let tile = document.createElement("div");
            tile.id = r.toString() + "-" + c.toString();

            if (board[r][c] != "-") {

                tile.innerText = board[r][c];
                tile.classList.add("tile-start");

            } else {

                let ends = [3,4,5,6,8,9,10,11,13,14,15,16,18,19,20,21];
                let index = (5*r)+c;

                if (ends.includes(index)) {
                    tile.classList.add(getColor(tile, index));
                }

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

            letterSelected.classList.remove("letter-selected");
            letterSelected = this;
            this.classList.add("letter-selected");

        }
    }
}

function selectTile() {

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
                letterSelected = null;

                if (boardAnswer.join('') == checkSolution) {

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

                //getNumber(tileSelected);

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

// STILL WORKING HERE

function getColor(tile, index) {

    
    if (index == 3 || index == 5) {return "tile-ends-1";}
    if (index == 4 || index == 6) {return "tile-ends-2";}
    if (index == 8 || index == 10) {return "tile-ends-3";}
    if (index == 9 || index == 11) {return "tile-ends-4";}
    if (index == 13 || index == 15) {return "tile-ends-5";}
    if (index == 14 || index == 16) {return "tile-ends-6";}
    if (index == 18 || index == 20) {return "tile-ends-7";}
    if (index == 19 || index == 21) {return "tile-ends-8";}
    

    /*
    if (index == 3 || index == 5) {tile.innerText = 1; return "tile-ends-1";}
    if (index == 4 || index == 6) {tile.innerText = 2; return "tile-ends-2";}
    if (index == 8 || index == 10) {tile.innerText = 3; return "tile-ends-3";}
    if (index == 9 || index == 11) {tile.innerText = 4; return "tile-ends-4";}
    if (index == 13 || index == 15) {tile.innerText = 5; return "tile-ends-5";}
    if (index == 14 || index == 16) {tile.innerText = 6; return "tile-ends-6";}
    if (index == 18 || index == 20) {tile.innerText = 7; return "tile-ends-7";}
    if (index == 19 || index == 21) {tile.innerText = 8; return "tile-ends-8";}
    */

}

// STILL WORKING HERE

function getNumber(tile) {

    index = getBoardIndex(tile.id);

    if (index == 3 || index == 5) {tile.innerText = 1; return "tile-ends-1";}
    if (index == 4 || index == 6) {tile.innerText = 2; return "tile-ends-2";}
    if (index == 8 || index == 10) {tile.innerText = 3; return "tile-ends-3";}
    if (index == 9 || index == 11) {tile.innerText = 4; return "tile-ends-4";}
    if (index == 13 || index == 15) {tile.innerText = 5; return "tile-ends-5";}
    if (index == 14 || index == 16) {tile.innerText = 6; return "tile-ends-6";}
    if (index == 18 || index == 20) {tile.innerText = 7; return "tile-ends-7";}
    if (index == 19 || index == 21) {tile.innerText = 8; return "tile-ends-8";}

}

// DATA BASED FUNCTION

function setBoard(words) {

    let w1_temp = words['words_1'].toUpperCase();
    let w2 = "-----";
    let w3 = "-----";
    let w4 = "-----";
    //let w2_temp = words['words_2'].toUpperCase();
    //let w3_temp = words['words_3'].toUpperCase();
    //let w4_temp = words['words_4'].toUpperCase();
    let w5_temp = words['words_5'].toUpperCase();

    let w1_a = w1_temp[0];
    let w1_b = w1_temp[1];
    let w1 = w1_a + w1_b + "---";

    //let w2_a = w2_temp[4];
    //let w2 = "----" + w2_a;

    //let w3_a = w3_temp[3];
    //let w3_b = w3_temp[4];
    //let w3 = w3_a + "---" + w3_b;

    //let w4_a = w4_temp[0];
    //let w4 = w4_a + "----";

    let w5_a = w5_temp[3];
    let w5_b = w5_temp[4];
    let w5 = "---" + w5_a + w5_b;

    return [w1,w2,w3,w4,w5];

    //return ["LE---","-----","-----","-----","---OR"];

}

function setSolution(words) {

    let w1 = words['words_1'].toUpperCase();
    let w2 = words['words_2'].toUpperCase();
    let w3 = words['words_3'].toUpperCase();
    let w4 = words['words_4'].toUpperCase();
    let w5 = words['words_5'].toUpperCase();

    console.log(w1+w2+w3+w4+w5);

    //return ["LEMON","ONSET","ETHIC","ICIER","ERROR"];
    return w1+w2+w3+w4+w5;
    //return "LEMONONSETETHICICIERERROR";

}

function setGivenBoardAnswer() {

    boardAnswer[0] = board[0][0];
    boardAnswer[1] = board[0][1];
    boardAnswer[23] = board[4][3];
    boardAnswer[24] = board[4][4];
}

function setLetterList(words) {

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

// BUTTONS

function onButtonClick() {

    let buttonType = this.id;

    if (buttonType == "clear-button") { onClearButton(); }
    if (buttonType == "hint-button") { onHintButton(); }
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
    board = setBoard(words);
    checkSolution = setSolution(words);
    letterlist = setLetterList(words);

    let letters = document.querySelectorAll('[class*="letter"]');

    for (let i = 1; i <= letterlist.length; i++) {

        letters[i-1].id = i.toString() + letterlist[i - 1];
        letters[i-1].innerText = letterlist[i - 1];

    }

    let tiles = document.querySelectorAll('[class*="tile"]');

    for (let r = 0; r < 5; r++) {

        for (let c = 0; c < 5; c++) {

            let index = (5*r)+c;
            let tile = tiles[index];

            if (board[r][c] != "-") {

                tile.innerText = board[r][c];
            } 
        }
    }

    setGivenBoardAnswer();

}

// STILL WORKING HERE

function onHintButton() {

    let hintLetter = null;

    let tiles = document.querySelectorAll('[class*="tile"]');

    for (let i = 0; i < tiles.length; i++) {

        if (!tiles[i].classList.contains("tile-start")) {

            let firstOpen = tiles[i].id;
            let r = "words_" + (parseInt(firstOpen[0])+1);
            let c = parseInt(firstOpen[2]);
            hintLetter = words[r][c].toUpperCase();

            break;
        }
    }

    let lettersHTML = document.querySelectorAll('[class*="letter"]');

    for (let i = 0; i < lettersHTML.length; i++) {

        if (!lettersHTML[i].classList.contains("letter-used")) {

            if (hintLetter == lettersHTML[i].textContent) {

                console.log(hintLetter);
                console.log(lettersHTML[i]);
                break;

            }
        }

    }

    

    //console.log(letterlist);

}

function onDifficultyButton() {

    let button = document.querySelectorAll('[id*="difficulty-button"]');
    let buttonText = button[0].innerText;

    if(buttonText == "HARD") {
        button[0].innerText = "EASY";
    } else if (buttonText == "EASY") {
        button[0].innerText = "MEDIUM";
    } else {
        button[0].innerText = "HARD"
    }

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