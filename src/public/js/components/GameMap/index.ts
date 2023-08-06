class GameMap {
    cells: any;
    lastDirection: any; // TODO: type this
    directionCount: number = 0;
    step: number = 0;
    STEPS: HTMLElement[] = [];
    PATHLEN: number = 2;
    wallPatterns: { [key: string]: ImageData } = {};
    floorPatterns: { [key: string]: ImageData } = {};
    currentStep: number = 0;
    columns:number;
    rows:number;
    style:string;
    pixelTypes: { [key: string]: string | Function; } = {

    "0,0,0,255": "wall",
    "255,255,255,255": "floor",
    "255,0,0,255": this.markCellAsEither.bind(this)
}
    constructor(columns:number, rows:number, style:string){
        this.columns = columns;
        this.rows = rows;
        this.style = style;
    }

findPixel(image: ImageData, x: number, y: number) {
    let start = y * image.width + x;
    let index = start * 4;
    let data = image.data;
    return [data[index], data[index + 1], data[index + 2], data[index + 3]]
}

public async testwfc() {
    const canva = document.createElement("canvas");
    canva.id = "baseImg";
    canva.width = 5;
    canva.height = 5;
    const ctx: CanvasRenderingContext2D = canva.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
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
    await this.start(img);
    canva.height = this.rows;
    canva.width = this.columns;
    const maze: ImageData = ((document.querySelector("#output") as HTMLCanvasElement).getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D).getImageData(0, 0, canva.width, canva.height);
    //console.log(maze)
    for (let x = 0; x < canva.width; x++) {
        for (let y = 0; y < canva.height; y++) {
            const pixel = this.findPixel(maze, x, y).join(",");
            this.cells[x][y].type = this.pixelTypes[pixel];
            const cell = document.querySelector(`.cell-${x}-${y}`);
            cell?.classList.remove("floor", "wall");
            if (typeof this.pixelTypes[pixel] === "function") {
                setTimeout(() => {
                    this.cells[x][y].postProcess(x, y, this.columns, this.rows, this.checkAllNeighbors(x, y, this.columns, this.rows), this.pixelTypes[pixel], () => {
                        cell?.classList.add(this.cells[x][y].type);
                    })
                }, 10);
            } else {

                cell?.classList.add(this.cells[x][y].type);
            }
        }
    }
    setTimeout(await this.processWFC.bind(this), 20);
}

async processWFC() {
    let totalCells: number = 0;
    let floors: number = (() => {
        let count: number = 0;
        for (let x = 0; x < this.columns; x++) {
            for (let y = 0; y < this.rows; y++) {
                if (this.cells[x][y].type === "floor") {
                    count++;
                }
                totalCells++;
            }
        }
        return count;
    })()
    const ratio = floors / totalCells;
    if (ratio < .5) await this.testwfc();
    else {

        console.log(`Floor ratio is ${floors / totalCells}`);
        if (!await this.validateSteps(floors)) {
            document.querySelectorAll(".visited").forEach(ele => ele.classList.remove("visited"))
            await this.processMaze(this.columns, this.rows);
            await this.testwfc();
        }
        else await this.drawWalls("walls_1");
    }
}

validateSteps(count: number) {
    return new Promise(async (resolve) => {
        let x = Math.floor(Math.random() * this.columns);
        let y = Math.floor(Math.random() * this.rows);
        let startCell: GridCell = this.cells[x][y];
        while (startCell.type !== "floor") {
            x = Math.floor(Math.random() * this.columns);
            y = Math.floor(Math.random() * this.rows);
            startCell = this.cells[x][y];
        }
        console.log(`Starting cell for validation: [${x}, ${y}]`);
        await this.checkCell(x, y, this.columns, this.rows);

        let validated: number = document.querySelectorAll(".visited").length;
        if (validated !== count) {
            resolve(false)
        }
        resolve(true)
    })

}

async drawWalls(type: string) {
    await this.makeWalls(type);
    for (let x = 0; x < this.columns; x++) {
        for (let y = 0; y < this.rows; y++) {
            if (this.cells[x][y].type !== "floor") {
                await this.placeImage(x, y, this.wallPatterns[type], "wall");
            }
        }
    }
    await this.drawFloors("floors_1");
}

async drawFloors(type: string) {
    await this.makeFloors(type);
    for (let x = 0; x < this.columns; x++) {
        for (let y = 0; y < this.rows; y++) {
            if (this.cells[x][y].type == "floor") {
                await this.placeImage(x, y, this.floorPatterns[type], "floor");
            }
        }
    }
}

placeImage(x: number, y: number, pattern: ImageData, type: string) {
    return new Promise(async (resolve) => {
        const canvas: HTMLCanvasElement = document.createElement("canvas") as HTMLCanvasElement;
        canvas.width = 64;
        canvas.height = 64;
        const ctx: CanvasRenderingContext2D = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
        let sections = 0;
        let sY = 0;
        let sX = 0;
        while (sections < 16) {
            //wallPatterns[type] = await shuffleArray(wallPatterns[type]) as Array<any>;
            const pX = Math.floor(Math.random() * 16) * 16;
            //console.log(`Cell: ${x}, ${y}\n-- Subcell: X: ${sX}, Y: ${sY}`)
            //console.log(part);
            //debugger

            console.log(`Placing section at internal ${sX}, ${sY}, pX ${pX}`)
            ctx.putImageData(pattern, (sX * 16) - pX, (sY * 16), pX, 0, 16, 16)
            if (type === "floor") {
                console.log("Shuffling alpha colors")
                let alpha = await this.shuffleArray("0369fffffffffffffff".split(""))as Array<any>;
                console.log(alpha)
                const fillStyle = "#000000".padEnd(9, alpha[(Math.floor(Math.random() * alpha.length))]);
                console.log(`Settings fillStyle for location [${x}, ${y}] sub section [${sX}, ${sY}] to ${fillStyle}`)
                ctx.fillStyle = fillStyle;
                ctx.fillRect((sX * 16), (sY * 16), 16, 16);
            }
            sections++;
            sX++;
            if (sections % 4 === 0) {
                sY++;
                sX = 0;
            }
            //if(sections === 3) debugger
        }
        ctx.fillStyle = "#00000067";
        console.log(`Checking cell [${x},${y + 1}]`)
        if (type === "wall") {
            if (!this.checkIfWall(x, y + 1, this.columns, this.rows)) {
                ctx.fillRect(0, 0, 64, 40)
            } else {
                ctx.fillRect(0, 0, 64, 64)
            }
        }

        //ctx.putImageData(wallPatterns[type], 0, 0)
        //console.log(`Painted cell ${x}, ${y}`)
        const cell = document.querySelector(`.cell-${x}-${y}`);
        canvas.classList.add("tile");
        cell?.appendChild(canvas);
        resolve(true)
    })
}

makeWalls(asset: string) {
    return new Promise(async (resolve) => {
        const demo = document.querySelector("#demo") as HTMLElement;
        demo.classList.add("demo");
        const canva = document.createElement("canvas");
        canva.width = 256;
        canva.height = 16;
        const img = new Image();
        demo.appendChild(canva)
        this.wallPatterns[asset] = await this.loadAsset(canva, img, asset, 0, 0);
        console.log(this.wallPatterns);
        resolve(true)
    })

}

makeFloors(asset: string) {
    return new Promise(async (resolve) => {
        const demo = document.querySelector("#demo") as HTMLElement;
        const canva = document.createElement("canvas");
        canva.width = 256;
        canva.height = 16;
        const img = new Image();
        demo.appendChild(canva)
        this.floorPatterns[asset] = await this.loadAsset(canva, img, asset, 0, 0);
        console.log(this.floorPatterns);
        resolve(true)
    })

}



loadAsset(canvas: HTMLCanvasElement, image: HTMLImageElement, asset: string, x: number, y: number): Promise<ImageData> {
    return new Promise((resolve) => {
        // canva.style.width = "160px";
        // canva.style.height = "160px";
        const ctx: CanvasRenderingContext2D = canvas.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
        // @ts-ignore
        image.context = ctx;
        //console.log((rX * 16), (rY * 16))
        image.onload = (e) => {
            this.renderWall(e, image, 0, 0, 256, 16, 0, 0, 256, 16);
            // @ts-ignore
            resolve(image.context.getImageData(0, 0, 256, 16));
        }
        //console.log(`Loading asset location ${x * 16}, ${y * 16}`);
        image.src = `assets/${this.style}/${asset}.png`;
    })

}

// @ts-ignore
renderWall(event, image, sX, sY, sW, sH, dX, dY, dW, dH) {
    event.target.context.drawImage(image, sX, sY, sW, sH, dX, dY, dW, dH);
}

start(id: ImageData) {
    return new Promise((resolve) => {
        let output: HTMLCanvasElement = document.querySelector("#output") as HTMLCanvasElement;
        if (!output) return;
        const ctx: CanvasRenderingContext2D = output.getContext("2d", { willReadFrequently: true }) as CanvasRenderingContext2D;
        const imgData = ctx.createImageData(this.columns, this.rows);
        // input, width, height, N, outputWidth, outputHeight, periodicInput, periodicOutput, symmetry, ground
        // @ts-expect-error
        const model = new OverlappingModel(id.data, id.width, id.height, 2, this.columns, this.rows, true, false, 5, 0);
        //seed, limit
        var success = model.generate(Math.random, 0);
        model.graphics(imgData.data);
        ctx.putImageData(imgData, 0, 0)
        ctx.fillRect(0, 0, 1, this.rows);
        ctx.fillRect(0, 0, this.columns, 1);
        console.log(success);
        resolve(success);
    })

}


checkIfWall(x: number, y: number, max_x: number, max_y: number) {
    if (x === 0 || x >= max_x - 1) return true
    else if (y === 0 || y >= max_y - 1) return true
    else if (this.cells[x][y].type === "wall") return true
    else return false;
}

createCell(x: number, y: number) {
    return new GridCell(x, y, false, "wall");
}
public async processMaze(maxX: number, maxY: number) {
    this.cells = new Array(maxX).fill([]).map(() => new Array(maxY))
    let x = 0;
    while (x < maxX) {
        let y = 0;
        while (y < maxY) {
            this.cells[x][y] = this.createCell(x, y);
            y++;
        }
        x++;
    }
    console.log("Done")
    return true;
}

markCellVisited(x: number, y: number, maxX: number, maxY: number) {
    if (x < maxX && y < maxY) {
        if (this.cells[x][y].visited) {
            console.log(`====> Cell ${x}, ${y} already visited!!!!`)
        } else {
            this.step++;
            //console.log(`Marking cell at ${x}, ${y} visited. Step is now ${step}`)
            this.cells[x][y].visited = true;
            this.cells[x][y].visits = this.step;
            const cell = document.querySelector(`.cell-${x}-${y}`);
            //console.log(cell)
            if (cell && this.cells[x][y].type === "floor") {
                this.STEPS.push(cell as unknown as HTMLElement)
                cell.classList.add("visited");
                //cell.innerHTML = `[${x}, ${y}]: ${cells[x][y].visits}`
            }
        }

    }
}

checkAllNeighbors(x: number, y: number, maxX: number, maxY: number): Array<any> {
    const neighbors = [];
    if ((x + 1) < maxX) neighbors.push(this.cells[x + 1][y])
    if ((x - 1) > 0) neighbors.push(this.cells[x - 1][y])
    if ((y + 1) < maxY) neighbors.push(this.cells[x][y + 1])
    if ((y - 1) > 0) neighbors.push(this.cells[x][y - 1])
    return neighbors;
}

checkIfNeighborIsVisited(x: number, y: number, maxX: number, maxY: number) {
    if (x < maxX && y < maxY) {
        return this.cells[x][y].visited;
    }
    else return true;
}

markCellAsFloor(x: number, y: number, maxX?: number, maxY?: number) {
    this.cells[x][y].type = "floor";
    this.cells[x][y].visits = this.step;
    this.step++;
}

markCellAsWall(x: number, y: number, maxX?: number, maxY?: number) {
    this.cells[x][y].type = "wall";
}

markCellAsEither():any {
    const pick = Math.floor(Math.random() * 3);
    switch (pick % 3) {
        case 0:
            return "floor";
        case 1:
            return "wall";
        default:
            return this.markCellAsEither.call(this);
    }
}

getRandDir(DIRECTIONS: Array<any>) {
    const pick = Math.floor(Math.random() * DIRECTIONS.length)
    return DIRECTIONS[pick];
}

hasNeighbor(x: number, y: number, maxX: number, maxY: number) {
    if (x < maxX && y < maxY) return this.cells[x][y]
    else return false;
}

shuffleArray(array: Array<any>) {
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

async checkCell(x: number, y: number, maxX: number, maxY: number) {
    this.markCellVisited(x, y, maxX, maxY);
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
    DIRECTIONS = await this.shuffleArray(DIRECTIONS) as Array<any>;

    // @ts-ignore
    //document.querySelector(`.cell-${x}-${y}`).style.backgroundColor = "#0f0";
    //console.log("Direction Count:", directionCount, PATHLEN)

    /*
    Move in a direction until path length minimum reach,
    chooses random direction that is not same direction it came from
    */
    //console.log(previousDirection, DIRECTIONS)
    for (const DIR of DIRECTIONS) {
        if (!this.checkIfNeighborIsVisited(x + DIR.x, y + DIR.y, maxX, maxY)) {
            if (this.checkIfWall(x + DIR.x, y + DIR.y, maxX, maxY)) {

            } else {
                await this.checkCell(x + DIR.x, y + DIR.y, maxX, maxY);
            }
        }
    }

    return this.cells[x][y].type;
}
}
