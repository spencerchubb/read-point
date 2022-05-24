const BAR_WIDTH = 32;

const pList = document.querySelectorAll('p');

const filteredP = [];
pList.forEach(p => {
    const width = p.clientWidth;
    const height = p.clientHeight;
    if (width === 0 && height === 0) {
        return;
    }

    filteredP.push(p);
});

let xPos = 0;
let lineIndex = 0;
let loopStarted = false;
let oldTime = undefined;

let activeIndex = 0;
let activeP = undefined;

// aDown and dDown should be timestamps
let aDown = undefined;
let dDown = undefined;

const bar = document.createElement('div');
bar.id = 'PointerElement';
bar.style.position = 'absolute';
bar.style.width = `${BAR_WIDTH}px`;
bar.style.height = '2px';
bar.style.backgroundColor = 'blue';

// Initial bar render
renderBarInActiveP();

function incrementActiveIndex() {
    activeIndex = Math.min(filteredP.length - 1, activeIndex + 1);
    renderBarInActiveP();
}

function decrementActiveIndex() {
    activeIndex = Math.max(0, activeIndex - 1);
    renderBarInActiveP();
}

function renderBarInActiveP() {
    // Remove bar if it was previously added
    bar.remove();

    // Reset since the bar is being moved to a new text element
    activeP = filteredP[activeIndex];
    xPos = 0;
    lineIndex = 0;

    updateBar();
    activeP.appendChild(bar);
}

function continueLoop(exitIfStarted) {
    if (loopStarted && exitIfStarted) return;
    loopStarted = true;

    oldTime = Date.now();

    requestAnimationFrame(timestamp => {
        const newTime = Date.now();
        const timeDiff = newTime - oldTime;
        const xPosDiff = timeDiff / 2;

        // 0 for backward, 1 for forward
        let direction = 1;
        if (aDown && dDown) {
            if (aDown > dDown) {
                direction = 0;
            }
        } else if (aDown) {
            direction = 0;
        }
        // If none of the above if-statements are triggered, then aDown must be undefined
        // and dDown must be defined. Therefore, we want direction = 1

        if (direction == 0) {
            // backward
            xPos -= xPosDiff;
        } else {
            // forward
            xPos += xPosDiff;
        }

        updateBar();

        if (aDown || dDown) {
            continueLoop(false);
        } else {
            loopStarted = false;
        }
    });
}

function updateBar() {
    const width = activeP.clientWidth;
    const height = activeP.clientHeight;
    const style = document.defaultView.getComputedStyle(activeP);

    // Remove px from lineHeight and parseInt
    const lineHeightInt = parseInt(style.lineHeight.substring(0, style.lineHeight.length - 2));

    let yPos = (lineIndex + 1) * lineHeightInt - height;

    if (xPos + BAR_WIDTH > width) {
        xPos = 0;
        lineIndex += 1;
        if (yPos === 0) {
            lineIndex = 0;
            incrementActiveIndex();
        }
    } else if (xPos < 0) {
        if (lineIndex > 0) {
            // Move up a line
            xPos = width - BAR_WIDTH;
            lineIndex -= 1;
        } else {
            // Keep xPos at 0 if we're at the top line of an element
            xPos = 0;
        }
    }

    bar.style.transform = `translate(${xPos}px, ${(lineIndex + 1) * lineHeightInt - height}px)`;
}

document.addEventListener('keydown', (event) => {
    if (event.key === 'w' || event.key === 'W') {
        decrementActiveIndex();
    } else if (event.key === 'a' || event.key === 'A') {
        aDown = Date.now();
        continueLoop(true);
    } else if (event.key === 's' || event.key === 'S') {
        incrementActiveIndex();
    } else if (event.key === 'd' || event.key === 'D') {
        dDown = Date.now();
        continueLoop(true);
    }
});

document.addEventListener('keyup', event => {
    if (event.key === 'a' || event.key === 'A') {
        aDown = undefined;
    } else if (event.key === 'd' || event.key === 'D') {
        dDown = undefined;
    }
});