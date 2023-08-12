class Chest {
    contents: Item;
    element: HTMLElement;
    x: number;
    y: number;
    name:string = "Chest";
    constructor(item: Item, x: number, y: number) {
        this.contents = item;
        this.x = x;
        this.y = y;
        this.element = document.createElement("div");
        this.element.classList.add("chest");
    }

    public async Bump(source: Entity) {
        return new Promise(async (resolve) => {
            if (source.hp_max > 0) {
                console.log(`${source.name} calls BUMP on the chest at ${this.x}, ${this.y}`);
                this.contents.use(source);
                const myCell = MAP.getCell(this.x, this.y);
                myCell.Exit(this);
                this.element.classList.add("open");
                document.querySelector(`.chest.open`)?.remove();
                resolve(true);
            } else {
                resolve(true)
            }
            resolve(true)
        })

    }
}