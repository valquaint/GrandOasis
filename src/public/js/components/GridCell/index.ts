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

    public async Enter(source: Entity) {
        return new Promise((resolve) => {
            this.contents.push(source);
            root.querySelector(`.cell-${this.x}-${this.y}`)?.appendChild(source.element);
            console.log(`${source.name} has entered cell ${this.x}, ${this.y}`);
            resolve(true);
        })
    }

    public async Exit(source: Entity) {
        return new Promise((resolve) => {
            this.contents.splice(this.contents.indexOf(source), 1);
            console.log(`${source.name} has left cell ${this.x}, ${this.y}`);
            resolve(true);
        })
    }

    public get getContents() :Array<any>{
        return this.contents;
    }
}