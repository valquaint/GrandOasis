"use strict";
class Statpanel {
    element;
    width;
    height;
    //statItems
    constructor(width, height) {
        this.element = document.createElement("statpanel");
        this.element.classList.add("statpanel");
        const hud = document.querySelector("#hud");
        this.width = (width * 64) - 8;
        this.height = (height * 64) - 22;
        this.element.style.width = `${this.width}px`;
        this.element.style.height = `${this.height}px`;
        this.element.style.left = `2px`;
        this.element.style.top = `2px`;
        hud.prepend(this.element);
    }
}
