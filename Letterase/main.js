
/****************************************/
/* GLOBAL VARIABLES */
/****************************************/

// can ignore this error if it appears, "with" is a function from another package (I think)
import solutionDataJSON from "./Data/single_data.json" with {type: "json"};
const solutionData = JSON.parse(solutionDataJSON);

let initialGameboard = [];
for (let i of document.querySelectorAll('.tile')) { initialGameboard.push(Array.from(i.classList)); }

let modeValue = document.querySelector('input[name="x"]:checked').value;
let letterList = [];
let puzzle = {};
let letterSelectedBool = 0;
let letterSelectedDiv = '';
let hintCount = 1;
let gameComplete = 0;
let timeoutTime = 1400;

// can ignore this error if it appears, "with" is a function from another package (I think)
import wordListArray from "./Data/single_word_list.json" with {type: "json"};

// prevents double tapping to zoom on ios mobile (happened frequently when trying to place letters)
document.ondblclick = function(e) { e.preventDefault(); }

/****************************************/
/* DATA: Solutions, Letter List */
/****************************************/

function setRandomPuzzle(json) {
    var num_puzzles = Object.keys(json).length;
    var puzzle_id = Math.floor(Math.random() * num_puzzles);
    puzzle = json[puzzle_id];
}

function getLetterList() {

    letterList = [];
    for (let i = 0; i < 5; i++) {
        let wordField = 'words_' + (i+1);
        let word = puzzle[wordField];
        for (let l in word) {
            letterList.push(word[l].toUpperCase());
        }
    }
}

setRandomPuzzle(solutionData); // create initial puzzle
getLetterList(); // create initial letter list


/****************************************/
/* KEYBOARD: Set Up */
/****************************************/

function shuffle(array) {

    for (let i = array.length - 1; i >= 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
}

function getKeyboardLetters() {

    let keyboardList = letterList;
    let indicesToKeep = [];

    if (modeValue == 'Easy') { indicesToKeep = [2,3,4,6,7,12,13,14,16,17]; } // should be 10 indices in array (# of keyboard letters)
    if (modeValue == 'Med') { indicesToKeep = [2,3,4,6,7,8,11,12,13,14,16,17]; } // should be 12 indices in array (# of keyboard letters)
    if (modeValue == 'Hard') { indicesToKeep = [2,3,4,6,7,8,9,11,12,13,14,16,17]; } // should be 13 indices in array (# of keyboard letters)
    
    return(shuffle(keyboardList.filter((_, index) => indicesToKeep.includes(index))));
}

function setKeyboard() {

    let keyboardLetters = getKeyboardLetters();

    if (modeValue == 'Easy') { 
        let easyIndices = [2,3,4,5,6,9,10,11,12,13]; // should have length = 10
        for (let i = 0; i < easyIndices.length; i++) {
            document.getElementById('letter-'+easyIndices[i]).innerHTML = keyboardLetters[i];
        }
    }
    
    if (modeValue == 'Med') {
        let medIndices = [1,2,3,4,5,6,7,9,10,11,12,13]; // should have length = 12
        for (let i = 0; i < medIndices.length; i++) {
            document.getElementById('letter-'+medIndices[i]).innerHTML = keyboardLetters[i];
        }
    }

    if (modeValue == 'Hard') { 
        let hardIndices = [1,2,3,4,5,6,7,8,9,10,11,12,13]; // should have length = 13
        for (let i = 0; i < hardIndices.length; i++) {
            document.getElementById('letter-'+hardIndices[i]).innerHTML = keyboardLetters[i];
        }
    }

}

function makeKeyboardClickable() {

    for (let kletter of document.querySelectorAll(".letter")) {
        kletter.addEventListener("click", clickKeyboard);
    }
}

function disableKeyboard() {

    let letterQ = document.querySelectorAll('.letter');
    for(let q of letterQ) { q.removeEventListener("click", clickKeyboard); };
}

function enableKeyboard() {

    let letterQ = document.querySelectorAll('.letter');
    for(let q of letterQ) { q.addEventListener("click", clickKeyboard); };
}

function clickKeyboard() {

    // if a letter is not already selected
    if (letterSelectedBool == 0) {

        // if selected letter is not already used
        if (!this.classList.contains('letter-used')) {
            this.classList.add('letter-selected');
            this.classList.remove('letter-unused');
            letterSelectedBool = 1;
            letterSelectedDiv = this;
        }

    // if a letter is already selected
    } else {

        // if we click the same selected letter again --> unselect
        if (this.classList.contains('letter-selected')) {
            this.classList.remove('letter-selected');
            this.classList.add('letter-unused');
            letterSelectedBool = 0;
            letterSelectedDiv = '';
    
        } else {

            // if we click another unused letter --> unselect old, select new
            if (this.classList.contains('letter-unused')) {
                letterSelectedDiv.classList.remove('letter-selected');
                letterSelectedDiv.classList.add('letter-unused');
                this.classList.add('letter-selected');
                this.classList.remove('letter-unused');
                letterSelectedBool = 1;
                letterSelectedDiv = this;

            } else {

                // if we try selecting a used letter --> unselect
                if (this.classList.contains('letter-used')) {
                    letterSelectedDiv.classList.remove('letter-selected');
                    letterSelectedDiv.classList.add('letter-unused');
                    letterSelectedBool = 0;
                    letterSelectedDiv = '';
                }
            }
        }
    }
}

setKeyboard(); // populate initial keyboard letters
makeKeyboardClickable(); // add event listeners to keyboard letters


/****************************************/
/* GAMEBOARD: Set Up */
/****************************************/

function getGameboardLetters() {

    let gameboardList = letterList;
    let indicesToKeep = [];
    //if (modeValue == 'Easy') { indicesToKeep = [0,4,5,9,10,14,15,19,20,24]; }
    //if (modeValue == 'Med') { indicesToKeep = [0,1,9,10,14,15,18,19]; }
    //if (modeValue == 'Hard') { indicesToKeep = [0,1,18,19]; }
    if (modeValue == 'Easy') { indicesToKeep = [0,1,9,10,8,11,18,19]; }
    if (modeValue == 'Med') { indicesToKeep = [0,1,9,10,18,19]; }
    if (modeValue == 'Hard') { indicesToKeep = [0,1,18,19]; }
    return(gameboardList.filter((_, index) => indicesToKeep.includes(index)));
}

function setGameboard() {

    let gameboardLetters = getGameboardLetters();

    // full list of potential static tiles
    let tileIndices = [1,2,9,10,11,12,19,20];
    let indexCount = 0;

    if (modeValue == 'Easy') { 
        for (let i = 0; i < tileIndices.length; i++) {
            document.getElementById('tile-'+tileIndices[i]).innerHTML = gameboardLetters[i];
            document.getElementById('tile-'+tileIndices[i]).classList.add('tile-static');
            document.getElementById('tile-'+tileIndices[i]).classList.remove('tile-unused');
        }
    }
    
    if (modeValue == 'Med') { 
        let mediumTileBlanks = [9,12];
        for (let i = 0; i < tileIndices.length; i++) {
            if (mediumTileBlanks.includes(tileIndices[i])) {
                document.getElementById('tile-'+tileIndices[i]).innerHTML = '';
                document.getElementById('tile-'+tileIndices[i]).classList.remove('tile-static');
                document.getElementById('tile-'+tileIndices[i]).classList.add('tile-unused');
            } else {
                document.getElementById('tile-'+tileIndices[i]).innerHTML = gameboardLetters[indexCount]; indexCount++;
                document.getElementById('tile-'+tileIndices[i]).classList.add('tile-static');
                document.getElementById('tile-'+tileIndices[i]).classList.remove('tile-unused');
            }
        }
    }

    if (modeValue == 'Hard') { 
        let hardTileBlanks = [9,10,11,12];
        for (let i = 0; i < tileIndices.length; i++) {
            if (hardTileBlanks.includes(tileIndices[i])) {
                document.getElementById('tile-'+tileIndices[i]).innerHTML = '';
                document.getElementById('tile-'+tileIndices[i]).classList.remove('tile-static');
                document.getElementById('tile-'+tileIndices[i]).classList.add('tile-unused');
            } else {
                document.getElementById('tile-'+tileIndices[i]).innerHTML = gameboardLetters[indexCount]; indexCount++;
                document.getElementById('tile-'+tileIndices[i]).classList.add('tile-static');
                document.getElementById('tile-'+tileIndices[i]).classList.remove('tile-unused');
            }
        }
    }

}

function disableGameboard() {

    document.removeEventListener('click', makeGameboardClickable);
}

function enableGameboard() {

    document.addEventListener('click', makeGameboardClickable);
}

setGameboard(); // populate initial gameboard letters


/****************************************/
/* KEYBOARD + GAMEBOARD: Interactions */
/****************************************/

const pairsDictionary = {
    'tile-5': 'tile-6', 'tile-6': 'tile-5',
    'tile-10': 'tile-11', 'tile-11': 'tile-10',
    'tile-15': 'tile-16', 'tile-16': 'tile-15',
    'tile-20': 'tile-21', 'tile-21': 'tile-20',
};

function addPairedLetter(etid) {

    let targetPair = document.getElementById(pairsDictionary[etid]);
    targetPair.innerHTML = letterSelectedDiv.innerHTML;
    targetPair.classList.add(letterSelectedDiv.id);
    targetPair.classList.remove("tile-unused");
    targetPair.classList.add("tile-used");
}

function removePairedLetter(tlid, etid) {

    let targetPair = document.getElementById(pairsDictionary[etid]);
    targetPair.innerHTML = '';
    targetPair.classList.remove(tlid);
    targetPair.classList.remove('tile-used');
    targetPair.classList.add('tile-unused');
}

function makeGameboardClickable(e) {

    // if a letter on the keyboard is currently selected
    if (letterSelectedBool == 1) {
    
        // if we click on something other than the keyboard
        // keyboard cases get handled in the Keyboard Setup section
        if (!e.target.classList.contains('letter')) {

            // if we clicked an unused gameboard tile --> add to gameboard, remove from keyboard
            if (e.target.classList.contains('tile-unused')) {

                e.target.innerHTML = letterSelectedDiv.innerHTML;
                e.target.classList.add(letterSelectedDiv.id);
                e.target.classList.remove("tile-unused");
                e.target.classList.add("tile-used");

                // if tile we clicked on has a matching pair
                if (e.target.classList.contains('pair')) { addPairedLetter(e.target.id); }

                letterSelectedDiv.classList.remove('letter-selected');
                letterSelectedDiv.classList.add('letter-used');
                letterSelectedDiv.innerHTML = '';
                letterSelectedBool = 0;
                letterSelectedDiv = '';

                // check if all letters have been used / if solutions are correct
                if (document.querySelectorAll('.letter-unused').length == 0) { checkGameWin(); }

            // if we click on something other than an unused tile
            } else {

                // if we click on a used, static, or hint tile --> do nothing on board, keep keyboard letter selected
                // if we click on a tile-row --> also do nothing on board, keep keyboard letter selected
                // otherwise --> unselect keyboard letter
                if(!e.target.classList.contains('tile-used') 
                & !e.target.classList.contains('tile-static') 
                & !e.target.classList.contains('tile-hint') 
                & !e.target.classList.contains('tile-row')) {
                    letterSelectedDiv.classList.remove('letter-selected');
                    letterSelectedDiv.classList.add('letter-unused');
                    letterSelectedBool = 0;
                    letterSelectedDiv = '';
                }
            }    
        }
    
    // if there is NO letter selected on keyboard
    } else {

        // if tile is used --> remove tile from gameboard, add back letter to keyboard
        // also do nothing if game is successfully completed (tile-complete)
        // otherwise do nothing
        if (e.target.classList.contains('tile-used') & !e.target.classList.contains('tile-complete')) {

            let tileLetterId = Array.from(e.target.classList).find(c => /letter/.test(c));
            let keyboardLetter = document.getElementById(tileLetterId);
            keyboardLetter.innerHTML = e.target.innerHTML;
            keyboardLetter.classList.remove('letter-used');
            keyboardLetter.classList.add('letter-unused');
            e.target.innerHTML = '';
            e.target.classList.remove(tileLetterId);
            e.target.classList.remove('tile-used');
            e.target.classList.add('tile-unused');

            // if tile we clicked on has a matching pair
            if (e.target.classList.contains('pair')) { removePairedLetter(tileLetterId, e.target.id); }

        }
    }
}

function setupBoardInteractions() {

    document.addEventListener('click', makeGameboardClickable);

}

function checkGameWin() {

    let usedTiles = document.querySelectorAll('.tile');
    let answerWordList = [];

    for (let i = 0; i < 4; i++) {
        let answerWord = '';
        for (let j = 0; j < 5; j++) { answerWord += usedTiles[(5*i)+j].innerHTML; }
        answerWordList.push(answerWord);
    }

    if (answerWordList.every(word => wordListArray.includes(word))) {
        usedTiles.forEach(tile => { tile.classList.add('tile-complete'); });
        gameComplete = 1;

        for (let j = 1; j <= 4; j++) {
            document.getElementById('modal-word-' + j).innerHTML = answerWordList[j-1];
        }

        //document.getElementById('title-letterase').style.color = 'rgb(142, 175, 142)';
        openGameDoneModal();
    }
}

setupBoardInteractions();


/****************************************/
/* MODAL: How To (Instructions) */
/****************************************/

function openHowToModal() {
    document.getElementById('howto-modal').classList.add('open');
    document.body.classList.add('jw-modal-open');
}

function closeHowToModal() {
    document.querySelector('.jw-modal.open').classList.remove('open');
    document.body.classList.remove('jw-modal-open');
}

function setupHowToModal() {

    document.addEventListener('click', event => {
        if (event.target.id == 'howto-open-id') { openHowToModal(); }
        if (event.target.id == 'howto-close-id') { closeHowToModal(); }
        if (event.target.id == 'howto-modal') { closeHowToModal(); }
        if (event.target.classList.contains("howto-modal")) { closeHowToModal(); }
    });

    document.addEventListener('mouseover', function(event) {
        if (event.target.classList.contains('howto-match')) {
            let hoveredIdList = document.querySelectorAll(`#${event.target.id}`);
            for (let e of hoveredIdList) { e.classList.add('howto-highlight'); }
        }
    });

    document.addEventListener('mouseout', function(event) {
        if (event.target.classList.contains('howto-match')) {
            let hoveredIdList = document.querySelectorAll(`#${event.target.id}`);
            for (let e of hoveredIdList) { e.classList.remove('howto-highlight'); }
        }
    });

}

setupHowToModal();


/****************************************/
/* MODAL: Game Completed */
/****************************************/

function openGameDoneModal() {
    document.getElementById('gamedone-modal').classList.add('open');
    document.body.classList.add('jw-modal-open');
}

function closeGameDoneModal() {
    document.querySelector('.jw-modal.open').classList.remove('open');
    document.body.classList.remove('jw-modal-open');
}

function setupGameDoneModal() {
    document.addEventListener('click', event => {
        if (event.target.id == 'gamedone-close-id') { closeGameDoneModal(); }
        if (event.target.id == 'gamedone-modal') { closeGameDoneModal(); }
        if (event.target.classList.contains("gamedone-modal")) { closeGameDoneModal(); }
        if (event.target.id == 'gamedone-play-id') { 
            closeGameDoneModal();
            onNewButtonClick();
        }
    });
}

setupGameDoneModal();


/****************************************/
/* RADIO BUTTON: [Easy, Med, Hard] */
/****************************************/

const letter1 = document.createElement('div');
letter1.classList.add('letter', 'letter-unused'); letter1.id = 'letter-1';
//const letter6 = document.createElement('div');
//letter6.classList.add('letter', 'letter-unused'); letter6.id = 'letter-6';
const letter7 = document.createElement('div');
letter7.classList.add('letter', 'letter-unused'); letter7.id = 'letter-7';
const letter8 = document.createElement('div');
letter8.classList.add('letter', 'letter-unused'); letter8.id = 'letter-8';

function setupModeRadio() {

    let modeValueList = document.querySelectorAll('input[name="x"]');
    
    for(let m of modeValueList) {
        m.addEventListener("change", function(event) {
            modeValue = event.target.value;
            changeMode(modeValue);
        });
    }
}

function disableModeRadio() {

    let modeValueList = document.querySelectorAll('input[name="x"]');
    for(let m of modeValueList) { m.disabled = true; };
}

function enableModeRadio() {

    let modeValueList = document.querySelectorAll('input[name="x"]');
    for(let m of modeValueList) { m.disabled = false; };
}

function changeMode(mode) {

    if (mode == 'Easy') {

        if (document.getElementById('letter-1')) {
            document.getElementById('letter-1').remove();
            document.getElementById('letter-7').remove();
            //document.getElementById('letter-6').remove();
        }
        if (document.getElementById('letter-8')) {
            //document.getElementById('letter-7').remove();
            document.getElementById('letter-8').remove();
        }
    }

    if (mode == 'Med') {
        // if we go from Hard to Med (remove letter 8)
        if (document.getElementById('letter-1')) {
            document.getElementById('letter-8').remove();
        } else {
            // if we go from Easy to Med (add letters 1 & 7)
            let row1 = document.getElementById("letter-row-1");
            let firstLetter1 = row1.children[0];
            row1.insertBefore(letter1, firstLetter1);
            let row2 = document.getElementById("letter-row-2");
            let firstLetter2 = row2.children[0];
            row2.insertBefore(letter7, firstLetter2);
        }
    }

    if (mode == 'Hard') {
        // if we go from Easy to Hard (add letter 1 to row 1 and letters 7 & 8 to row 2)
        if (!document.getElementById('letter-1')) {
            let row1 = document.getElementById("letter-row-1");
            let firstLetter1 = row1.children[0];
            row1.insertBefore(letter1, firstLetter1);
            let row2 = document.getElementById("letter-row-2");
            let firstLetter2 = row2.children[0];
            row2.insertBefore(letter8, firstLetter2);
            row2.insertBefore(letter7, firstLetter2);
        }
        // if we go from Med to Hard (add letter 8 to row 2)
        if (!document.getElementById('letter-8')) {
            let row2 = document.getElementById("letter-row-2");
            let secondLetter2 = row2.children[1];
            row2.insertBefore(letter8, secondLetter2);
        }
    }

    setKeyboard(); // need to update keyboard
    setGameboard(); // need to update gameboard
    makeKeyboardClickable(); // make keyboard tiles clickable
    onNewButtonClick();

}

setupModeRadio();


/****************************************/
/* RADIO BUTTON: [Light, Dark] */
/****************************************/

function setupDisplayRadio() {

    let displayValue = document.querySelector('input[name="y"]:checked').value;
    let displayValueList = document.querySelectorAll('input[name="y"]');

    for(let d of displayValueList) {
        d.addEventListener("change", function(event) {
            displayValue = event.target.value;
            changeDisplay(displayValue);
        });
    }
}

function changeDisplay(v) {

    if (v == 'Light') { 
        document.documentElement.style.setProperty('--background-color', 'rgb(224, 224, 224)');
        document.documentElement.style.setProperty('--accent-color', 'rgb(82, 82, 82)'); 
        document.documentElement.style.setProperty('--accent-highlight', 'rgb(104, 134, 104)'); 
        document.documentElement.style.setProperty('--button-hover-color', 'rgb(179, 179, 179)');
        //document.documentElement.style.setProperty('--letter-hover-color', 'rgb(255, 204, 110)'); 
        //document.documentElement.style.setProperty('--letter-hover-border', 'rgb(255, 123, 0)'); 
    }
    if (v == 'Dark') { 
        document.documentElement.style.setProperty('--background-color', 'rgb(45, 45, 45)');
        document.documentElement.style.setProperty('--accent-color', 'rgb(172, 172, 172)'); 
        document.documentElement.style.setProperty('--accent-highlight', 'rgb(179, 179, 179)'); 
        document.documentElement.style.setProperty('--button-hover-color', 'rgb(82, 82, 82)');
        //document.documentElement.style.setProperty('--letter-hover-color', 'rgb(181, 168, 156)'); 
        //document.documentElement.style.setProperty('--letter-hover-border', 'white'); 
    }
}

setupDisplayRadio();


/****************************************/
/* BUTTON: Clear */
/****************************************/

const clearButton = document.querySelector('#clear');
clearButton.addEventListener('click', onClearButtonClick);

function disableClearButton() { 
    clearButton.disabled = true; 
}

function enableClearButton() { 
    clearButton.disabled = false; 
}

function onClearButtonClick() {

    if (gameComplete == 0) {

        let clearElements = document.querySelectorAll('.tile-used');

        for (let t of clearElements) {
            let tileLetterId = Array.from(t.classList).find(c => /letter/.test(c));
            let keyboardLetter = document.getElementById(tileLetterId);
            if (keyboardLetter.classList.contains('letter-used')) {
                keyboardLetter.innerHTML = t.innerHTML;
                keyboardLetter.classList.remove('letter-used');
                keyboardLetter.classList.add('letter-unused');
            }
            t.innerHTML = '';
            t.classList.remove(tileLetterId);
            t.classList.remove('tile-used');
            t.classList.add('tile-unused');
        }
    }
}

/****************************************/
/* BUTTON: Hint */
/****************************************/

const hintButton = document.querySelector('#hint');
hintButton.addEventListener('click', onHintButtonClick);

function removeHintTiles(tileNum) {

    // remove letter in its place
    let tileLetterId = Array.from(tileNum.classList).find(c => /letter/.test(c));
    let keyboardLetter = document.getElementById(tileLetterId);
    keyboardLetter.innerHTML = tileNum.innerHTML;
    keyboardLetter.classList.remove('letter-used');
    keyboardLetter.classList.add('letter-unused');
    tileNum.innerHTML = '';
    tileNum.classList.remove(tileLetterId);
    tileNum.classList.remove('tile-used');
    tileNum.classList.add('tile-unused');
    // if tile we clicked on has a matching pair
    if (tileNum.classList.contains('pair')) { removePairedLetter(tileLetterId, tileNum.id); }

}

function disableHintButton() { 
    hintButton.disabled = true; 
}

function enableHintButton() { 
    hintButton.disabled = false; 
}

function doHintLogic(modeHintTiles) {

    // prevent rapidly clicking hint then switching difficulty / clicking new game
    disableModeRadio(); setTimeout(() => { enableModeRadio(); }, timeoutTime);
    disableNewButton(); setTimeout(() => { enableNewButton(); }, timeoutTime);
    disableCheckButton(); setTimeout(() => { enableCheckButton(); }, timeoutTime);
    disableClearButton(); setTimeout(() => { enableClearButton(); }, timeoutTime);
    disableKeyboard(); setTimeout(() => { enableKeyboard(); }, timeoutTime);
    disableGameboard(); setTimeout(() => { enableGameboard(); }, timeoutTime);

        // unselect letter from keyboard before doing any hint logic
        if (letterSelectedBool == 1) {
            letterSelectedDiv.classList.remove('letter-selected');
            letterSelectedDiv.classList.add('letter-unused');
            letterSelectedBool = 0;
            letterSelectedDiv = '';
        }

    for (let i = 0; i < modeHintTiles.length; i++) {

        // check if potential hint tiles are already static or a hint (from check)
        if (!modeHintTiles[i][0].classList.contains('tile-static') 
        & !modeHintTiles[i][0].classList.contains('tile-hint')) {

            // search keyboard for hint letter
            let keyboardHintLetters = document.querySelectorAll('.letter-unused');
            let keyboardMatchFound = 0;
            for (let k of keyboardHintLetters) {
                if (modeHintTiles[i][1] == k.innerHTML) {
                    k.classList.remove('letter-unused');
                    k.classList.add('letter-used');
                    k.innerHTML = '';
                    keyboardMatchFound = 1;
                    break;
                }
            }

            // search gameboard for hint letter if not on keyboard
            if (keyboardMatchFound == 0) {
                let gameboardHintLetters = document.querySelectorAll('.tile-used');
                // remove tile from gameboard
                for (let g of gameboardHintLetters) {
                    if (modeHintTiles[i][1] == g.innerHTML) {
                        let tileLetterId = Array.from(g.classList).find(c => /letter/.test(c));
                        g.innerHTML = '';
                        g.classList.remove(tileLetterId);
                        g.classList.remove('tile-used');
                        g.classList.add('tile-unused');
                        if (g.classList.contains('pair')) { removePairedLetter(tileLetterId, g.id); }
                        break;
                    }
                }
            }

            // add hint tile to gameboard
            modeHintTiles[i][0].classList.add('hint-flash-correct');
            modeHintTiles[i][0].innerHTML = modeHintTiles[i][1];
            setTimeout(() => { 
                modeHintTiles[i][0].classList.add('tile-hint');
                modeHintTiles[i][0].classList.remove('hint-flash-correct');
                modeHintTiles[i][0].classList.remove('tile-unused');
            }, 950);

            // if tile is a pair
            if (modeHintTiles[i][0].classList.contains('pair')) {
                let targetPair = document.getElementById(pairsDictionary[modeHintTiles[i][0].id]);
                targetPair.classList.add('hint-flash-correct');
                targetPair.innerHTML = modeHintTiles[i][1];
                setTimeout(() => {
                    targetPair.classList.add('tile-hint');
                    targetPair.classList.remove('hint-flash-correct');
                    targetPair.classList.remove('tile-unused');
                }, 950);
            }
        }
    }
}

// if we have used all hints, grey out hint button and make unclickable
// if we have not used all hints, keep hint button clickable
function decideHintClickable() {

    if (hintCount == 3) {
        hintButton.removeEventListener('click', onHintButtonClick);
        hintButton.classList.add('button-off');
    } else {
        hintButton.addEventListener('click', onHintButtonClick);
        hintButton.classList.remove('button-off');
    }

}

// first click adds letters from Medium mode, second click adds letters from Easy mode
function onHintButtonClick() {

    // second (final) hint
    if (hintCount == 2 & gameComplete == 0) {
        hintCount++;
        let tile9 = document.getElementById('tile-9');
        let tile12 = document.getElementById('tile-12');
        let easyHintTiles = [[tile9, letterList[8]], [tile12, letterList[11]]];
        if(tile9.classList.contains('tile-used')) { removeHintTiles(tile9); }
        if(tile12.classList.contains('tile-used')) { removeHintTiles(tile12); }
        doHintLogic(easyHintTiles);
        decideHintClickable();
    }

    // first hint
    if (hintCount == 1 & gameComplete == 0) {
        hintCount++;
        let tile10 = document.getElementById('tile-10');
        // removes tiles where hint will go, adds letters back to keyboard
        if(tile10.classList.contains('tile-used')) { removeHintTiles(tile10); }
        let mediumHintTiles = [[tile10, letterList[9]]];
        doHintLogic(mediumHintTiles);
    }
}


/****************************************/
/* BUTTON: Check */
/****************************************/

const checkButton = document.querySelector('#check');
checkButton.addEventListener('click', onCheckButtonClick);

function disableCheckButton() { 
    checkButton.disabled = true; 
}

function enableCheckButton() { 
    checkButton.disabled = false; 
}

function onCheckButtonClick() {

    if (gameComplete == 0) {

        // prevent rapidly clicking hint then trying to hit other buttons
        disableModeRadio(); setTimeout(() => { enableModeRadio(); }, timeoutTime);
        disableNewButton(); setTimeout(() => { enableNewButton(); }, timeoutTime);
        disableHintButton(); setTimeout(() => { enableHintButton(); }, timeoutTime);
        disableClearButton(); setTimeout(() => { enableClearButton(); }, timeoutTime);
        disableKeyboard(); setTimeout(() => { enableKeyboard(); }, timeoutTime);
        disableGameboard(); setTimeout(() => { enableGameboard(); }, timeoutTime);

        // unselect letter from keyboard before doing any check logic
        if (letterSelectedBool == 1) {
            letterSelectedDiv.classList.remove('letter-selected');
            letterSelectedDiv.classList.add('letter-unused');
            letterSelectedBool = 0;
            letterSelectedDiv = '';
        }

        let allTiles = document.querySelectorAll('.tile');
        for (let i = 0; i < 20; i++) {
            if (!allTiles[i].classList.contains('tile-static') & !allTiles[i].classList.contains('tile-hint')) {
                if (allTiles[i].innerHTML == letterList[i]) {
                    allTiles[i].classList.add('check-flash-correct');
                    setTimeout(() => {
                        allTiles[i].classList.remove('tile-used');
                        allTiles[i].classList.add('tile-hint');
                        allTiles[i].classList.remove('check-flash-correct'); 
                    }, 950);
                } else {
                    if (allTiles[i].classList.contains('tile-used')) {
                        allTiles[i].classList.add('check-flash-wrong');
                        setTimeout(() => { 
                            allTiles[i].classList.remove('check-flash-wrong'); 
                        }, 950);
                    }
                }
            }
        }
    }

    setTimeout(() => { 
        // if check button has been used to fill in all hint tiles, make hint button unclickable
        let hintTilesIndex = [5,6,10,11,15,16];
        let hintTilesCount = 0;
        for (let i of hintTilesIndex) { 
            if (document.getElementById('tile-' + i).classList.contains('tile-hint') || 
            document.getElementById('tile-' + i).classList.contains('tile-static')) { hintTilesCount++; } }
        if (hintTilesCount == hintTilesIndex.length) { hintCount = 3; decideHintClickable(); }
    }, 950);

}


/****************************************/
/* BUTTON: New */
/****************************************/

const newButton = document.querySelector('#new');
newButton.addEventListener('click', onNewButtonClick);

function findClassToRemove(arr1, arr2) {
    return arr2.filter(element => !arr1.includes(element));
}

function disableNewButton() { 
    newButton.disabled = true; 
}

function enableNewButton() { 
    newButton.disabled = false; 
}

function onNewButtonClick() {

    // reset game status
    gameComplete = 0;

    // reset hint count
    // replace this with 'hintCount = 1;' if using other hint (other-hint-logic.js) function
    if (modeValue == "Easy") { hintCount = 3; } 
    else if (modeValue == "Med") { hintCount = 2; }
    else { hintCount = 1; }

    // reset game complete modal words
    for (let m = 1; m <= 4; m++) { document.getElementById('modal-word-' + m).innerHTML = ''; }

    let currentGameboard = [];
    let currentGameboardDOM = document.querySelectorAll('.tile');
    for (let i of currentGameboardDOM) { currentGameboard.push(Array.from(i.classList)); }

    for (let j = 0; j < 20; j++) {
        currentGameboardDOM[j].innerHTML = '';
        let removeClassList = findClassToRemove(initialGameboard[j], currentGameboard[j]);
        for (let r of removeClassList) { currentGameboardDOM[j].classList.remove(r); }
        if (initialGameboard[j].includes('tile-unused') & !currentGameboard[j].includes('tile-unused')) {
            currentGameboardDOM[j].classList.add('tile-unused');
        }
    }

    for (let k of document.querySelectorAll('.letter')) {
        k.classList.remove('letter-used');
        k.classList.add('letter-unused');
    }

    setRandomPuzzle(solutionData); // create initial puzzle
    getLetterList(); // create initial letter list
    setKeyboard(); // populate initial keyboard letters
    setGameboard(); // populate initial gameboard letters
    decideHintClickable(); // makes hint button clickable again
    
}

