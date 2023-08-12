class Narrator {
    speed = 30; // Speed in ms to print animated lines
    element:HTMLElement; // HTML element to treat as the terminal
    displayed:boolean;
    constructor() {
        this.element = document.createElement("narrator")as HTMLElement;
        this.element.classList.add("narrator");
        const hud = document.querySelector("#hud")as HTMLElement;
        hud.appendChild(this.element);
        this.element.style.display = "none";
        this.displayed = false;
    }

    show(text:string, width?: number, height?:number) {
        this.displayed = true;
        this.element.innerHTML = text;
        this.element.style.display = "table-cell";
        if(height && width){
            console.log("Setting width and height")
            const w = (64 * width)-64;
            const top = (height * 16)*2;
            this.element.style.left =  "22px";
            this.element.style.width = `${w}px`;
            this.element.style.top = `${top+64}px`;
        }
    }

    async explain(text:string, width?: number, height?:number, element?:HTMLElement) {
        return new Promise((resolve) => {
            this.displayed = true;
            this.element.style.display = "table-cell";
            this.element.innerHTML = "";
            if(element) this.element.appendChild(element);
            if(height && width){
                console.log("Setting width and height")
                const w = (64 * width)-64;
                const top = (height * 16)*2;
                this.element.style.left =  "22px";
                this.element.style.width = `${w}px`;
                this.element.style.top = `${top+64}px`;
            }
            const out = document.createElement("div");
            this.element.appendChild(out);
            const chars = text.split("");
            let t = setInterval(async () => {
                if (chars.length) {
                    const next = chars.splice(0, 1);
                    out.innerHTML += next;
                } else {
                    clearInterval(t);
                    resolve(true);
                }
            }, this.speed)
        })

    }

    async clear() {
        this.element.innerHTML = "";
        this.element.style.display = "none"
        this.displayed = false;
        return true;
    }

    
    public get onScreen() : boolean {
        return this.displayed;
    }
    
}