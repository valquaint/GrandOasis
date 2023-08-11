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
    async Enter(source, oldCell) {
        return new Promise(async (resolve) => {
            console.log(`${source.name} called ENTER on cell ${this.x}, ${this.y}. Cell has contents length of ${this.contents.length}`, this.contents);
            if (this.contents.length === 0) {
                this.contents.push(source);
                root.querySelector(`.cell-${this.x}-${this.y}`)?.appendChild(source.element);
                console.log(`${source.name} has entered cell ${this.x}, ${this.y}`);
                console.log(`Passing ENTER for ${source.name} on cell ${this.x}, ${this.y}`);
                if (oldCell)
                    await oldCell.Exit(source);
                resolve(true);
            }
            else {
                resolve(false);
            }
        });
    }
    async Exit(source) {
        return new Promise((resolve) => {
            console.log(`${source.name} called EXIT on cell ${this.x}, ${this.y}. Cell has contents length of ${this.contents.length}`, this.contents);
            this.contents.splice(this.contents.indexOf(source), 1);
            console.log(`${source.name} has left cell ${this.x}, ${this.y}`);
            console.log(`Resolving EXIT on cell ${this.x}, ${this.y}. Cell has contents length of ${this.contents.length}`, this.contents);
            resolve(true);
        });
    }
    get getContents() {
        return this.contents;
    }
}
