"use strict";
class GridCell {
    x;
    y;
    visited;
    type;
    visits = 0;
    contents = [];
    constructor(x, y, visited, type) {
        this.x = x;
        this.y = y;
        this.visited = visited;
        this.type = type;
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
    async Enter(source) {
        return new Promise((resolve) => {
            this.contents.push(source);
            root.querySelector(`.cell-${this.x}-${this.y}`)?.appendChild(source.element);
            console.log(`${source.name} has entered cell ${this.x}, ${this.y}`);
            resolve(true);
        });
    }
    async Exit(source) {
        return new Promise((resolve) => {
            this.contents.splice(this.contents.indexOf(source), 1);
            console.log(`${source.name} has left cell ${this.x}, ${this.y}`);
            resolve(true);
        });
    }
    get getContents() {
        return this.contents;
    }
}
