"use strict";
class Chest {
    contents;
    element;
    x;
    y;
    name = "Chest";
    constructor(item, x, y) {
        this.contents = item;
        this.x = x;
        this.y = y;
        this.element = document.createElement("div");
        this.element.classList.add("chest");
    }
    async Bump(source) {
        return new Promise(async (resolve) => {
            if (source.hp_max > 0) {
                console.log(`${source.name} calls BUMP on the chest at ${this.x}, ${this.y}`);
                this.contents.use(source);
                const myCell = MAP.getCell(this.x, this.y);
                myCell.Exit(this);
                this.element.classList.add("open");
                document.querySelector(`.chest.open`)?.remove();
                resolve(true);
            }
            else {
                resolve(true);
            }
            resolve(true);
        });
    }
}
