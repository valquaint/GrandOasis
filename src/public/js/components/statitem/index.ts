
type StatOptions = {
    image?: string,
    icon?:string
}
class Statitem {
    element: HTMLElement;
    width: number;
    x: number;
    y: number;
    type: "counter" | "meter" | "image";
    child: HTMLElement | HTMLProgressElement | HTMLImageElement;
    name: string;
    counter:HTMLElement|HTMLImageElement|null = null;
    constructor(name: string, x: number, y: number, width: number, type: "counter" | "meter" | "image", options: StatOptions) {
        this.element = document.createElement("stat");
        this.width = width * 32;
        this.element.style.width = `${this.width}px`;
        this.x = x * 64;
        this.y = y * 64;
        this.element.style.top = `${this.y}px`;
        this.type = type;
        this.name = name;
        switch (this.type) {
            case "counter":
                this.child = document.createElement("div") as HTMLElement;
                if (options.icon) {
                    console.log("Applying icon")
                    const img = new Image();
                    img.src = `assets/${options.icon}.png`
                    img.classList.add("icon");
                    this.child.appendChild(img);
                }
                this.counter = document.createElement("span") as HTMLElement
                this.child.appendChild(this.counter);
                break;
            case "meter":
                this.child = document.createElement("progress") as HTMLProgressElement;
                this.child.setAttribute("max", "100");
                // Testing
                this.child.setAttribute("value", "50")
                if (options.icon) {
                    console.log("Applying icon")
                    const img = new Image();
                    img.src = `assets/${options.icon}.png`
                    img.classList.add("icon");
                    this.element.prepend(img);
                }
                break;
            case "image":
                const img = new Image();
                img.src = `assets/${options.image}.png`
                this.child = img;
                this.counter = new Image()
                this.counter.classList.add("held");
                this.child.appendChild(this.counter);
                break;
            default:
                this.child = document.createElement("div") as HTMLElement;
        }
        this.child.classList.add("statItem", this.type, this.name);
        this.element.classList.add(this.name);
        this.element.appendChild(this.child)
    }

    update(value:string|number){
        console.log(`Stat item ${this.type} of ${this.name} has been updated to value ${value}`)
        switch(this.type){
            case "counter":
                if(this.counter!==null) this.counter.innerHTML = value as string;
                break;
            case "meter":
                this.child.setAttribute("value", value.toString());
                break;
            case "image":
                const img = new Image();
                img.src = `assets/${value}.png`;
                this.counter = img;
                break;
        }
    }
}