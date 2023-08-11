"use strict";
class Entity {
    name;
    hp;
    hp_max = 0;
    damage;
    x;
    y;
    movable = true;
    htmlElement;
    onDeath;
    movePattern = "none";
    scoreValue = 0;
    constructor(name, hp, damage, x, y, style, onDeath, movePattern, scoreValue) {
        this.name = name;
        if (typeof hp !== "number") {
            this.hp = hp[0];
            this.hp_max = hp[1];
        }
        else
            this.hp = hp;
        this.damage = damage;
        this.x = x;
        this.y = y;
        this.htmlElement = document.createElement("Entity");
        this.htmlElement.classList.add(...style);
        if (onDeath !== undefined)
            this.onDeath = onDeath;
        else
            this.onDeath = () => new Promise((resolve) => resolve(console.log("Rip anonymous")));
        if (movePattern)
            this.movePattern = movePattern;
        if (scoreValue)
            this.scoreValue = scoreValue;
    }
    async Bump(source) {
        return new Promise(async (resolve) => {
            if (source !== this) {
                if (source.hp_max > 0 || this.hp_max > 0) {
                    this.hp -= source.damage;
                    console.log(`${source.name} calls BUMP on ${this.name}, dealing ${source.damage} to ${this.name}. ${this.name}'s HP is now ${this.hp}`);
                    if (this.hp <= 0) {
                        if (this.onDeath !== undefined)
                            await this.onDeath();
                        resolve(true);
                    }
                }
                else {
                    resolve(true);
                }
                resolve(true);
            }
            resolve(false);
        });
    }
    Move(dir, view) {
        return new Promise(async (resolve) => {
            console.log(`Moving ${this.name} in direction ${dir.x}, ${dir.y}. They should be moving to ${this.x + dir.x}, ${this.y + dir.y}`);
            this.element.classList.remove("left", "right", "up", "down");
            if (dir.name) {
                this.element.classList.add(dir.name);
            }
            const oldCell = MAP.getCell(this.x, this.y);
            const cell = MAP.getCell(this.x + dir.x, this.y + dir.y);
            if (cell.type === "floor") {
                if (!cell.getContents.length) {
                    const newCell = MAP.getCell(this.x + dir.x, this.y + dir.y);
                    const success = await newCell.Enter(this, oldCell);
                    if (success) {
                        this.x += dir.x;
                        this.y += dir.y;
                        if (view)
                            view.update(this);
                    }
                    resolve(success);
                }
                else {
                    for (const obj of cell.getContents) {
                        if (this.hp > 0)
                            await obj.Bump(this);
                        resolve(true);
                    }
                }
            }
            this.movable = false;
            setTimeout(() => { this.movable = true; }, 500);
            resolve(false);
        });
    }
    async wander() {
        const getDistance = (trg) => {
            const distX = (this.x - trg.x);
            const distY = (this.y - trg.y);
            const dist = Math.ceil(Math.hypot(distX + distY));
            console.log(`Distance from ${this.name} to ${trg.name} is ${dist}`);
            let dir = { x: 0, y: 0, name: "" };
            if (Math.abs(trg.x - this.x) + Math.abs(trg.y - this.y) <= 1) {
                dir = {
                    x: trg.x - this.x,
                    y: trg.y - this.y
                };
            }
            if (dir.x === 1)
                dir.name = "right";
            if (dir.x === -1)
                dir.name = "left";
            if (dir.y === 1)
                dir.name = "down";
            if (dir.y === -1)
                dir.name = "up";
            return { dist: dist, dir: dir };
        };
        console.log(typeof this.movePattern);
        if (typeof this.movePattern !== "string") {
            const loc = getDistance(this.movePattern);
            if (loc.dist === 1) {
                console.log("Attempting to chase target");
                await this.Move(loc.dir);
            }
            else {
                const pick = Math.floor(Math.random() * moveDirections.length);
                await this.Move(moveDirections[pick]);
            }
        }
        else {
            if (this.movePattern !== "none") {
                const pick = Math.floor(Math.random() * moveDirections.length);
                await this.Move(moveDirections[pick]);
            }
        }
    }
    get canMove() {
        return this.movable;
    }
    set canMove(v) {
        this.canMove = v;
    }
    get element() {
        return this.htmlElement;
    }
}
