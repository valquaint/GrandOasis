class Stairs {
    element:HTMLElement;
    name:string = "Stairs";
    constructor(){
        this.element = document.createElement("stairs");
        this.element.classList.add("stairs")
    }

    public async Bump(source:Entity){
        return new Promise(async (resolve) => {
            if (source.hp_max !== 0) {
                GameLoop();
                resolve(true)
            }
            resolve(false)
        })
    }
}