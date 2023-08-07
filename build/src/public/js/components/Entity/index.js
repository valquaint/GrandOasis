"use strict";
class Entity {
    name;
    hp;
    damage;
    x;
    y;
    movable = true;
    htmlElement;
    constructor(name, hp, damage, x, y, style) {
        this.name = name;
        this.hp = hp;
        this.damage = damage;
        this.x = x;
        this.y = y;
        this.htmlElement = document.createElement("Entity");
        this.htmlElement.classList.add(...style);
    }
    async Bump(source) {
        source.hp -= this.damage;
        console.log(`${source.name} attacks ${this.name}`);
        if (source.hp <= 0) {
            console.log(`I should call ${this.name}.death()`);
        }
    }
    async Move(dir) {
        console.log(`Moving ${this.name} in direction ${dir.x}, ${dir.y}. They should be moving to ${this.x + dir.x}, ${this.y + dir.y}`);
        const oldCell = MAP.getCell(this.x, this.y);
        await oldCell.Exit(this);
        const cell = MAP.getCell(this.x + dir.x, this.y + dir.y);
        if (cell.type === "floor") {
            if (!cell.getContents.length) {
                const newCell = MAP.getCell(this.x + dir.x, this.y + dir.y);
                const success = await newCell.Enter(this);
                if (success) {
                    this.x += dir.x;
                    this.y += dir.y;
                }
            }
            else {
                for (const obj of cell.getContents) {
                    await obj.Bump(this);
                }
            }
        }
        this.movable = false;
        setTimeout(() => { this.movable = true; }, 500);
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
