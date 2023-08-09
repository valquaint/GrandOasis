
class Entity {
    name: string;
    hp: number;
    damage: number;
    x: number;
    y: number;
    movable: boolean = true;
    htmlElement: HTMLElement;
    onDeath: Function;
    movePattern: Entity | string = "none";
    constructor(name: string, hp: number, damage: number, x: number, y: number, style: string[], onDeath?: Function, movePattern?: Entity | string) {
        this.name = name;
        this.hp = hp;
        this.damage = damage;
        this.x = x;
        this.y = y;
        this.htmlElement = document.createElement("Entity");
        this.htmlElement.classList.add(...style)
        if (onDeath !== undefined) this.onDeath = onDeath;
        else this.onDeath = () => new Promise((resolve) => resolve(console.log("Rip anonymous")))
        if (movePattern) this.movePattern = movePattern;
    }

    public async Bump(source: Entity) {
        if (source !== this) {
            source.hp -= this.damage;
            console.log(`${source.name} calls BUMP on ${this.name}`)
            if (source.hp <= 0) {
                if (this.onDeath !== undefined) await this.onDeath()
            }
            return true
        }
        return false
    }

    public Move(dir: Direction) {
        return new Promise(async (resolve) => {
            console.log(`Moving ${this.name} in direction ${dir.x}, ${dir.y}. They should be moving to ${this.x + dir.x}, ${this.y + dir.y}`);
            const oldCell: GridCell = MAP.getCell(this.x, this.y);
            const cell: GridCell = MAP.getCell(this.x + dir.x, this.y + dir.y);
            if (cell.type === "floor") {
                if (!cell.getContents.length) {
                    const newCell = MAP.getCell(this.x + dir.x, this.y + dir.y);
                    const success = await newCell.Enter(this, oldCell);
                    if (success) {
                        this.x += dir.x;
                        this.y += dir.y;
                    }
                    resolve(success);
                } else {
                    for (const obj of cell.getContents) {
                        await obj.Bump(this);
                        resolve(true);
                    }
                }
    
            }
            this.movable = false;
            setTimeout(() => { this.movable = true }, 500);
            resolve(false);
    
        })
    }

    public async wander() {
        const getDistance = (trg: Entity) => {
            const distX = (this.x - trg.x)
            const distY = (this.y - trg.y)
            const dist = Math.ceil(Math.hypot(distX + distY));
            console.log(`Distance from ${this.name} to ${trg.name} is ${dist}`)
            let dir: Direction = { x: 0, y: 0 };
            if (Math.abs(trg.x - this.x) + Math.abs(trg.y - this.y) <= 1) {
                dir = {
                    x: trg.x - this.x,
                    y: trg.y - this.y
                }
            }
            return { dist: dist, dir: dir };
        }
        console.log(typeof this.movePattern)
        if (typeof this.movePattern !== "string") {
            const loc = getDistance(this.movePattern);
            if (loc.dist === 1) {
                console.log("Attempting to chase target")
                await this.Move(loc.dir);
            } else {
                const pick = Math.floor(Math.random() * moveDirections.length);
                await this.Move(moveDirections[pick]);
            }
        } else {
            if (this.movePattern !== "none") {
                const pick = Math.floor(Math.random() * moveDirections.length);
                await this.Move(moveDirections[pick]);
            }
        }
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