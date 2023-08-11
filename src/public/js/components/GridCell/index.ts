class GridCell {
    public x: number;
    public y: number;
    public visited: boolean;
    public type: "floor" | "wall";
    public visits: number = 0;
    contents: any[] = [];

    constructor(x: number, y: number, visited: boolean, type: "floor" | "wall") {
        this.x = x;
        this.y = y;
        this.visited = visited;
        this.type = type;
    }

    public postProcess(x: any, y: any, maxX: any, maxY: any, comparators: Array<any>, callback: Function, update: Function) {
        if (comparators.find((cell: GridCell) => cell.type === "floor") !== undefined) {
            this.type = callback(x, y, maxX, maxY)
        } else {
            this.type = "wall"
        }
        update();
    }

    public async Enter(source: Entity|Stairs, oldCell?:GridCell) {
        return new Promise(async(resolve) => {
            console.log(`${source.name} called ENTER on cell ${this.x}, ${this.y}. Cell has contents length of ${this.contents.length}`, this.contents)
            if (this.contents.length === 0) {
                this.contents.push(source);
                root.querySelector(`.cell-${this.x}-${this.y}`)?.appendChild(source.element);
                console.log(`${source.name} has entered cell ${this.x}, ${this.y}`);
                console.log(`Passing ENTER for ${source.name} on cell ${this.x}, ${this.y}`)
                if( oldCell) await oldCell.Exit(source);
                resolve(true);
            }else{
                resolve(false)
            }
        })
    }

    public async Exit(source: Entity|Stairs) {
        return new Promise((resolve) => {
            console.log(`${source.name} called EXIT on cell ${this.x}, ${this.y}. Cell has contents length of ${this.contents.length}`, this.contents)
            this.contents.splice(this.contents.indexOf(source), 1);
            console.log(`${source.name} has left cell ${this.x}, ${this.y}`);
            console.log(`Resolving EXIT on cell ${this.x}, ${this.y}. Cell has contents length of ${this.contents.length}`, this.contents)
            resolve(true);
        })
    }

    public get getContents(): Array<any> {
        return this.contents;
    }
}