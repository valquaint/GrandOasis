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
const wallPatterns = {};
const floorPatterns = {};
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
    const ctx = canva.getContext("2d", { willReadFrequently: true });
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
    const maze = document.querySelector("#output").getContext("2d", { willReadFrequently: true }).getImageData(0, 0, canva.width, canva.height);
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
        if (!await validateSteps(floors)) {
            document.querySelectorAll(".visited").forEach(ele => ele.classList.remove("visited"));
            await processMaze(columns, rows);
            await testwfc();
        }
        else
            await drawWalls("walls_1");
    }
}
function validateSteps(count) {
    return new Promise(async (resolve) => {
        let x = Math.floor(Math.random() * columns);
        let y = Math.floor(Math.random() * rows);
        let startCell = cells[x][y];
        while (startCell.type !== "floor") {
            x = Math.floor(Math.random() * columns);
            y = Math.floor(Math.random() * rows);
            startCell = cells[x][y];
        }
        console.log(`Starting cell for validation: [${x}, ${y}]`);
        await checkCell(x, y, columns, rows);
        let validated = document.querySelectorAll(".visited").length;
        if (validated !== count) {
            resolve(false);
        }
        resolve(true);
    });
}
async function drawWalls(type) {
    await makeWalls(type);
    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            if (cells[x][y].type !== "floor") {
                await placeImage(x, y, wallPatterns[type], "wall");
            }
        }
    }
    await drawFloors("floors_1");
}
async function drawFloors(type) {
    await makeFloors(type);
    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            if (cells[x][y].type == "floor") {
                await placeImage(x, y, floorPatterns[type], "floor");
            }
        }
    }
}
function placeImage(x, y, pattern, type) {
    return new Promise(async (resolve) => {
        const canvas = document.createElement("canvas");
        canvas.width = 64;
        canvas.height = 64;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        let sections = 0;
        let sY = 0;
        let sX = 0;
        while (sections < 16) {
            //wallPatterns[type] = await shuffleArray(wallPatterns[type]) as Array<any>;
            const pX = Math.floor(Math.random() * 16) * 16;
            //console.log(`Cell: ${x}, ${y}\n-- Subcell: X: ${sX}, Y: ${sY}`)
            //console.log(part);
            //debugger
            console.log(`Placing section at internal ${sX}, ${sY}, pX ${pX}`);
            ctx.putImageData(pattern, (sX * 16) - pX, (sY * 16), pX, 0, 16, 16);
            sections++;
            sX++;
            if (sections % 4 === 0) {
                sY++;
                sX = 0;
            }
            //if(sections === 3) debugger
        }
        ctx.fillStyle = "#00000067";
        console.log(`Checking cell [${x},${y + 1}]`);
        if (type === "wall") {
            if (!checkIfWall(x, y + 1, columns, rows)) {
                ctx.fillRect(0, 0, 64, 40);
            }
            else {
                ctx.fillRect(0, 0, 64, 64);
            }
        }
        else {
            ctx.fillStyle = "#00000088";
            ctx.fillRect(0, 0, 64, 64);
        }
        //ctx.putImageData(wallPatterns[type], 0, 0)
        //console.log(`Painted cell ${x}, ${y}`)
        const cell = document.querySelector(`.cell-${x}-${y}`);
        canvas.classList.add("tile");
        cell?.appendChild(canvas);
        resolve(true);
    });
}
function makeWalls(asset) {
    return new Promise(async (resolve) => {
        const demo = document.querySelector("#demo");
        demo.classList.add("demo");
        const canva = document.createElement("canvas");
        canva.width = 256;
        canva.height = 16;
        const img = new Image();
        demo.appendChild(canva);
        wallPatterns[asset] = await loadAsset(canva, img, asset, 0, 0);
        console.log(wallPatterns);
        resolve(true);
    });
}
function makeFloors(asset) {
    return new Promise(async (resolve) => {
        const demo = document.querySelector("#demo");
        const canva = document.createElement("canvas");
        canva.width = 256;
        canva.height = 16;
        const img = new Image();
        demo.appendChild(canva);
        floorPatterns[asset] = await loadAsset(canva, img, asset, 0, 0);
        console.log(floorPatterns);
        resolve(true);
    });
}
function loadAsset(canvas, image, asset, x, y) {
    return new Promise((resolve) => {
        // canva.style.width = "160px";
        // canva.style.height = "160px";
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        // @ts-ignore
        image.context = ctx;
        //console.log((rX * 16), (rY * 16))
        image.onload = (e) => {
            renderWall(e, image, 0, 0, 256, 16, 0, 0, 256, 16);
            // @ts-ignore
            resolve(image.context.getImageData(0, 0, 256, 16));
        };
        //console.log(`Loading asset location ${x * 16}, ${y * 16}`);
        image.src = `assets/${asset}.png`;
    });
}
// @ts-ignore
function renderWall(event, image, sX, sY, sW, sH, dX, dY, dW, dH) {
    event.target.context.drawImage(image, sX, sY, sW, sH, dX, dY, dW, dH);
}
function start(id) {
    return new Promise((resolve) => {
        let output = document.querySelector("#output");
        if (!output)
            return;
        const ctx = output.getContext("2d", { willReadFrequently: true });
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
    if (x === 0 || x >= max_x - 1)
        return true;
    else if (y === 0 || y >= max_y - 1)
        return true;
    else if (cells[x][y].type === "wall")
        return true;
    else
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
    return new Promise((resolve) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        resolve(array);
    });
}
async function checkCell(x, y, maxX, maxY) {
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
    DIRECTIONS = await shuffleArray(DIRECTIONS);
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
                await checkCell(x + DIR.x, y + DIR.y, maxX, maxY);
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
