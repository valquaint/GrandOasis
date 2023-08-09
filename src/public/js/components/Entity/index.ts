
class Entity {
    name: string;
    hp: number;
    damage: number;
    x: number;
    y: number;
    movable: boolean = true;
    htmlElement: HTMLElement;
    onDeath: Function;
    constructor(name: string, hp: number, damage: number, x: number, y: number, style: string[], onDeath?:Function) {
        this.name = name;
        this.hp = hp;
        this.damage = damage;
        this.x = x;
        this.y = y;
        this.htmlElement = document.createElement("Entity");
        this.htmlElement.classList.add(...style)
        if(onDeath!== undefined) this.onDeath = onDeath;
        else this.onDeath = () => new Promise((resolve) => resolve(console.log("Rip anonymous")))
    }

    public async Bump(source: Entity) {
        source.hp -= this.damage;
        console.log(`${source.name} attacks ${this.name}`)
        if (source.hp <= 0) {
            if(this.onDeath!== undefined) await this.onDeath()
        }
    }

    public async Move(dir: Direction) {
        console.log(`Moving ${this.name} in direction ${dir.x}, ${dir.y}. They should be moving to ${this.x + dir.x}, ${this.y + dir.y}`);
        const oldCell:GridCell = MAP.getCell(this.x, this.y);
        await oldCell.Exit(this);
        const cell: GridCell = MAP.getCell(this.x + dir.x, this.y + dir.y);
        if (cell.type === "floor") {
            if (!cell.getContents.length) {
                const newCell = MAP.getCell(this.x + dir.x, this.y + dir.y);
                const success = await newCell.Enter(this);
                if (success) {
                    this.x += dir.x;
                    this.y += dir.y;
                }
            }else{
                for(const obj of cell.getContents){
                    await obj.Bump(this);
                }
            }

        }
        this.movable = false;
        setTimeout(() => { this.movable = true }, 500);
    }


    public get canMove(): boolean {
        return this.movable;
    }


    public set canMove(v: boolean) {
        this.canMove = v;
    }

    public get element(): HTMLElement {
        return this.htmlElement;
    }
}