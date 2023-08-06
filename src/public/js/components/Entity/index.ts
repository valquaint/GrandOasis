class Entity {
    name:string;
    hp:number;
    damage:number;
    x:number;
    y:number;

    constructor(name:string, hp:number, damage:number, x:number, y:number){
        this.name = name;
        this.hp = hp;
        this.damage = damage;
        this.x = x;
        this.y = y;
    }

    public async Bump(source: Entity){
        source.hp -= this.damage;
        console.log(`${this.name} attacks ${source.name}`)
        if(source.hp <= 0){
            console.log(`I should call ${source.name}.death()`)
        }
    }

    // TODO: change type from number to custom DIRECTION class
    public async Move(dir:number){
        console.log(`Moving ${this.name} in direction ${dir}`);
    }
}