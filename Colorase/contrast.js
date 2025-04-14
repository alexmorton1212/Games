function calculateContrast(rgb1, rgb2) {

    const luminance1 = calculateLuminance(rgb1);
    const luminance2 = calculateLuminance(rgb2);
    const brighter = Math.max(luminance1, luminance2);
    const darker = Math.min(luminance1, luminance2);
    return (brighter + 0.05) / (darker + 0.05);
}

function calculateLuminance(rgb) {
    
    const normalizedRgb = calculateNormalizedRBG(rgb);
    return normalizedRgb[0] * 0.2126 + normalizedRgb[1] * 0.7152 + normalizedRgb[2] * 0.0722;
}
  
function calculateNormalizedRBG(rgb) {

    let v = [];
    for (let c of rgb) { 
        let cn = c / 255;
        v.push(cn <= 0.03928 ? cn / 12.92 : Math.pow((cn + 0.055) / 1.055, 2.4)); 
    }
    return v;

}

function calculateKeyboardContrast() {

    let greyColor = [73,73,73];
    //let backgroundColor = document.body.style.backgroundColor;
    let colorQ = document.querySelectorAll(".color");
    for (let q = 0; q < 10; q++) { 
        let contrastQ = calculateContrast(greyColor, keyboardPalette[q]);
        let colorQ = document.getElementById('color-' + (q+1))
        colorQ.innerHTML = contrastQ.toFixed(1);
    }

}
  
const color1 = keyboardPalette[0];
const color2 = keyboardPalette[1];
const contrastRatio = calculateContrast(color1, color2);


/****************************************/
/* BACKGROUND */
/****************************************/

// will get rid of this later
function showGameboard() {

    let qUnusedTiles = document.querySelectorAll('.tile-unused');
    for (let i = 0; i < 4; i++) {
        for (let j = 0; j < 3; j++) {
            qUnusedTiles[(i*3)+j].style.backgroundColor = `rgb(${answersX[i][j][0]},${answersX[i][j][1]},${answersX[i][j][2]})`;
        }
    } 
}
