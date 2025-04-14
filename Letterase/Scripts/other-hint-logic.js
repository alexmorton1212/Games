

// Fills in the next word on each click
// Don't really like it very much as it is
// Does work though

function onHintButtonClick() {

    for (let i = 0; i < 5; i++) {

        let hintLetter = puzzle["words_" + hintCount][i].toUpperCase();
        let hintTile = document.getElementById("tile-" + (i + 5*(hintCount-1) + 1));

        // if it is not already a static or hint tile --> if it is, we skip it
        if (!hintTile.classList.contains('tile-static') & !hintTile.classList.contains('tile-hint')) {

            // if a tile is in the spot where hint will go --> remove from gameboard, add to keyboard
            if (hintTile.classList.contains('tile-used')) {

                let tileLetterId = Array.from(hintTile.classList).find(c => /letter/.test(c));
                let keyboardLetter = document.getElementById(tileLetterId);
                keyboardLetter.innerHTML = hintTile.innerHTML;
                keyboardLetter.classList.remove('letter-used');
                keyboardLetter.classList.add('letter-unused');
                hintTile.innerHTML = '';
                hintTile.classList.remove(tileLetterId);
                hintTile.classList.remove('tile-used');
                hintTile.classList.add('tile-unused');

                // if tile we clicked on has a matching pair
                if (hintTile.classList.contains('pair')) { removePairedLetter(tileLetterId, hintTile.id); }
            }

            // loop through keyboard letters and remove the first match
            let keyboardHintLetters = document.querySelectorAll('.letter.letter-unused');
            let keyboardMatchFound = 0;
            for (let k of keyboardHintLetters) {
                if (hintLetter == k.innerHTML) {
                    k.classList.remove('letter-unused');
                    k.classList.add('letter-used');
                    k.innerHTML = '';
                    keyboardMatchFound = 1;
                    break;
                }
            }

            // if we dont find a match in the keyboard, look through the gameboard tiles
            if (keyboardMatchFound == 0) {
                let gameboardHintLetters = document.querySelectorAll('.tile.tile-used');
                for (let g of gameboardHintLetters) {
                    if (hintLetter == g.innerHTML) {
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
            hintTile.classList.remove('tile-unused');
            hintTile.classList.add('tile-hint');
            hintTile.innerHTML = hintLetter;

            // if tile is a pair
            if (hintTile.classList.contains('pair')) {
                let targetPair = document.getElementById(pairsDictionary[hintTile.id]);
                targetPair.classList.remove('tile-used');
                targetPair.classList.remove('tile-unused');
                targetPair.classList.add('tile-hint');
                targetPair.innerHTML = hintLetter.toUpperCase();
            }
        }
    }

    // there is only one letter left at this point
    // go ahead and fill it in
    if (hintCount == 4) {
        hintCount++;
        onHintButtonClick();
        console.log("GAME OVER");
    } else {
        hintCount++;
    }

}