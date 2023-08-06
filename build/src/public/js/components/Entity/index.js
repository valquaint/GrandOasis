"use strict";
class Entity {
    name;
    hp;
    damage;
    x;
    y;
    movable = true;
    constructor(name, hp, damage, x, y) {
        this.name = name;
        this.hp = hp;
        this.damage = damage;
        this.x = x;
        this.y = y;
    }
    async Bump(source) {
        source.hp -= this.damage;
        console.log(`${this.name} attacks ${source.name}`);
        if (source.hp <= 0) {
            console.log(`I should call ${source.name}.death()`);
        }
    }
    async Move(dir) {
        console.log(`Moving ${this.name} in direction ${dir}`);
        this.movable = false;
        setTimeout(() => { this.movable = true; }, 1000);
    }
    get canMove() {
        return this.movable;
    }
    set canMove(v) {
        this.canMove = v;
    }
}
