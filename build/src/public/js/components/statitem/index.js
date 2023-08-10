"use strict";
class Statitem {
    element;
    width;
    x;
    y;
    type;
    child;
    name;
    counter = null;
    constructor(name, x, y, width, type, options) {
        this.element = document.createElement("stat");
        this.width = width * 32;
        this.x = x * 64;
        this.y = y * 64;
        this.element.style.top = `${this.y}px`;
        this.type = type;
        this.name = name;
        switch (this.type) {
            case "counter":
                this.child = document.createElement("div");
                if (options.icon) {
                    console.log("Applying icon");
                    const img = new Image();
                    img.src = `assets/${options.icon}.png`;
                    img.classList.add("icon");
                    this.child.appendChild(img);
                }
                this.counter = document.createElement("span");
                this.child.appendChild(this.counter);
                break;
            case "meter":
                this.child = document.createElement("progress");
                this.child.setAttribute("max", "100");
                // Testing
                this.child.setAttribute("value", "50");
                if (options.icon) {
                    console.log("Applying icon");
                    const img = new Image();
                    img.src = `assets/${options.icon}.png`;
                    img.classList.add("icon");
                    this.element.prepend(img);
                }
                break;
            case "image":
                const img = new Image();
                img.src = `assets/${options.image}.png`;
                this.child = img;
                this.counter = new Image();
                this.counter.classList.add("held");
                this.child.appendChild(this.counter);
                break;
            default:
                this.child = document.createElement("div");
        }
        this.child.classList.add("statItem", this.type, this.name);
        this.element.classList.add(this.name);
        this.element.appendChild(this.child);
    }
    update(value) {
        console.log(`Stat item ${this.type} of ${this.name} has been updated to value ${value}`);
        switch (this.type) {
            case "counter":
                if (this.counter !== null)
                    this.counter.innerHTML = value;
                break;
            case "meter":
                this.child.setAttribute("value", value.toString());
                break;
            case "image":
                switch (typeof value) {
                    case "string":
                        const img = new Image();
                        img.src = `assets/${value}.png`;
                        this.counter = img;
                        break;
                    case "number":
                        if (!this.counter || this.counter.tagName.toLowerCase() === "img") {
                            if (this.counter)
                                this.child.removeChild(this.counter);
                            this.counter = document.createElement("span");
                            this.counter.classList.add("value");
                            this.element.prepend(this.counter);
                        }
                        this.counter.innerHTML = value.toString();
                        break;
                }
                break;
        }
    }
}
