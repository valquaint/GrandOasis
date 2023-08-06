"use strict";
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
