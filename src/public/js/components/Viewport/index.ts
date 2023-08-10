class Viewport {
    width:number;
    height:number;
    htmlElement:HTMLElement;
    player:Entity|null = null;
    constructor(width:number, height:number, style:string[]){
        this.htmlElement = document.createElement("viewport");
        this.htmlElement.classList.add(...style)
        this.width = 64 * width;
        this.height = 64 * height;
        this.htmlElement.style.width = `${this.width}px`;
        this.htmlElement.style.height = `${this.height}px`;
        document.body.prepend(this.htmlElement);
        this.htmlElement.appendChild(root);
    }

    update(Player:Entity){
        const scrollLeft = (64 * Player.x) - ((this.width - 64) / 2);
        const scrollTop = (64 * Player.y) - ((this.height - 64) / 2);
        this.htmlElement.scrollLeft = Math.round(scrollLeft);
        this.htmlElement.scrollTop = Math.round(scrollTop);
    }
}