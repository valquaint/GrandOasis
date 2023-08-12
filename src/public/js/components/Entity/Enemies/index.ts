const EnemyRanks = [
    [{name:"Rat", hp:1, damage:0, style:["enemy","rat"], scoreValue:1}], // Floors 1-10
    [{name:"Bat", hp:2, damage:0, style:["enemy","bat"], scoreValue:2}], // Floors 1-20
    [{name:"Slime", hp:3, damage:1, style:["enemy","slime"], scoreValue:5}], // Floors 1-30
    [{name:"Snake", hp:3, damage:2, style:["enemy","snake"], scoreValue:7}], // Floors 1-40
    [{name:"Wolf", hp:5, damage:2, style:["enemy","wolf"], scoreValue:10}], // Floors 1-50
    [{name:"Wraith", hp:7, damage:2, style:["enemy","wraith"], scoreValue:15}], // Floors 1-60
    [{name:"Skeleton", hp:10, damage:3, style:["enemy","skeleton"], scoreValue:20}], // Floors 1-70
    [{name:"Bear", hp:15, damage:5, style:["enemy","bear"], scoreValue:30}], // Floors 1-80
    [{name:"Luna", hp:35, damage:7, style:["enemy","luna"], scoreValue:50}], // Floors 1-90
    [{name:"Stormy", hp:50, damage:10, style:["enemy","stormy"], scoreValue:80}], // Floors 1-100
]

const Bosses = [
    {name:"Stormy", hp:50, damage:5, style:["enemy","stormy"], scoreValue:100}, // Floor 25
    {name:"Robot", hp:80, damage:10, style:["enemy","robot"], scoreValue:150}, // Floor 50
    {name:"Demon", hp:120, damage:18, style:["enemy","demon"], scoreValue:200}, // Floor 75
    {name:"Dragon", hp:170, damage:28, style:["enemy","dragon"], scoreValue:300} // Floor 100
]

class Enemy extends Entity{
    constructor(difficulty:number, x:number, y:number, onDeath:Function,movePattern?: string | Entity){
        const allowed = [];
        for(let i = 0; i < difficulty; i++){
            allowed.push(...EnemyRanks[i]);
        }
        const pick = Math.floor(Math.random() * allowed.length);
        const ENM = allowed[pick];
        super(ENM.name,ENM.hp,ENM.damage,x,y,ENM.style,onDeath,movePattern,ENM.scoreValue);
        console.log(`Created new ${this.name}`,this)
    }
}

class Boss extends Entity{
    constructor(difficulty:number, x:number, y:number, onDeath:Function,movePattern?: string | Entity){
        const Boss = Bosses[difficulty];
        super(Boss.name,Boss.hp,Boss.damage,x,y,Boss.style,onDeath,movePattern,Boss.scoreValue);
        console.log(`Created new ${this.name}`,this)
    }
}