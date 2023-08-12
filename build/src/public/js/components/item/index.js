"use strict";
const ItemTypes = [
    [{ name: "Sword", damage: 1, durability: 4, image: "sword", type: "equipment" }, { name: "Meh Non-crusted Sandwich-Like French Toast", damage: 3, durability: 0, image: "nocrust", type: "healing" }],
    [{ name: "Bow", damage: 2, durability: 5, image: "bow", type: "equipment" }, { name: "Okay Non-crusted Sandwich-Like French Toast", damage: 5, durability: 0, image: "nocrust", type: "healing" }],
    [{ name: "Shield", damage: 1, durability: 4, image: "shield", type: "equipment" }],
    [{ name: "Axe", damage: 1, durability: 4, image: "axe", type: "equipment" }],
    [{ name: "Mace", damage: 1, durability: 4, image: "mace", type: "equipment" }, { name: "Decent Non-crusted Sandwich-Like French Toast", damage: 7, durability: 0, image: "nocrust", type: "healing" }],
    [{ name: "Sword", damage: 1, durability: 4, image: "sword", type: "equipment" }],
    [{ name: "Bow", damage: 2, durability: 5, image: "bow", type: "equipment" }, { name: "Better Non-crusted Sandwich-Like French Toast", damage: 10, durability: 0, image: "nocrust", type: "healing" }],
    [{ name: "Shield", damage: 1, durability: 4, image: "shield", type: "equipment" }],
    [{ name: "Axe", damage: 1, durability: 4, image: "axe", type: "equipment" }, { name: "Well-Made Non-crusted Sandwich-Like French Toast", damage: 20, durability: 0, image: "nocrust", type: "healing" }],
    [{ name: "Mace", damage: 1, durability: 4, image: "mace", type: "equipment" }, { name: "Gourmet Non-crusted Sandwich-Like French Toast", damage: 30, durability: 0, image: "nocrust", type: "healing" }], // Floors 91 - 100
];
class Item {
    damage;
    durability;
    element;
    type;
    name;
    image;
    constructor(name, damage, durability, image, type) {
        if (typeof name === "string" && damage && durability && image && type) {
            this.name = name;
            this.damage = damage;
            this.durability = durability;
            this.element = document.createElement("div");
            this.element.classList.add("itemDisplay");
            this.image = image;
            this.element.style.background = `url("../assets/items/${this.image}.png") no-repeat`;
            this.type = type;
        }
        else {
            const allowed = [];
            const difficulty = name;
            console.log(`Difficulty is ${difficulty}`);
            for (let i = 0; i < difficulty; i++) {
                allowed.push(...ItemTypes[i]);
            }
            const pick = Math.floor(Math.random() * allowed.length);
            const ITM = allowed[pick];
            this.name = ITM.name;
            this.damage = ITM.damage;
            this.durability = ITM.durability;
            this.element = document.createElement("div");
            this.element.classList.add("itemDisplay");
            this.image = ITM.image;
            this.element.style.background = `url("../assets/items/${ITM.image}.png") no-repeat`;
            this.type = ITM.type;
            console.log(`Created new ${this.name}`, this);
        }
    }
    async use(source) {
        switch (this.type) {
            case "equipment":
                source.damage = this.damage;
                Narrate(`You equip the ${this.name}. Damage boost set to ${this.damage}!`, this.element);
                ItemPanel.update(`items/${this.image}`);
                Equipped = this;
                break;
            case "healing":
                source.hp += this.damage;
                Narrate(`You found ${this.name}! Ah, such a delicacy! The crispiness, the sweetness! It restores ${this.damage} HP, as you bask in the cullinary perfection. Definitely the pinnacle of creation.`, this.element);
                if (source.hp > source.hp_max)
                    source.hp = source.hp_max;
                break;
        }
        Health.update(100 * Math.floor(PLAYER.hp / PLAYER.hp_max));
        DamagePanel.update(PLAYER.damage);
    }
    async Degrade(source) {
        this.durability--;
        if (this.durability === 0) {
            Narrate(`Your ${this.name} has broken...`);
            source.damage -= this.damage;
            ItemPanel.update("");
            Equipped = null;
        }
        console.log(`The ${this.name}'s durability is now ${this.durability}`);
    }
}
