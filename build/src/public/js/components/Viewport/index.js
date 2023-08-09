"use strict";
class Viewport {
    width;
    height;
    htmlElement;
    player = null;
    constructor(width, height, style) {
        this.htmlElement = document.createElement("viewport");
        this.htmlElement.classList.add(...style);
        this.width = 64 * width;
        this.height = 64 * height;
        this.htmlElement.style.width = `${this.width}px`;
        this.htmlElement.style.height = `${this.height}px`;
        document.body.prepend(this.htmlElement);
        this.htmlElement.appendChild(root);
    }
    update(Player) {
        const scrollLeft = (64 * Player.x) - ((this.width - 64) / 2);
        const scrollTop = (64 * Player.y) - ((this.height - 64) / 2);
        this.htmlElement.scrollLeft = Math.round(scrollLeft);
        this.htmlElement.scrollTop = Math.round(scrollTop);
    }
}
