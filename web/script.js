let rowsCount = 3;
let columnsCount = 3;
let start = [];
let finish = [];
let walls = [];

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("rowsRange").oninput = rowsRangeHandler;
    document.getElementById("columnsRange").oninput = columnsRangeHandler;
    document.getElementById("limitsButton").onclick = limitsButtonHandler;
    document.getElementById("startButton").onclick = startButtonHandler;
    document.getElementById("finishButton").onclick = finishButtonHandler;
    document.getElementById("wallsButton").onclick = wallsButtonHandler;
    document.getElementById("retryButton").onclick = retryButtonHandler;

    fillGrid();
})

function rowsRangeHandler() {
    const rangeHTML = document.getElementById("rowsRange");
    const rowsCountHTML = document.getElementById("rowsCount");

    rowsCount = rangeHTML.value;
    rowsCountHTML.innerText = rowsCount;

    fillGrid();
}

function columnsRangeHandler() {
    const rangeHTML = document.getElementById("columnsRange");
    const columnsCountHTML = document.getElementById("columnsCount");
    
    columnsCount = rangeHTML.value;
    columnsCountHTML.innerText = columnsCount;

    fillGrid();
}

function limitsButtonHandler() {
    const screenHTML = document.getElementById("screen");
    const startHTML = document.getElementById("start");

    screenHTML.style.display = "none";
    startHTML.style.display = "flex";

    setCellFunction((e) => cellChangeStart(e.target));
}

function startButtonHandler() {
    if (start.length == 0) {
        return;
    }

    const startHTML = document.getElementById("start");
    const finishHTML = document.getElementById("finish");

    startHTML.style.display = "none";
    finishHTML.style.display = "flex";

    setCellFunction((e) => cellChangeFinish(e.target));
}

function finishButtonHandler() {
    if (finish.length == 0) {
        return;
    }
    
    const finishHTML = document.getElementById("finish");
    const wallsHTML = document.getElementById("walls");

    finishHTML.style.display = "none";
    wallsHTML.style.display = "flex";

    setCellFunction((e) => cellChangeWalls(e.target));
}

function wallsButtonHandler() {
    const wrapperHTML = document.getElementById("wrapper");
    const wallsHTML = document.getElementById("walls");
    const inputWrapperHTML = document.getElementById("inputWrapper");
    const inputAlignHTML = document.getElementById("inputAlign");
    const pathsHTML = document.getElementById("paths");
    const retryHTML = document.getElementById("retryButton");

    wrapperHTML.style.flexDirection = "column";
    wallsHTML.style.display = "none";
    inputWrapperHTML.style.display = "none";
    inputAlignHTML.style.display = "none";
    pathsHTML.style.display = "flex";
    retryHTML.style.display = "block";

    setCellFunction(null);
}

function retryButtonHandler() {
    const wrapperHTML = document.getElementById("wrapper");
    const pathsHTML = document.getElementById("paths");
    const retryHTML = document.getElementById("retryButton");
    const inputWrapperHTML = document.getElementById("inputWrapper");
    const inputAlignHTML = document.getElementById("inputAlign");
    const screenHTML = document.getElementById("screen");

    wrapperHTML.style.flexDirection = "row";
    pathsHTML.style.display = "none";
    retryHTML.style.display = "none";
    inputWrapperHTML.style.display = "flex";
    inputAlignHTML.style.display = "block";
    screenHTML.style.display = "flex";

    start = [];
    finish = [];
    walls = [];

    fillGrid();
}

function setCellFunction(f) {
    const gridHTML = document.getElementById("grid");
    let cursorStyle = "";

    if (f) {
        cursorStyle = "pointer";
    } else {
        cursorStyle = "default";
    }

    gridHTML.childNodes.forEach(cellHTML => {
        cellHTML.onclick = f;
        cellHTML.style.cursor = cursorStyle;
    });
}

function isEqualCells(cell1, cell2) {
    return cell1[0] == cell2[0] && cell1[1] == cell2[1];
}

function isStartCell(cell) {
    return isEqualCells(cell, start);
}

function isFinishCell(cell) {
    return isEqualCells(cell, finish);
}

function isWallCell(cell) {
    for (let i = 0; i < walls.length; i++) {
        const wall = walls[i];

        if (wall[0] == cell[0] && wall[1] == cell[1]) {
            return true;
        }
    }

    return false;
}

function cellChangeStart(cellHTML) {
    const cell = [cellHTML.x, cellHTML.y];

    if (start.length != 0) {
        const prevStart = document.getElementById(`${start[0]}-${start[1]}`);
        prevStart.className = "cell";
    }

    cellHTML.className += " cell-start";
    start = cell;
}

function cellChangeFinish(cellHTML) {
    const cell = [cellHTML.x, cellHTML.y];

    if (isStartCell(cell)) {
        return;
    }

    if (finish.length != 0) {
        const prevFinish = document.getElementById(`${finish[0]}-${finish[1]}`);
        prevFinish.className = "cell";
    }

    cellHTML.className += " cell-finish";
    finish = [cellHTML.x, cellHTML.y];
}

function cellChangeWalls(cellHTML) {
    const cell = [cellHTML.x, cellHTML.y];

    if (isStartCell(cell) || isFinishCell(cell)) {
        return;
    }

    if (isWallCell(cell)) {
        cellHTML.className = "cell";
        walls = walls.filter(wall => !isEqualCells(cell, wall));
    } else {
        cellHTML.className += " cell-wall";
        walls.push(cell);
    }
}

function fillGrid() {
    const gridHTML = document.getElementById("grid");
    gridHTML.innerText = "";
    gridHTML.style.gridTemplateRows = `repeat(${rowsCount}, 1fr)`;
    gridHTML.style.gridTemplateColumns = `repeat(${columnsCount}, 1fr)`;

    for (let y = rowsCount - 1; y >= 0; y--) {
        for (let x = 0; x < columnsCount; x++) {
            const cellHTML = document.createElement("div");
            cellHTML.className = "cell";
            cellHTML.id = `${x}-${y}`;
            cellHTML.x = x;
            cellHTML.y = y;
            gridHTML.appendChild(cellHTML);
        }
    }
}