let root: HTMLElement;
let loading: HTMLElement;
let rows = 10;
let columns = 10;
let MAP: GameMap;
let PLAYER: Entity;
let Enemies: Entity[] = new Array<Entity>
type Direction = { x: number, y: number, name?: string };
let narrator: Narrator;
let View: Viewport;
let StatPanel: Statpanel;
let ScorePanel: Statitem;
let Score: number = 0;
let Health: Statitem;
let Floor: number = 0;
let ItemPanel: Statitem;
let FloorPanel: Statitem;
let DamagePanel: Statitem;
let FloorTypes: string[] = ["cave", "forest", "forest2"];
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
        name: "up"
    },
    {
        x: 0,
        y: 1,
        name: "down"
    },
    {
        x: -1,
        y: 0,
        name: "left"
    },
    {
        x: 1,
        y: 0,
        name: "right"
    },
]
async function ready() {

    document.addEventListener('touchstart', await createMobileControls);
    root = document.querySelector("#root") as HTMLElement;
    loading = document.querySelector("#loading") as HTMLElement;
    View = new Viewport(7, 7, ["viewport"])
    narrator = new Narrator();
    StatPanel = new Statpanel(7, 1);
    ScorePanel = new Statitem("score", 0.5, 0, 4, "counter", { "image": "counter", "icon": "score" });
    Health = new Statitem("health", 1, 0, 3, "meter", { "image": "counter", "icon": "health" });
    ItemPanel = new Statitem("item", 1, 0, 1, "image", { "image": "item" });
    DamagePanel = new Statitem("damagecounter", 1, 0, 1, "image", { "image": "power" });
    FloorPanel = new Statitem("floorcounter", 1, 0, 1, "image", { "image": "floor" })
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
    await GameLoop();
    StatPanel.element.appendChild(ScorePanel.element);
    StatPanel.element.appendChild(Health.element);
    StatPanel.element.appendChild(ItemPanel.element);
    StatPanel.element.appendChild(DamagePanel.element);
    StatPanel.element.appendChild(FloorPanel.element);
}

async function createMobileControls(){
    const mobileControls:HTMLElement = document.createElement("div");
    mobileControls.classList.add("mobileControls");
    document.body.appendChild(mobileControls);

    const downButton:HTMLElement = document.createElement("button");
    downButton.classList.add("down");
    const dArrow = document.createElement("span");
    downButton.appendChild(dArrow);
    downButton.addEventListener("click", async () =>{
        let didMove: boolean = false;
        didMove = await move(1);
        if (didMove) {
            for (const Enemy of Enemies) {
                await Enemy.wander.call(Enemy);
                Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)))
            }

        }
    } )
    mobileControls.appendChild(downButton);
    
    const upButton:HTMLElement = document.createElement("button");
    upButton.classList.add("up")
    const uArrow = document.createElement("span");
    upButton.appendChild(uArrow);
    upButton.addEventListener("click", async () =>{
        let didMove: boolean = false;
        didMove = await move(0);
        if (didMove) {
            for (const Enemy of Enemies) {
                await Enemy.wander.call(Enemy);
                Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)))
            }

        }
    } )
    mobileControls.appendChild(upButton);
    
    const leftButton:HTMLElement = document.createElement("button");
    leftButton.classList.add("left")
    const lArrow = document.createElement("span");
    leftButton.appendChild(lArrow);
    leftButton.addEventListener("click", async () => {
        let didMove: boolean = false;
        didMove = await move(2);
        if (didMove) {
            for (const Enemy of Enemies) {
                await Enemy.wander.call(Enemy);
                Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)))
            }

        }
    } )
    mobileControls.appendChild(leftButton);
    
    const rightButton:HTMLElement = document.createElement("button");
    rightButton.classList.add("right");
    const rArrow = document.createElement("span");
    rightButton.appendChild(rArrow);
    rightButton.addEventListener("click", async () =>{
        let didMove: boolean = false;
        didMove = await move(3);
        if (didMove) {
            for (const Enemy of Enemies) {
                await Enemy.wander.call(Enemy);
                Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)))
            }

        }
    } )
    mobileControls.appendChild(rightButton);

    const confirmButton:HTMLElement = document.createElement("button");
    confirmButton.classList.add("confirm");
    confirmButton.addEventListener("click", async () => {
        if (narrator.onScreen) {
            console.log("Closing Narrator");
            narrator.clear();
        }
    })
    mobileControls.appendChild(confirmButton);
}

async function GameLoop() {
    if (Floor < 100) {
        loading.style.display = "block";

        const pick = Math.floor(Math.random() * FloorTypes.length);
        console.log(`Random map number: ${pick}`)
        const mapgen = FloorTypes[pick];
        Floor++;
        rows = 10 + Math.floor((Floor / 100) * 10);
        columns = 10 + Math.floor((Floor / 100) * 10);
        console.log(`I will generate a ${columns} x ${rows} ${mapgen} map`)
        await Generate(mapgen);
    }
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
    await clearMap();
    MAP = new GameMap(columns, rows, map, DIRECTIONS);
    await MAP.processMaze(columns, rows);
    // TODO: Create placeChests()
    await MAP.testwfc(placePlayer);
}

async function placeExit() {
    const getDistance = (trg: Entity, x:number, y:number) => {
        const distX = (x - trg.x)
        const distY = (y - trg.y)
        const dist = Math.ceil(Math.hypot(distX + distY));
        console.log(`Distance from ${x},${y} to ${trg.name} is ${dist}`)
        let dir: Direction = { x: 0, y: 0, name: "" };
        if (Math.abs(trg.x - x) + Math.abs(trg.y - y) <= 1) {
            dir = {
                x: trg.x - x,
                y: trg.y - y
            }
        }
        if (dir.x === 1) dir.name = "right"
        if (dir.x === -1) dir.name = "left"
        if (dir.y === 1) dir.name = "down"
        if (dir.y === -1) dir.name = "up"
        return { dist: dist, dir: dir };
    }
    let exitLoc: number[] = await MAP.findOpenCell();
    let attempts:number = 0;
    while(getDistance(PLAYER,exitLoc[0], exitLoc[1]).dist < (5 - Math.floor(attempts / 50))){
        exitLoc = await MAP.findOpenCell();
        attempts ++;
    }
    console.log(`I should place the exit on ${exitLoc[0]}, ${exitLoc[1]} (${attempts} attempts taken)`);
    const Exit:Stairs = new Stairs()
    const exitCell = MAP.getCell(exitLoc[0], exitLoc[1])
    exitCell.Enter(Exit);
}

async function placeEnemies(){
    let numEnemies = Math.ceil(Math.random() * Floor);
    console.log(`Placing ${numEnemies} enemies`)
    while(numEnemies){
        const testEnemyLoc: number[] = await MAP.findOpenCell();
        const eSelector = `F${Floor}-${numEnemies}`
        const currEnemy = new Enemy(Math.ceil((Floor / 100) * 10), testEnemyLoc[0], testEnemyLoc[1],()=>null, PLAYER)
        const eOnDeath = async () => {
            document.querySelector(`.enemy.${eSelector}`)?.remove();
            const locEnemy = Enemies.indexOf(currEnemy);
            const currCell = MAP.getCell(Enemies[locEnemy].x, Enemies[locEnemy].y);
            console.log(`Calling DEATH EXIT from ${Enemies[locEnemy].name} function`)
            await currCell.Exit(Enemies[locEnemy]);
            Score += Enemies[locEnemy].scoreValue;
            console.log(`Enemy ${Enemies[locEnemy].name} was slain`)
            ScorePanel.update(Score);
            delete Enemies[locEnemy];
            Enemies.splice(locEnemy, 1);
        }
        currEnemy.onDeath = eOnDeath;
        currEnemy.element.classList.add(eSelector);
        Enemies.push(currEnemy);
        console.log(`Placing enemy ${currEnemy.name} to start at ${testEnemyLoc[0]}, ${testEnemyLoc[1]}`)
        const enemyCell = MAP.getCell(testEnemyLoc[0], testEnemyLoc[1]);
        await enemyCell.Enter(currEnemy);
        numEnemies --;
    }
}

async function placePlayer() {
    const start: number[] = await MAP.findOpenCell();
    if (!PLAYER?.name) {
        PLAYER = new Entity("Player", [10, 10], 1, start[0], start[1], ["player"]);
        console.log(`Placing player to start at ${start[0]}, ${start[1]}`)
        const startCell = MAP.getCell(start[0], start[1]);
        await startCell.Enter(PLAYER);
    }
    else {
        console.log(`Placing player to start at ${start[0]}, ${start[1]}`)
        const startCell = MAP.getCell(start[0], start[1]);
        await startCell.Enter(PLAYER);
        PLAYER.x = start[0];
        PLAYER.y = start[1];
    }
    View.update(PLAYER);
    DamagePanel.update(PLAYER.damage);
    await placeEnemies();
    RegisterHotkeys();
    Health.update(100 * Math.floor(PLAYER.hp / PLAYER.hp_max))
    loading.style.display = "none";
    FloorPanel.update(Floor);
    ScorePanel.update(Score);
    Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)));
    await placeExit();
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
                    let didMove: boolean = false;
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
                    if (didMove) {
                        for (const Enemy of Enemies) {
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
    let didMove: boolean = false;
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
    if (didMove) {
        for (const Enemy of Enemies) {
            await Enemy.wander.call(Enemy);
            Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)))
        }
    }
}

function move(direction: number): Promise<boolean> {
    return new Promise((resolve) => {
        Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)))
        if (PLAYER.canMove && !narrator.onScreen) {
            console.log(moveDirections[direction]);
            PLAYER.Move(moveDirections[direction], View);
            console.log("Player has moved.")

            resolve(true)
        } else {
            resolve(false)
        }
    })

}

async function Narrate(text: string) {
    narrator.explain(text, 7, 7);
}

document.addEventListener("DOMContentLoaded", ready);
