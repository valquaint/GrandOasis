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