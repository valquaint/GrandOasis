let root;
let rows = 20;
let columns = 20;
let cells: any;
let lastDirection: any; // TODO: type this
let directionCount: number = 0;
let step: number = 0;
const STEPS: HTMLElement[] = [];
const PATHLEN: number = 2;
const wallPatterns: { [key: string]: ImageData } = {

};
async function ready() {
    root = document.querySelector("#root");
    if (root) {
        for (let y = 0; y < rows; y++) {
            const row = document.createElement("div");
            row.classList.add("row");
            root.appendChild(row)
            for (let x = 0; x < columns; x++) {
                const column = document.createElement("div");
                column.classList.add("column")
                row.appendChild(column)
                const content = document.createElement("div");
                content.classList.add(`cell-${x}-${y}`, "cell");
                column.appendChild(content)
            }
        }
        await processMaze(columns, rows);
        await testwfc();
    }

}

let currentStep: number = 0;

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

const pixelTypes: { [key: string]: string | Function; } = {

    "0,0,0,255": "wall",
    "255,255,255,255": "floor",
    "255,0,0,255": markCellAsEither
}

function findPixel(image: ImageData, x: number, y: number) {
    let start = y * image.width + x;
    let index = start * 4;
    let data = image.data;
    return [data[index], data[index + 1], data[index + 2], data[index + 3]]
}

async function testwfc() {
    const canva = document.createElement("canvas");
    canva.id = "baseImg";
    canva.width = 5;
    canva.height = 5;
    const ctx: CanvasRenderingContext2D = canva.getContext("2d",{willReadFrequently: true}) as CanvasRenderingContext2D;
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
    const maze: ImageData = ((document.querySelector("#output") as HTMLCanvasElement).getContext("2d",{willReadFrequently: true}) as CanvasRenderingContext2D).getImageData(0, 0, canva.width, canva.height);
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
                    })
                }, 10);
            } else {

                cell?.classList.add(cells[x][y].type);
            }
        }
    }
    setTimeout(await processWFC, 20);
}

async function processWFC() {
    let totalCells: number = 0;
    let floors: number = (() => {
        let count: number = 0;
        for (let x = 0; x < columns; x++) {
            for (let y = 0; y < rows; y++) {
                if (cells[x][y].type === "floor") {
                    count++;
                }
                totalCells++;
            }
        }
        return count;
    })()
    const ratio = floors / totalCells;
    if (ratio < .5) await testwfc();
    else {

        console.log(`Floor ratio is ${floors / totalCells}`);
        if (!await validateSteps(floors)) {
            document.querySelectorAll(".visited").forEach(ele => ele.classList.remove("visited"))
            await processMaze(columns, rows);
            await testwfc();
        }
        else await drawWalls("walls_1");
    }
}

function validateSteps(count: number) {
    return new Promise(async (resolve) => {
        let x = Math.floor(Math.random() * columns);
        let y = Math.floor(Math.random() * rows);
        let startCell: GridCell = cells[x][y];
        while (startCell.type !== "floor") {
            x = Math.floor(Math.random() * columns);
            y = Math.floor(Math.random() * rows);
            startCell = cells[x][y];
        }
        console.log(`Starting cell for validation: [${x}, ${y}]`);
        await checkCell(x, y, columns, rows);

        let validated: number = document.querySelectorAll(".visited").length;
        if (validated !== count) {
            resolve(false)
        }
        resolve(true)
    })

}

async function drawWalls(type: string) {
    await makeWalls(type);
    for (let x = 0; x < columns; x++) {
        for (let y = 0; y < rows; y++) {
            if (cells[x][y].type !== "floor") {
                console.log(`Shuffling array... ln 166`)

                //wallPatterns[type] = patterns;
                await placeImage(x, y, type);

            }
        }
    }

}

function placeImage(x: number, y: number, type: string) {
    return new Promise(async (resolve) => {
        const canvas: HTMLCanvasElement = document.createElement("canvas") as HTMLCanvasElement;
        canvas.width = 64;
        canvas.height = 64;
        const ctx: CanvasRenderingContext2D = canvas.getContext("2d",{willReadFrequently: true}) as CanvasRenderingContext2D;
        let sections = 0;
        //console.log(`Shuffling array...`)
        //wallPatterns[type] = await shuffleArray(wallPatterns[type]) as Array<any>;
        let sY = 0;
        let sX = 0;
        while (sections < 16) {

            //wallPatterns[type] = await shuffleArray(wallPatterns[type]) as Array<any>;
            const pX = Math.floor(Math.random() * 16)*16;
            //console.log(`Cell: ${x}, ${y}\n-- Subcell: X: ${sX}, Y: ${sY}`)
            //console.log(part);
            //debugger

            console.log(`Placing section at internal ${sX}, ${sY}, pX ${pX * 16}`)
            ctx.putImageData(wallPatterns[type], (sX * 16) - pX, (sY * 16), pX, 0, 16, 16)
            sections++;
            sX ++;
            if(sections % 4 === 0){
                sY ++;
                sX = 0;
            }
            //if(sections === 3) debugger
        }
        //ctx.putImageData(wallPatterns[type], 0, 0)
        //console.log(`Painted cell ${x}, ${y}`)
        const cell = document.querySelector(`.cell-${x}-${y}.wall`);
        canvas.classList.add("tile");
        cell?.appendChild(canvas);
        resolve(true)
    })
}

function makeWalls(asset: string) {
    return new Promise(async (resolve) => {
        const demo = document.querySelector("#demo") as HTMLElement;
        demo.classList.add("demo");
        const canva = document.createElement("canvas");
        canva.width = 256;
        canva.height = 16;
        const img = new Image();
        demo.appendChild(canva)
        await loadAsset(canva, img, asset, 0, 0);
        console.log(wallPatterns);
        resolve(true)
    })

}



function loadAsset(canvas: HTMLCanvasElement, image: HTMLImageElement, asset: string, x: number, y: number) {
    return new Promise((resolve) => {
        // canva.style.width = "160px";
        // canva.style.height = "160px";
        const ctx: CanvasRenderingContext2D = canvas.getContext("2d",{willReadFrequently: true}) as CanvasRenderingContext2D;
        // @ts-ignore
        image.context = ctx;
        //console.log((rX * 16), (rY * 16))
        image.onload = (e) => {
            renderWall(e, image, 0, 0, 256, 16, 0, 0, 256, 16);
            // @ts-ignore
            wallPatterns[asset] = image.context.getImageData(0,0,256,16);
            resolve(true);
        }
        //console.log(`Loading asset location ${x * 16}, ${y * 16}`);
        image.src = `assets/${asset}.png`;
    })

}

// @ts-ignore
function renderWall(event, image, sX, sY, sW, sH, dX, dY, dW, dH) {
    event.target.context.drawImage(image, sX, sY, sW, sH, dX, dY, dW, dH);
}

function start(id: ImageData) {
    return new Promise((resolve) => {
        let output: HTMLCanvasElement = document.querySelector("#output") as HTMLCanvasElement;
        if (!output) return;
        const ctx: CanvasRenderingContext2D = output.getContext("2d",{willReadFrequently: true}) as CanvasRenderingContext2D;
        const imgData = ctx.createImageData(columns, rows);
        // input, width, height, N, outputWidth, outputHeight, periodicInput, periodicOutput, symmetry, ground
        // @ts-expect-error
        const model = new OverlappingModel(id.data, id.width, id.height, 2, columns, rows, true, false, 5, 0);
        //seed, limit
        var success = model.generate(Math.random, 0);
        model.graphics(imgData.data);
        ctx.putImageData(imgData, 0, 0)
        ctx.fillRect(0, 0, 1, rows);
        ctx.fillRect(0, 0, columns, 1);
        console.log(success);
        resolve(success);
    })

}


function highlight(cell: HTMLElement) {
    return new Promise((resolve) => {
        cell.classList.add("light");
        setTimeout(() => {
            cell.classList.remove("light");
            cell.classList.add("passed")
            resolve(true)
        }, 300)
    })
}

function delight(cell: HTMLElement) {
    return new Promise((resolve) => {
        cell.classList.add("light");
        setTimeout(() => {
            cell.classList.remove("light");
            cell.classList.remove("passed")
            resolve(true)
        }, 300)
    })
}

function checkIfWall(x: number, y: number, max_x: number, max_y: number) {
    if (x === 0 || x === max_x - 1 || y === 0 || y === max_y - 1) return true
    else if (cells[x][y].type === "wall") return true
    return false;
}

function createCell(x: number, y: number) {
    return new GridCell(x, y, false, "wall");
}
async function processMaze(maxX: number, maxY: number) {
    cells = new Array(maxX).fill([]).map(() => new Array(maxY))
    let x = 0;
    while (x < maxX) {
        let y = 0;
        while (y < maxY) {
            cells[x][y] = createCell(x, y);
            y++;
        }
        x++;
    }
    console.log("Done")
    return true;
}

function markCellVisited(x: number, y: number, maxX: number, maxY: number) {
    if (x < maxX && y < maxY) {
        if (cells[x][y].visited) {
            console.log(`====> Cell ${x}, ${y} already visited!!!!`)
        } else {
            step++;
            //console.log(`Marking cell at ${x}, ${y} visited. Step is now ${step}`)
            cells[x][y].visited = true;
            cells[x][y].visits = step;
            const cell = document.querySelector(`.cell-${x}-${y}`);
            //console.log(cell)
            if (cell && cells[x][y].type === "floor") {
                STEPS.push(cell as unknown as HTMLElement)
                cell.classList.add("visited");
                //cell.innerHTML = `[${x}, ${y}]: ${cells[x][y].visits}`
            }
        }

    }
}

function checkAllNeighbors(x: number, y: number, maxX: number, maxY: number): Array<any> {
    const neighbors = [];
    if ((x + 1) < maxX) neighbors.push(cells[x + 1][y])
    if ((x - 1) > 0) neighbors.push(cells[x - 1][y])
    if ((y + 1) < maxY) neighbors.push(cells[x][y + 1])
    if ((y - 1) > 0) neighbors.push(cells[x][y - 1])
    return neighbors;
}

function checkIfNeighborIsVisited(x: number, y: number, maxX: number, maxY: number) {
    if (x < maxX && y < maxY) {
        return cells[x][y].visited;
    }
    else return true;
}

function markCellAsFloor(x: number, y: number, maxX?: number, maxY?: number) {
    cells[x][y].type = "floor";
    cells[x][y].visits = step;
    step++;
}

function markCellAsWall(x: number, y: number, maxX?: number, maxY?: number) {
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

function getRandDir(DIRECTIONS: Array<any>) {
    const pick = Math.floor(Math.random() * DIRECTIONS.length)
    return DIRECTIONS[pick];
}

function hasNeighbor(x: number, y: number, maxX: number, maxY: number) {
    if (x < maxX && y < maxY) return cells[x][y]
    else return false;
}

function shuffleArray(array: Array<any>) {
    return new Promise((resolve) => {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            const temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
        resolve(array);
    })

}

async function checkCell(x: number, y: number, maxX: number, maxY: number) {
    markCellVisited(x, y, maxX, maxY);
    let DIRECTIONS = [ // UP/DOWN/LEFT/RIGHT
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
    ]
    DIRECTIONS = await shuffleArray(DIRECTIONS) as Array<any>;

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
            } else {
                await checkCell(x + DIR.x, y + DIR.y, maxX, maxY);
            }
        }
    }

    // @ts-ignore
    //document.querySelector(`.cell-${x}-${y}`).style.backgroundColor = null;
    return cells[x][y].type;
}
class GridCell {
    public x: number;
    public y: number;
    public visited: boolean;
    public type: "floor" | "wall";
    public visits: number = 0;

    constructor(x: number, y: number, visited: boolean, type: "floor" | "wall") {
        this.x = x;
        this.y = y;
        this.visited = visited;
        this.type = type;
        //console.log(`New cell made at ${x},${y}`)
    }

    public postProcess(x: any, y: any, maxX: any, maxY: any, comparators: Array<any>, callback: Function, update: Function) {
        if (comparators.find((cell: GridCell) => cell.type === "floor") !== undefined) {
            this.type = callback(x, y, maxX, maxY)
        } else {
            this.type = "wall"
        }
        update();
    }
}

document.addEventListener("DOMContentLoaded", ready);