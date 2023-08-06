
class Entity {
    name:string;
    hp:number;
    damage:number;
    x:number;
    y:number;
    movable:boolean = true;
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

    public async Move(dir:Direction){
        console.log(`Moving ${this.name} in direction ${dir}`);
        this.movable = false;
        setTimeout(() => { this.movable = true }, 1000);
    }

    
    public get canMove() : boolean {
        return this.movable;
    }

    
    public set canMove(v : boolean) {
        this.canMove = v;
    }
    
    
}