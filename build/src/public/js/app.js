"use strict";
let root;
let rows = 12;
let columns = 12;
let MAP;
let PLAYER;
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
async function ready() {
    root = document.querySelector("#root");
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
    RegisterHotkeys();
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
    await MAP.testwfc(placePlayer);
}
async function placePlayer() {
    const start = await MAP.findOpenCell();
    PLAYER = new Entity("Player", 10, 1, start[0], start[1]);
    console.log(`Placing player to start at ${start[0]}, ${start[1]}`);
}
async function RegisterHotkeys() {
    document.addEventListener("keydown", keyDown);
}
async function keyDown(event) {
    switch (event.key) {
        case "w":
        case "W":
        case "ArrowUp":
            event.preventDefault();
            await move(0);
            console.log("UP");
            break;
        case "a":
        case "A":
        case "ArrowLeft":
            event.preventDefault();
            await move(2);
            console.log("LEFT");
            break;
        case "s":
        case "S":
        case "ArrowDown":
            event.preventDefault();
            await move(1);
            console.log("DOWN");
            break;
        case "d":
        case "D":
        case "ArrowRight":
            event.preventDefault();
            await move(3);
            console.log("RIGHT");
            break;
        default:
            return true;
    }
}
function move(direction) {
    return new Promise((resolve) => {
        if (PLAYER.canMove) {
            console.log(DIRECTIONS[direction]);
            PLAYER.Move(DIRECTIONS[direction]);
            resolve(true);
        }
    });
}
document.addEventListener("DOMContentLoaded", ready);
