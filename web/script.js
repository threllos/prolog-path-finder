const SLEEPMS = 150;

let rowsCount = 3;
let columnsCount = 3;
let start = [];
let finish = [];
let walls = [];

let paths = [];
let curPath;

document.addEventListener("DOMContentLoaded", () => {
    document.getElementById("rowsRange").oninput = rowsRangeHandler;
    document.getElementById("columnsRange").oninput = columnsRangeHandler;
    document.getElementById("limitsButton").onclick = limitsButtonHandler;
    document.getElementById("startButton").onclick = startButtonHandler;
    document.getElementById("finishButton").onclick = finishButtonHandler;
    document.getElementById("wallsButton").onclick = wallsButtonHandler;
    document.getElementById("retryButton").onclick = retryButtonHandler;
    document.getElementById("prevPathButton").onclick = prevPathButtonHandler;
    document.getElementById("nextPathButton").onclick = nextPathButtonHandler;

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

async function wallsButtonHandler() {
    const wrapperHTML = document.getElementById("wrapper");
    const wallsHTML = document.getElementById("walls");
    const inputWrapperHTML = document.getElementById("inputWrapper");
    const inputAlignHTML = document.getElementById("inputAlign");
    const pathsHTML = document.getElementById("paths");
    const retryHTML = document.getElementById("retryButton");
    const curPathHTML = document.getElementById("curPath");
    const countPathHTML = document.getElementById("countPaths");

    await getPaths();

    curPathHTML.innerText = paths.length > 0 ? 1 : 0;
    countPathHTML.innerText = paths.length;
    wrapperHTML.style.flexDirection = "column";
    wallsHTML.style.display = "none";
    inputWrapperHTML.style.display = "none";
    inputAlignHTML.style.display = "none";
    pathsHTML.style.display = "flex";
    retryHTML.style.display = "block";

    curPath = paths.length > 0 ? 1 : 0;
    setCellFunction(null);
    drawPath();
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

async function prevPathButtonHandler() {
    if (curPath < 2) {
        return;
    }

    curPath -= 1;

    const curPathHTML = document.getElementById("curPath");
    curPathHTML.innerText = curPath;

    await drawPath();
}

async function nextPathButtonHandler() {
    if (curPath == paths.length) {
        return;
    }

    curPath += 1;

    const curPathHTML = document.getElementById("curPath");
    curPathHTML.innerText = curPath;

    await drawPath();
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
        const prevStartHTML = document.getElementById(`${start[0]}-${start[1]}`);
        prevStartHTML.className = "cell";
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
        const prevFinishHTML = document.getElementById(`${finish[0]}-${finish[1]}`);
        prevFinishHTML.className = "cell";
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

function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

function clearPath() {
    const gridHTML = document.getElementById("grid");

    gridHTML.childNodes.forEach(cellHTML => {
        if (cellHTML.className.includes("cell-start")) {
            cellHTML.className = "cell cell-start";
        } else if (cellHTML.className.includes("cell-finish")) {
            cellHTML.className = "cell cell-finish";
        } else if (cellHTML.className.includes("cell-path")) {
            cellHTML.className = "cell";
        }
    });
}

async function drawPath() {
    const path = paths[curPath - 1];

    clearPath();
    await sleep(SLEEPMS);

    for (let i = 0; i < path.length; i++) {
        const x = path[i][0];
        const y = path[i][1];

        const cellHTML = document.getElementById(`${x}-${y}`);
        cellHTML.className += " cell-path";

        await sleep(SLEEPMS);
    }
}

async function getPaths() {
    const resp = await fetch("http://localhost:5050/paths", { 
    method: "POST",
    headers: {
      "Accept": "application/json",
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
        "limits": [rowsCount - 1, columnsCount - 1], 
        "start": start,
        "finish": finish,
        "walls": walls,
      })
  });

  const json = await resp.json();

  paths = json.data.paths;
}