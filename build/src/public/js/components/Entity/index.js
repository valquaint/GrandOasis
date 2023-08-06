"use strict";
class Entity {
    name;
    hp;
    damage;
    x;
    y;
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
    // TODO: change type from number to custom DIRECTION class
    async Move(dir) {
        console.log(`Moving ${this.name} in direction ${dir}`);
    }
}
