
class Entity {
    name: string;
    hp: number;
    hp_max: number = 0;
    damage: number;
    x: number;
    y: number;
    movable: boolean = true;
    htmlElement: HTMLElement;
    onDeath: Function;
    movePattern: Entity | string = "none";
    scoreValue: number = 0;
    constructor(name: string, hp: number | number[], damage: number, x: number, y: number, style: string[], onDeath?: Function, movePattern?: Entity | string, scoreValue?: number) {
        this.name = name;
        if (typeof hp !== "number") {
            this.hp = hp[0];
            this.hp_max = hp[1];
        }
        else this.hp = hp;
        this.damage = damage;
        this.x = x;
        this.y = y;
        this.htmlElement = document.createElement("Entity");
        this.htmlElement.classList.add(...style)
        if (onDeath !== undefined) this.onDeath = onDeath;
        else this.onDeath = () => new Promise((resolve) => resolve(console.log("Rip anonymous")))
        if (movePattern) this.movePattern = movePattern;
        if (scoreValue) this.scoreValue = scoreValue;
    }

    public async Bump(source: Entity) {
        return new Promise(async (resolve) => {
            if (source !== this) {
                this.hp -= source.damage;
                console.log(`${source.name} calls BUMP on ${this.name}, dealing ${source.damage} to ${this.name}. ${this.name}'s HP is now ${this.hp}`)
                if (this.hp <= 0) {
                    if (this.onDeath !== undefined) await this.onDeath()
                    resolve(true)
                }
                resolve(true)
            }
            resolve(false)
        })

    }

    public Move(dir: Direction, view?: Viewport) {
        return new Promise(async (resolve) => {
            console.log(`Moving ${this.name} in direction ${dir.x}, ${dir.y}. They should be moving to ${this.x + dir.x}, ${this.y + dir.y}`);
            this.element.classList.remove("left", "right", "up", "down");
            if (dir.name) { this.element.classList.add(dir.name) }
            const oldCell: GridCell = MAP.getCell(this.x, this.y);
            const cell: GridCell = MAP.getCell(this.x + dir.x, this.y + dir.y);
            if (cell.type === "floor") {
                if (!cell.getContents.length) {
                    const newCell = MAP.getCell(this.x + dir.x, this.y + dir.y);
                    const success = await newCell.Enter(this, oldCell);
                    if (success) {
                        this.x += dir.x;
                        this.y += dir.y;
                        if (view) view.update(this);
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