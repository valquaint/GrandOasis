"use strict";
const EnemyRanks = [
    [{ name: "Rat", hp: 1, damage: 0, style: ["enemy", "rat"], scoreValue: 1 }],
    [{ name: "Bat", hp: 2, damage: 0, style: ["enemy", "bat"], scoreValue: 2 }],
    [{ name: "Slime", hp: 3, damage: 1, style: ["enemy", "slime"], scoreValue: 5 }],
    [{ name: "Snake", hp: 3, damage: 2, style: ["enemy", "snake"], scoreValue: 7 }],
    [{ name: "Wolf", hp: 5, damage: 2, style: ["enemy", "wolf"], scoreValue: 10 }],
    [{ name: "Wraith", hp: 7, damage: 2, style: ["enemy", "wraith"], scoreValue: 15 }],
    [{ name: "Skeleton", hp: 10, damage: 3, style: ["enemy", "skeleton"], scoreValue: 20 }],
    [{ name: "Bear", hp: 15, damage: 5, style: ["enemy", "bear"], scoreValue: 30 }],
    [{ name: "Luna", hp: 35, damage: 7, style: ["enemy", "luna"], scoreValue: 50 }],
    [{ name: "Stormy", hp: 50, damage: 10, style: ["enemy", "stormy"], scoreValue: 80 }], // Floors 1-100
];
const Bosses = [
    { name: "Stormy", hp: 50, damage: 5, style: ["enemy", "stormy"], scoreValue: 100 },
    { name: "Robot", hp: 80, damage: 10, style: ["enemy", "robot"], scoreValue: 150 },
    { name: "Demon", hp: 120, damage: 18, style: ["enemy", "demon"], scoreValue: 200 },
    { name: "Dragon", hp: 170, damage: 28, style: ["enemy", "dragon"], scoreValue: 300 } // Floor 100
];
class Enemy extends Entity {
    constructor(difficulty, x, y, onDeath, movePattern) {
        const allowed = [];
        for (let i = 0; i < difficulty; i++) {
            allowed.push(...EnemyRanks[i]);
        }
        const pick = Math.floor(Math.random() * allowed.length);
        const ENM = allowed[pick];
        super(ENM.name, ENM.hp, ENM.damage, x, y, ENM.style, onDeath, movePattern, ENM.scoreValue);
        console.log(`Created new ${this.name}`, this);
    }
}
class Boss extends Entity {
    constructor(difficulty, x, y, onDeath, movePattern) {
        const Boss = Bosses[difficulty];
        super(Boss.name, Boss.hp, Boss.damage, x, y, Boss.style, onDeath, movePattern, Boss.scoreValue);
        console.log(`Created new ${this.name}`, this);
    }
}
