let root: HTMLElement;
let rows = 12;
let columns = 12;
let MAP: GameMap;
let PLAYER: Entity;
let Enemies:Entity[] = new Array<Entity>
type Direction = { x: number, y: number, name?:string};
let narrator: Narrator;
let View:Viewport;
let StatPanel:Statpanel;
let ScorePanel:Statitem;
let Score:number = 0;
let Health:Statitem;
let ItemPanel:Statitem;
let FloorPanel:Statitem;
const DIRECTIONS: Direction[] = [ // UP/DOWN/LEFT/RIGHT
    {
        x: 0,
        y: -1
    },
    {
        x: 0,
        y: 1
    },
    {
        x: -1,
        y: 0
    },
    {
        x: 1,
        y: 0
    },
]

const moveDirections: Direction[] = [ // UP/DOWN/LEFT/RIGHT
    {
        x: 0,
        y: -1,
        name:"up"
    },
    {
        x: 0,
        y: 1,
        name:"down"
    },
    {
        x: -1,
        y: 0,
        name:"left"
    },
    {
        x: 1,
        y: 0,
        name:"right"
    },
]
async function ready() {
    root = document.querySelector("#root") as HTMLElement;
    View = new Viewport(7,7,["viewport"])
    narrator = new Narrator();
    StatPanel = new Statpanel(7, 1);
    ScorePanel = new Statitem("score", 0.5,0,4,"counter",{"image":"counter","icon":"score"});
    Health = new Statitem("health", 1,0,3,"meter",{"image":"counter", "icon":"health"});
    ItemPanel = new Statitem("item", 1,0,1,"image",{"image":"item"});
    FloorPanel = new Statitem("floorcounter",1,0,1,"counter",{}) 
    StatPanel.element.appendChild(ScorePanel.element);
    StatPanel.element.appendChild(Health.element);
    StatPanel.element.appendChild(ItemPanel.element);
    StatPanel.element.appendChild(FloorPanel.element);
    FloorPanel.update(1);
    ScorePanel.update(Score);
    if (root) {
        for (let y = 0; y < rows; y++) {
            const row = document.createElement("div");
            row.classList.add("row");
            root.appendChild(row)
            for (let x = 0; x < columns; x++) {
                const column = document.createElement("div");
                column.classList.add("column")
                row.appendChild(column)
                const content = document.createElement("div");
                content.classList.add(`cell-${x}-${y}`, "cell");
                column.appendChild(content)
            }
        }
    }
    await Generate("cave");
    
    
}

async function clearMap() {
    for (const ele of document.querySelectorAll(".row") as unknown as Array<any>) {
        ele.remove();
    }
    if (root) {
        for (let y = 0; y < rows; y++) {
            const row = document.createElement("div");
            row.classList.add("row");
            root.appendChild(row)
            for (let x = 0; x < columns; x++) {
                const column = document.createElement("div");
                column.classList.add("column")
                row.appendChild(column)
                const content = document.createElement("div");
                content.classList.add(`cell-${x}-${y}`, "cell");
                column.appendChild(content)
            }
        }
    }
}

async function Generate(map: string) {
    // TODO: Loading screen overlay during generation
    await clearMap();
    MAP = new GameMap(columns, rows, map, DIRECTIONS);
    await MAP.processMaze(columns, rows);
    await MAP.testwfc(placePlayer);
}

async function placePlayer() {
    const start: number[] = await MAP.findOpenCell();
    PLAYER = new Entity("Player", [10,10], 1, start[0], start[1], ["player"]);
    View.update(PLAYER);
    console.log(`Placing player to start at ${start[0]}, ${start[1]}`)
    const startCell = MAP.getCell(start[0], start[1]);
    await startCell.Enter(PLAYER);
    const testEnemyLoc: number[] = await MAP.findOpenCell();
    Enemies.push(new Enemy(1, testEnemyLoc[0], testEnemyLoc[1], async () => {
        await Narrate("Blargh! I am slain!");
        document.querySelector(".enemy")?.remove();
        const currCell = MAP.getCell(Enemies[0].x, Enemies[0].y);
        await currCell.Exit(Enemies[0]);
        Score += Enemies[0].scoreValue;
        ScorePanel.update(Score);
        delete Enemies[0];
        Enemies.splice(0,1);
    }, PLAYER));
    console.log(`Placing enemy to start at ${testEnemyLoc[0]}, ${testEnemyLoc[1]}`)
    const enemyCell = MAP.getCell(testEnemyLoc[0], testEnemyLoc[1]);
    await enemyCell.Enter(Enemies[0]);
    RegisterHotkeys();
    Health.update(100 * Math.floor(PLAYER.hp / PLAYER.hp_max))
}

async function RegisterHotkeys() {
    document.addEventListener("keydown", keyDown);
    window.addEventListener("gamepadconnected", (e) => {
        console.log(
            "Gamepad connected at index %d: %s. %d buttons, %d axes.",
            e.gamepad.index,
            e.gamepad.id,
            e.gamepad.buttons.length,
            e.gamepad.axes.length,
        );
        gamepadHandler(e, true)
    });
    
    window.addEventListener("gamepaddisconnected", (e) => {
        console.log(
            "Gamepad disconnected from index %d: %s",
            e.gamepad.index,
            e.gamepad.id,
        );
        gamepadHandler(e, false)
    });
}

async function gamepadHandler(event: GamepadEvent, connected: boolean) {
    if (connected) {
        console.log("Controller connected.")
        setInterval(async () => {
            let controllers = navigator.getGamepads()
            for (const controller of controllers) {
                if (controller) {
                    console.log(`== BUTTON MAPPING: ${controller.index} -- ${controller.id} ==\n
                    1: A ${controller.buttons[0].pressed} : ${controller.buttons[0].value}
                    2: B ${controller.buttons[1].pressed} : ${controller.buttons[1].value}
                    3: X ${controller.buttons[2].pressed} : ${controller.buttons[2].value}
                    4: Y ${controller.buttons[3].pressed} : ${controller.buttons[3].value}
                    5: L ${controller.buttons[4].pressed} : ${controller.buttons[4].value}
                    6: R ${controller.buttons[5].pressed} : ${controller.buttons[5].value}
                    7: LTRIG ${controller.buttons[6].pressed} : ${controller.buttons[6].value}
                    8: RTRIG ${controller.buttons[7].pressed} : ${controller.buttons[7].value}
                    9: SHARE ${controller.buttons[8].pressed} : ${controller.buttons[8].value}
                    10: START ${controller.buttons[9].pressed} : ${controller.buttons[9].value}
                    11: LSTICK ${controller.buttons[10].pressed} : ${controller.buttons[10].value}
                    12: RSTICK ${controller.buttons[11].pressed} : ${controller.buttons[11].value}
                    13: DUP ${controller.buttons[12].pressed} : ${controller.buttons[12].value}
                    14: DDOWN ${controller.buttons[13].pressed} : ${controller.buttons[13].value}
                    15: DLEFT ${controller.buttons[14].pressed} : ${controller.buttons[14].value}
                    16: DRIGHT ${controller.buttons[15].pressed} : ${controller.buttons[15].value}
                    17: HOME ${controller.buttons[16].pressed} : ${controller.buttons[16].value}
                    Axis 1: LSTICK L-/R+ ${controller.axes[0].toFixed(4)}
                    Axis 2: LSTICK U-/D+ ${controller.axes[1].toFixed(4)}
                    Axis 3: RSTICK L-/R+ ${controller.axes[2].toFixed(4)}
                    Axis 4: RSTICK U-/D+ ${controller.axes[3].toFixed(4)}`)
                    let didMove:boolean = false;
                    if (controller.buttons[12].pressed) {
                        didMove = await move(0);
                        console.log("UP")
                    }
                    if (controller.buttons[13].pressed) {
                        didMove = await move(1);
                        console.log("DOWN")
                    }
                    if (controller.buttons[14].pressed) {
                        didMove = await move(2);
                        console.log("LEFT")
                    }
                    if (controller.buttons[15].pressed) {
                        didMove = await move(3);
                        console.log("RIGHT")
                    }
                    if (controller.buttons[0].pressed) {
                        console.log("CONFIRM");
                        if (narrator.onScreen) {
                            console.log("Closing Narrator");
                            narrator.clear();
                        }
                    }
                    if(didMove){
                        for(const Enemy of Enemies){
                            await Enemy.wander.call(Enemy);
                            Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)))
                        }
                        
                    }
                }
            }
        }, 200)
    } else {
        console.log("Controller disconnected.")
    }
}
async function keyDown(event: KeyboardEvent) {
    let didMove:boolean = false;
    switch (event.key) {
        case "w":
        case "W":
        case "ArrowUp":
            event.preventDefault();
            didMove = await move(0);
            console.log("UP")
            break;
        case "s":
        case "S":
        case "ArrowDown":
            event.preventDefault();
            didMove = await move(1);
            console.log("DOWN")
            break;
        case "a":
        case "A":
        case "ArrowLeft":
            event.preventDefault();
            didMove = await move(2);
            console.log("LEFT")
            break;
        case "d":
        case "D":
        case "ArrowRight":
            event.preventDefault();
            didMove = await move(3);
            console.log("RIGHT")
            break;
        case " ":
        case "Enter":
            event.preventDefault();
            console.log("CONFIRM");
            if (narrator.onScreen) {
                console.log("Closing Narrator");
                narrator.clear();
            }
            break;
        case "o":
            await Narrate("You found the secret key!");
        default:
            console.log(event.key)
            break;
    }
    if(didMove){
        for(const Enemy of Enemies){
            await Enemy.wander.call(Enemy);
            Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)))
        }
    }
}

function move(direction: number):Promise<boolean> {
    return new Promise((resolve) => {
        Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)))
        if (PLAYER.canMove && !narrator.onScreen) {
            console.log(moveDirections[direction]);
            PLAYER.Move(moveDirections[direction], View);
            console.log("Player has moved.")
            
            resolve(true)
        }else{
            resolve(false)
        }
    })

}

async function Narrate(text: string) {
    narrator.explain(text, 7, 7);
}

document.addEventListener("DOMContentLoaded", ready);
