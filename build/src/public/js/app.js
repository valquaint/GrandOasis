"use strict";
let root;
let loading;
let rows = 10;
let columns = 10;
let MAP;
let PLAYER;
let Enemies = new Array;
let narrator;
let View;
let StatPanel;
let ScorePanel;
let Score = 0;
let Health;
let Floor = 0;
let ItemPanel;
let FloorPanel;
let DamagePanel;
let FloorTypes = ["cave", "forest", "forest2"];
let Equipped = null;
const DIRECTIONS = [
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
];
const moveDirections = [
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
];
async function ready() {
    document.addEventListener('touchstart', await createMobileControls);
    root = document.querySelector("#root");
    loading = document.querySelector("#loading");
    View = new Viewport(7, 7, ["viewport"]);
    narrator = new Narrator();
    StatPanel = new Statpanel(7, 1);
    ScorePanel = new Statitem("score", 0.5, 0, 4, "counter", { "image": "counter", "icon": "score" });
    Health = new Statitem("health", 1, 0, 3, "meter", { "image": "counter", "icon": "health" });
    ItemPanel = new Statitem("item", 1, 0, 1, "image", { "image": "item" });
    DamagePanel = new Statitem("damagecounter", 1, 0, 1, "image", { "image": "power" });
    FloorPanel = new Statitem("floorcounter", 1, 0, 1, "image", { "image": "floor" });
    if (root) {
        for (let y = 0; y < rows; y++) {
            const row = document.createElement("div");
            row.classList.add("row");
            root.appendChild(row);
            for (let x = 0; x < columns; x++) {
                const column = document.createElement("div");
                column.classList.add("column");
                row.appendChild(column);
                const content = document.createElement("div");
                content.classList.add(`cell-${x}-${y}`, "cell");
                column.appendChild(content);
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
async function createMobileControls() {
    const mobileControls = document.createElement("div");
    mobileControls.classList.add("mobileControls");
    document.body.appendChild(mobileControls);
    const downButton = document.createElement("button");
    downButton.classList.add("down");
    const dArrow = document.createElement("span");
    downButton.appendChild(dArrow);
    downButton.addEventListener("click", async () => {
        let didMove = false;
        didMove = await move(1);
        if (didMove) {
            for (const Enemy of Enemies) {
                await Enemy.wander.call(Enemy);
                Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)));
            }
        }
    });
    mobileControls.appendChild(downButton);
    const upButton = document.createElement("button");
    upButton.classList.add("up");
    const uArrow = document.createElement("span");
    upButton.appendChild(uArrow);
    upButton.addEventListener("click", async () => {
        let didMove = false;
        didMove = await move(0);
        if (didMove) {
            for (const Enemy of Enemies) {
                await Enemy.wander.call(Enemy);
                Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)));
            }
        }
    });
    mobileControls.appendChild(upButton);
    const leftButton = document.createElement("button");
    leftButton.classList.add("left");
    const lArrow = document.createElement("span");
    leftButton.appendChild(lArrow);
    leftButton.addEventListener("click", async () => {
        let didMove = false;
        didMove = await move(2);
        if (didMove) {
            for (const Enemy of Enemies) {
                await Enemy.wander.call(Enemy);
                Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)));
            }
        }
    });
    mobileControls.appendChild(leftButton);
    const rightButton = document.createElement("button");
    rightButton.classList.add("right");
    const rArrow = document.createElement("span");
    rightButton.appendChild(rArrow);
    rightButton.addEventListener("click", async () => {
        let didMove = false;
        didMove = await move(3);
        if (didMove) {
            for (const Enemy of Enemies) {
                await Enemy.wander.call(Enemy);
                Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)));
            }
        }
    });
    mobileControls.appendChild(rightButton);
    const confirmButton = document.createElement("button");
    confirmButton.classList.add("confirm");
    confirmButton.addEventListener("click", async () => {
        if (narrator.onScreen) {
            console.log("Closing Narrator");
            narrator.clear();
            if (PLAYER.hp <= 0) {
                window.location.reload();
            }
            if (Floor === 1337) {
                window.location.href = "https://www.youtube.com/watch?v=oyFQVZ2h0V8";
            }
        }
    });
    mobileControls.appendChild(confirmButton);
}
async function GameLoop() {
    if (Floor < 100) {
        loading.style.display = "block";
        const pick = Math.floor(Math.random() * FloorTypes.length);
        console.log(`Random map number: ${pick}`);
        const mapgen = FloorTypes[pick];
        Floor++;
        rows = 10 + Math.floor((Floor / 100) * 10);
        columns = 10 + Math.floor((Floor / 100) * 10);
        console.log(`I will generate a ${columns} x ${rows} ${mapgen} map`);
        await Generate(mapgen);
    }
    else {
        Floor = 1337;
        Narrate(`And thus, your journey came to an end, having defeated all 100 floors in the Grand Oasis... [Final Score: ${Score}]`);
    }
}
async function clearMap() {
    for (const ele of document.querySelectorAll(".row")) {
        ele.remove();
    }
    if (root) {
        for (let y = 0; y < rows; y++) {
            const row = document.createElement("div");
            row.classList.add("row");
            root.appendChild(row);
            for (let x = 0; x < columns; x++) {
                const column = document.createElement("div");
                column.classList.add("column");
                row.appendChild(column);
                const content = document.createElement("div");
                content.classList.add(`cell-${x}-${y}`, "cell");
                column.appendChild(content);
            }
        }
    }
}
async function Generate(map) {
    await clearMap();
    MAP = new GameMap(columns, rows, map, DIRECTIONS);
    await MAP.processMaze(columns, rows);
    // TODO: Create placeChests()
    await MAP.testwfc(placePlayer);
}
async function placeExit() {
    const getDistance = (trg, x, y) => {
        const distX = (x - trg.x);
        const distY = (y - trg.y);
        const dist = Math.ceil(Math.hypot(distX + distY));
        console.log(`Distance from ${x},${y} to ${trg.name} is ${dist}`);
        let dir = { x: 0, y: 0, name: "" };
        if (Math.abs(trg.x - x) + Math.abs(trg.y - y) <= 1) {
            dir = {
                x: trg.x - x,
                y: trg.y - y
            };
        }
        if (dir.x === 1)
            dir.name = "right";
        if (dir.x === -1)
            dir.name = "left";
        if (dir.y === 1)
            dir.name = "down";
        if (dir.y === -1)
            dir.name = "up";
        return { dist: dist, dir: dir };
    };
    let exitLoc = await MAP.findOpenCell();
    let attempts = 0;
    while (getDistance(PLAYER, exitLoc[0], exitLoc[1]).dist < (5 - Math.floor(attempts / 50))) {
        exitLoc = await MAP.findOpenCell();
        attempts++;
    }
    console.log(`I should place the exit on ${exitLoc[0]}, ${exitLoc[1]} (${attempts} attempts taken)`);
    const Exit = new Stairs();
    const exitCell = MAP.getCell(exitLoc[0], exitLoc[1]);
    exitCell.Enter(Exit);
}
async function placeEnemies() {
    let numEnemies = Math.ceil(Math.random() * Floor);
    console.log(`Placing ${numEnemies} enemies`);
    while (numEnemies) {
        const testEnemyLoc = await MAP.findOpenCell();
        const eSelector = `F${Floor}-${numEnemies}`;
        const currEnemy = new Enemy(Math.ceil((Floor / 100) * 10), testEnemyLoc[0], testEnemyLoc[1], () => null, PLAYER);
        const eOnDeath = async (source, skip) => {
            document.querySelector(`.enemy.${eSelector}`)?.remove();
            const locEnemy = Enemies.indexOf(currEnemy);
            const currCell = MAP.getCell(Enemies[locEnemy].x, Enemies[locEnemy].y);
            console.log(`Calling DEATH EXIT from ${Enemies[locEnemy].name} function`);
            await currCell.Exit(Enemies[locEnemy]);
            if (!skip)
                Score += Enemies[locEnemy].scoreValue;
            if (!skip)
                console.log(`Enemy ${Enemies[locEnemy].name} was slain`);
            ScorePanel.update(Score);
            delete Enemies[locEnemy];
            Enemies.splice(locEnemy, 1);
            if (!skip)
                PLAYER.hp_max += 1;
            if (currEnemy.name === "Luna") {
                if (!skip)
                    Narrate(`Luna had fun playing with you, but got scared. She ran away instead. (Max HP + 1 anyway though, for her cuteness as a bat dog!)`);
            }
            else {
                if (!skip)
                    Narrate(`You slay the ${currEnemy.name}! Max HP + 1`);
            }
        };
        currEnemy.onDeath = eOnDeath;
        currEnemy.element.classList.add(eSelector);
        Enemies.push(currEnemy);
        console.log(`Placing enemy ${currEnemy.name} to start at ${testEnemyLoc[0]}, ${testEnemyLoc[1]}`);
        const enemyCell = MAP.getCell(testEnemyLoc[0], testEnemyLoc[1]);
        await enemyCell.Enter(currEnemy);
        numEnemies--;
    }
    if (Floor % 25 === 0) {
        Narrate(`You feel a powerful presence on this floor... `);
        const testEnemyLoc = await MAP.findOpenCell();
        const eSelector = `F${Floor}-${numEnemies}`;
        const currEnemy = new Boss(Math.floor(Floor / 25) - 1, testEnemyLoc[0], testEnemyLoc[1], () => null, PLAYER);
        const eOnDeath = async (source, skip) => {
            document.querySelector(`.enemy.${eSelector}`)?.remove();
            const locEnemy = Enemies.indexOf(currEnemy);
            const currCell = MAP.getCell(Enemies[locEnemy].x, Enemies[locEnemy].y);
            console.log(`Calling DEATH EXIT from ${Enemies[locEnemy].name} function`);
            await currCell.Exit(Enemies[locEnemy]);
            if (!skip)
                Score += Enemies[locEnemy].scoreValue;
            if (!skip)
                console.log(`Boss ${Enemies[locEnemy].name} was slain`);
            ScorePanel.update(Score);
            delete Enemies[locEnemy];
            Enemies.splice(locEnemy, 1);
            if (!skip)
                PLAYER.hp_max += 5;
            if (!skip)
                Narrate(`You defeat ${currEnemy.name}! Max HP + 5`);
        };
        currEnemy.onDeath = eOnDeath;
        currEnemy.element.classList.add(eSelector);
        Enemies.push(currEnemy);
        console.log(`Placing Boss ${currEnemy.name} to start at ${testEnemyLoc[0]}, ${testEnemyLoc[1]}`);
        const enemyCell = MAP.getCell(testEnemyLoc[0], testEnemyLoc[1]);
        await enemyCell.Enter(currEnemy);
    }
}
async function placePlayer() {
    const start = await MAP.findOpenCell();
    if (!PLAYER?.name) {
        PLAYER = new Entity("Player", [10, 10], 1, start[0], start[1], ["player"], Die);
        console.log(`Placing player to start at ${start[0]}, ${start[1]}`);
        const startCell = MAP.getCell(start[0], start[1]);
        await startCell.Enter(PLAYER);
    }
    else {
        console.log(`Placing player to start at ${start[0]}, ${start[1]}`);
        const startCell = MAP.getCell(start[0], start[1]);
        await startCell.Enter(PLAYER);
        PLAYER.x = start[0];
        PLAYER.y = start[1];
    }
    View.update(PLAYER);
    DamagePanel.update(PLAYER.damage);
    await placeEnemies();
    RegisterHotkeys();
    Health.update(100 * Math.floor(PLAYER.hp / PLAYER.hp_max));
    loading.style.display = "none";
    FloorPanel.update(Floor);
    ScorePanel.update(Score);
    Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)));
    await placeExit();
    let numChests = Math.ceil(Math.random() * Math.ceil(Floor / 10));
    console.log(`======== PLACING ${numChests} CHEST ========`);
    while (numChests) {
        const chestLoc = await MAP.findOpenCell();
        await placeChest(chestLoc[0], chestLoc[1], new Item(Math.ceil((Floor / 100) * 10)));
        numChests--;
    }
}
async function Die(Slayer) {
    PLAYER.movable = false;
    const deathSplash = document.createElement("div");
    deathSplash.classList.add("deathsplash");
    document.body.appendChild(deathSplash);
    const deathText = document.createElement("div");
    deathText.classList.add("deathText");
    setTimeout(async () => {
        deathSplash.appendChild(deathText);
        setTimeout(async () => {
            await Narrate(`Alas, struck down by ${Slayer?.name || "Unknown"}, your journey came to an end on floor ${Floor} [Final Score: ${Score}]. -- Play again?`);
        }, 2000);
    }, 2000);
}
async function RegisterHotkeys() {
    document.addEventListener("keydown", keyDown);
    window.addEventListener("gamepadconnected", (e) => {
        console.log("Gamepad connected at index %d: %s. %d buttons, %d axes.", e.gamepad.index, e.gamepad.id, e.gamepad.buttons.length, e.gamepad.axes.length);
        gamepadHandler(e, true);
    });
    window.addEventListener("gamepaddisconnected", (e) => {
        console.log("Gamepad disconnected from index %d: %s", e.gamepad.index, e.gamepad.id);
        gamepadHandler(e, false);
    });
}
async function gamepadHandler(event, connected) {
    if (connected) {
        console.log("Controller connected.");
        setInterval(async () => {
            let controllers = navigator.getGamepads();
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
                    Axis 4: RSTICK U-/D+ ${controller.axes[3].toFixed(4)}`);
                    let didMove = false;
                    if (controller.buttons[12].pressed) {
                        didMove = await move(0);
                        console.log("UP");
                    }
                    if (controller.buttons[13].pressed) {
                        didMove = await move(1);
                        console.log("DOWN");
                    }
                    if (controller.buttons[14].pressed) {
                        didMove = await move(2);
                        console.log("LEFT");
                    }
                    if (controller.buttons[15].pressed) {
                        didMove = await move(3);
                        console.log("RIGHT");
                    }
                    if (controller.buttons[0].pressed) {
                        console.log("CONFIRM");
                        if (narrator.onScreen) {
                            console.log("Closing Narrator");
                            narrator.clear();
                            if (PLAYER.hp <= 0) {
                                window.location.reload();
                            }
                            if (Floor === 1337) {
                                window.location.href = "https://www.youtube.com/watch?v=oyFQVZ2h0V8";
                            }
                        }
                    }
                    if (didMove) {
                        for (const Enemy of Enemies) {
                            await Enemy.wander.call(Enemy);
                            Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)));
                        }
                    }
                }
            }
        }, 200);
    }
    else {
        console.log("Controller disconnected.");
    }
}
async function keyDown(event) {
    let didMove = false;
    switch (event.key) {
        case "w":
        case "W":
        case "ArrowUp":
            event.preventDefault();
            didMove = await move(0);
            console.log("UP");
            break;
        case "s":
        case "S":
        case "ArrowDown":
            event.preventDefault();
            didMove = await move(1);
            console.log("DOWN");
            break;
        case "a":
        case "A":
        case "ArrowLeft":
            event.preventDefault();
            didMove = await move(2);
            console.log("LEFT");
            break;
        case "d":
        case "D":
        case "ArrowRight":
            event.preventDefault();
            didMove = await move(3);
            console.log("RIGHT");
            break;
        case " ":
        case "Enter":
            event.preventDefault();
            console.log("CONFIRM");
            if (narrator.onScreen) {
                console.log("Closing Narrator");
                narrator.clear();
                if (PLAYER.hp <= 0) {
                    window.location.reload();
                }
                if (Floor === 1337) {
                    window.location.href = "https://www.youtube.com/watch?v=oyFQVZ2h0V8";
                }
            }
            break;
        case "o":
            await Narrate("You found the secret key!");
        default:
            console.log(event.key);
            break;
    }
    if (didMove) {
        for (const Enemy of Enemies) {
            await Enemy.wander.call(Enemy);
            Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)));
        }
    }
}
function move(direction) {
    return new Promise((resolve) => {
        Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)));
        if (PLAYER.canMove && !narrator.onScreen) {
            console.log(moveDirections[direction]);
            PLAYER.Move(moveDirections[direction], View);
            console.log("Player has moved.");
            resolve(true);
        }
        else {
            resolve(false);
        }
    });
}
async function testHealingItem() {
    const testItem = new Item("Non-crusted Sandwich-Like French Toast", 5, 0, "nocrust", "healing");
    testItem.use(PLAYER);
    Health.update(Math.floor(100 * (PLAYER.hp / PLAYER.hp_max)));
}
async function placeChest(x, y, item) {
    const chest = new Chest(item, x, y);
    const locCell = MAP.getCell(x, y);
    locCell.Enter(chest);
    return true;
}
async function Narrate(text, element) {
    narrator.explain(text, 7, 7, element);
}
document.addEventListener("DOMContentLoaded", ready);
