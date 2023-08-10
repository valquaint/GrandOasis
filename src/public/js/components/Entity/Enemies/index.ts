const EnemyRanks = [
    [{name:"Bat", hp:1, damage:1, style:["enemy","bat"], scoreValue:1}],
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