class Statpanel {
    element:HTMLElement;
    width:number;
    height:number;
    //statItems
    constructor(width:number, height:number) {
        this.element = document.createElement("statpanel")as HTMLElement;
        this.element.classList.add("statpanel");
        const hud = document.querySelector("#hud")as HTMLElement;
        this.width = (width * 64) - 8;
        this.height = (height * 64) - 22;
        this.element.style.width = `${this.width}px`
        this.element.style.height = `${this.height}px`
        this.element.style.left = `2px`
        this.element.style.top = `2px`
        hud.prepend(this.element);
    }
}