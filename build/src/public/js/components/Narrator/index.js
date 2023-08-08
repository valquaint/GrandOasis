"use strict";
class Narrator {
    speed = 30; // Speed in ms to print animated lines
    element; // HTML element to treat as the terminal
    displayed;
    constructor() {
        this.element = document.createElement("narrator");
        this.element.classList.add("narrator");
        root.appendChild(this.element);
        this.element.style.display = "none";
        this.displayed = false;
    }
    show(text, width, height) {
        this.displayed = true;
        this.element.innerHTML = text;
        this.element.style.display = "initial";
        if (height && width) {
            console.log("Setting width and height");
            const h = (64 * height) - 141;
            const w = (64 * width) - 126;
            this.element.style.left = "63px";
            this.element.style.top = `${h}px`;
            this.element.style.width = `${w}px`;
        }
    }
    async explain(text, width, height) {
        return new Promise((resolve) => {
            this.displayed = true;
            this.element.style.display = "initial";
            this.element.innerHTML = "";
            if (height && width) {
                console.log("Setting width and height");
                const h = (64 * height) - 141;
                const w = (64 * width) - 126;
                this.element.style.left = "63px";
                this.element.style.top = `${h}px`;
                this.element.style.width = `${w}px`;
            }
            const out = document.createElement("div");
            this.element.appendChild(out);
            const chars = text.split("");
            let t = setInterval(async () => {
                if (chars.length) {
                    const next = chars.splice(0, 1);
                    out.innerHTML += next;
                }
                else {
                    clearInterval(t);
                    resolve(true);
                }
            }, this.speed);
        });
    }
    async clear() {
        this.element.innerHTML = "";
        this.element.style.display = "none";
        this.displayed = false;
        return true;
    }
    get onScreen() {
        return this.displayed;
    }
}
