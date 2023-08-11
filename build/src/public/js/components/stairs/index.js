"use strict";
class Stairs {
    element;
    name = "Stairs";
    constructor() {
        this.element = document.createElement("stairs");
        this.element.classList.add("stairs");
    }
    async Bump(source) {
        return new Promise(async (resolve) => {
            if (source.hp_max !== 0) {
                GameLoop();
                resolve(true);
            }
            resolve(false);
        });
    }
}
