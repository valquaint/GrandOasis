"use strict";
let root;
let rows = 20;
let columns = 20;
let cells;
let lastDirection; // TODO: type this
let directionCount = 0;
let step = 0;
const STEPS = [];
const PATHLEN = 2;
async function ready() {
    root = document.querySelector("#root");
    if (root) {
        for (let y = 0; y < rows; y++) {
            const row = document.createElement("div");
            row.classList.add("row");
            root.appendChild(row);
            for (let x = 0; x < columns; x++) {
                const column = document.createElement("div");
                column.classList.add("column");
                row.appendChild(column);
                const content = document.createElement("div");
                content.classList.add(`cell-${x}-${y}`, "cell");
                column.appendChild(content);
            }
        }
        await processMaze(columns, rows);
        await testwfc();
    }
}
let currentStep = 0;
async function STEPCELLS() {
    if (STEPS[currentStep]) {
        await highlight(STEPS[currentStep]);
        currentStep++;
    }
}
async function BACKSTEP() {
    if (STEPS[currentStep]) {
        await delight(STEPS[currentStep]);
        currentStep--;
    }
}
const pixelTypes = {
    "0,0,0,255": "wall",
    "255,255,255,255": "floor",
    "255,0,0,255": markCellAsEither
};
function findPixel(image, x, y) {
    let start = y * image.width + x;
    let index = start * 4;
    let data = image.data;
    return [data[index], data[index + 1], data[index + 2], data[index + 3]];
}
async function testwfc() {
    const canva = document.createElement("canvas");
    canva.id = "baseImg";
    canva.width = 5;
    canva.height = 5;
    const ctx = canva.getContext("2d");
    ctx.fillRect(0, 0, 5, 5);
    ctx.fillStyle = "white";
    ctx.fillRect(0, 3, 5, 1);
    ctx.fillRect(3, 0, 1, 5);
    ctx.fillRect(2, 2, 1, 1);
    ctx.fillStyle = "red";
    ctx.fillRect(1, 2, 1, 1);
    ctx.fillRect(4, 2, 1, 1);
    ctx.fillRect(2, 4, 1, 1);
    const img = ctx.getImageData(0, 0, 5, 5);
    await start(img);
    canva.height = rows;
    canva.width = columns;
    const maze = document.querySelector("#output").getContext("2d").getImageData(0, 0, canva.width, canva.height);
    //console.log(maze)
    for (let x = 0; x < canva.width; x++) {
        for (let y = 0; y < canva.height; y++) {
            const pixel = findPixel(maze, x, y).join(",");
            // @ts-ignore
            //console.log(`XY: ${x},${y}`, pixel, pixelTypes[pixel])
            cells[x][y].type = pixelTypes[pixel];
            const cell = document.querySelector(`.cell-${x}-${y}`);
            cell?.classList.remove("floor", "wall");
            if (typeof pixelTypes[pixel] === "function") {
                setTimeout(() => {
                    cells[x][y].postProcess(x, y, columns, rows, checkAllNeighbors(x, y, columns, rows), pixelTypes[pixel], () => {
                        cell?.classList.add(cells[x][y].type);
                    });
                }, 10);
            }
            else {
                cell?.classList.add(cells[x][y].type);
            }
        }
    }
    setTimeout(await processWFC, 20);
}
async function processWFC() {
    let totalCells = 0;
    let floors = (() => {
        let count = 0;
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                if (cells[x][y].type === "floor") {
                    count++;
                }
                totalCells++;
            }
        }
        return count;
    })();
    const ratio = floors / totalCells;
    if (ratio < .5)
        await testwfc();
    else {
        console.log(`Floor ratio is ${floors / totalCells}`);
        await validateSteps(floors);
    }
}
async function validateSteps(count) {
    let x = Math.floor(Math.random() * columns);
    let y = Math.floor(Math.random() * rows);
    let startCell = cells[x][y];
    while (startCell.type !== "floor") {
        x = Math.floor(Math.random() * columns);
        y = Math.floor(Math.random() * rows);
        startCell = cells[x][y];
    }
    console.log(`Starting cell for validation: [${x}, ${y}]`);
    checkCell(x, y, columns, rows);
    let validated = document.querySelectorAll(".visited").length;
    if (validated !== count) {
        console.log(`Not all floor is reachable. Expected: ${count} -- Only ${validated} reachable.`);
    }
}
function start(id) {
    return new Promise((resolve) => {
        let output = document.querySelector("#output");
        if (!output)
            return;
        const ctx = output.getContext("2d");
        const imgData = ctx.createImageData(columns, rows);
        // input, width, height, N, outputWidth, outputHeight, periodicInput, periodicOutput, symmetry, ground
        // @ts-expect-error
        const model = new OverlappingModel(id.data, id.width, id.height, 2, columns, rows, true, false, 5, 0);
        //seed, limit
        var success = model.generate(Math.random, 0);
        model.graphics(imgData.data);
        ctx.putImageData(imgData, 0, 0);
        ctx.fillRect(0, 0, 1, rows);
        ctx.fillRect(0, 0, columns, 1);
        console.log(success);
        resolve(success);
    });
}
function highlight(cell) {
    return new Promise((resolve) => {
        cell.classList.add("light");
        setTimeout(() => {
            cell.classList.remove("light");
            cell.classList.add("passed");
            resolve(true);
        }, 300);
    });
}
function delight(cell) {
    return new Promise((resolve) => {
        cell.classList.add("light");
        setTimeout(() => {
            cell.classList.remove("light");
            cell.classList.remove("passed");
            resolve(true);
        }, 300);
    });
}
function checkIfWall(x, y, max_x, max_y) {
    if (x === 0 || x === max_x - 1 || y === 0 || y === max_y - 1)
        return true;
    else if (cells[x][y].type === "wall")
        return true;
    return false;
}
function createCell(x, y) {
    return new GridCell(x, y, false, "wall");
}
async function processMaze(maxX, maxY) {
    cells = new Array(maxX).fill([]).map(() => new Array(maxY));
    let x = 0;
    while (x < maxX) {
        let y = 0;
        while (y < maxY) {
            cells[x][y] = createCell(x, y);
            y++;
        }
        x++;
    }
    let DIRECTIONS = [
        {
            x: 0,
            y: -1
        },
        {
            x: 0,
            y: 1
        },
        {
            x: -1,
            y: 0
        },
        {
            x: 1,
            y: 0
        },
    ];
    //const DIR = getRandDir(DIRECTIONS);
    //checkCell(1 + Math.floor(Math.random() * (maxX - 2)), 1 + Math.floor(Math.random() * (maxY - 2)), maxX, maxY, DIR);
    console.log("Done");
    return true;
}
function markCellVisited(x, y, maxX, maxY) {
    if (x < maxX && y < maxY) {
        if (cells[x][y].visited) {
            console.log(`====> Cell ${x}, ${y} already visited!!!!`);
        }
        else {
            step++;
            //console.log(`Marking cell at ${x}, ${y} visited. Step is now ${step}`)
            cells[x][y].visited = true;
            cells[x][y].visits = step;
            const cell = document.querySelector(`.cell-${x}-${y}`);
            //console.log(cell)
            if (cell && cells[x][y].type === "floor") {
                STEPS.push(cell);
                cell.classList.add("visited");
                //cell.innerHTML = `[${x}, ${y}]: ${cells[x][y].visits}`
            }
        }
    }
}
function checkAllNeighbors(x, y, maxX, maxY) {
    const neighbors = [];
    if ((x + 1) < maxX)
        neighbors.push(cells[x + 1][y]);
    if ((x - 1) > 0)
        neighbors.push(cells[x - 1][y]);
    if ((y + 1) < maxY)
        neighbors.push(cells[x][y + 1]);
    if ((y - 1) > 0)
        neighbors.push(cells[x][y - 1]);
    return neighbors;
}
function checkIfNeighborIsVisited(x, y, maxX, maxY) {
    if (x < maxX && y < maxY) {
        return cells[x][y].visited;
    }
    else
        return true;
}
function markCellAsFloor(x, y, maxX, maxY) {
    cells[x][y].type = "floor";
    cells[x][y].visits = step;
    step++;
}
function markCellAsWall(x, y, maxX, maxY) {
    cells[x][y].type = "wall";
}
function markCellAsEither() {
    const pick = Math.floor(Math.random() * 3);
    switch (pick % 3) {
        case 0:
            return "floor";
        case 1:
            return "wall";
        default:
            return markCellAsEither();
    }
}
function getRandDir(DIRECTIONS) {
    const pick = Math.floor(Math.random() * DIRECTIONS.length);
    return DIRECTIONS[pick];
}
function hasNeighbor(x, y, maxX, maxY) {
    if (x < maxX && y < maxY)
        return cells[x][y];
    else
        return false;
}
function shuffleArray(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;
    }
    return array;
}
function checkCell(x, y, maxX, maxY) {
    markCellVisited(x, y, maxX, maxY);
    let DIRECTIONS = [
        {
            x: 0,
            y: -1
        },
        {
            x: 0,
            y: 1
        },
        {
            x: -1,
            y: 0
        },
        {
            x: 1,
            y: 0
        },
    ];
    DIRECTIONS = shuffleArray(DIRECTIONS);
    // @ts-ignore
    //document.querySelector(`.cell-${x}-${y}`).style.backgroundColor = "#0f0";
    //console.log("Direction Count:", directionCount, PATHLEN)
    /*
    Move in a direction until path length minimum reach,
    chooses random direction that is not same direction it came from
    */
    //console.log(previousDirection, DIRECTIONS)
    for (const DIR of DIRECTIONS) {
        // @ts-ignore
        // document.querySelector(`.cell-${x + DIR.x}-${y + DIR.y}`).style.backgroundColor = "#00f";
        // debugger
        // @ts-ignore
        //document.querySelector(`.cell-${x + DIR.x}-${y + DIR.y}`).style.backgroundColor = null;
        if (!checkIfNeighborIsVisited(x + DIR.x, y + DIR.y, maxX, maxY)) {
            if (checkIfWall(x + DIR.x, y + DIR.y, maxX, maxY)) {
                // @ts-ignore
                // document.querySelector(`.cell-${x + DIR.x}-${y + DIR.y}`).style.backgroundColor = "#f00";
                // console.log(`Wall found at ${x + DIR.x}, ${y + DIR.y}`)
                // debugger
                // // @ts-ignore
                // document.querySelector(`.cell-${x + DIR.x}-${y + DIR.y}`).style.backgroundColor = null;
                //DIRECTIONS.splice((DIRECTIONS.indexOf(DIR)));
            }
            else {
                checkCell(x + DIR.x, y + DIR.y, maxX, maxY);
            }
        }
    }
    // @ts-ignore
    //document.querySelector(`.cell-${x}-${y}`).style.backgroundColor = null;
    return cells[x][y].type;
}
class GridCell {
    x;
    y;
    visited;
    type;
    visits = 0;
    constructor(x, y, visited, type) {
        this.x = x;
        this.y = y;
        this.visited = visited;
        this.type = type;
        //console.log(`New cell made at ${x},${y}`)
    }
    postProcess(x, y, maxX, maxY, comparators, callback, update) {
        if (comparators.find((cell) => cell.type === "floor") !== undefined) {
            this.type = callback(x, y, maxX, maxY);
        }
        else {
            this.type = "wall";
        }
        update();
    }
}
document.addEventListener("DOMContentLoaded", ready);
