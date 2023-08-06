"use strict";
let root;
let rows = 20;
let columns = 20;
let MAP;
let PLAYER;
async function ready() {
    root = document.querySelector("#root");
    PLAYER = new Entity("Player", 10, 1, 1, 1);
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
    MAP = new GameMap(columns, rows, map);
    await MAP.processMaze(columns, rows);
    await MAP.testwfc();
}
async function RegisterHotkeys() {
    document.addEventListener("keydown", handleMove);
}
function handleMove(event) {
    switch (event.key) {
        case "w":
        case "W":
        case "ArrowUp":
            event.preventDefault();
            console.log("UP");
            break;
        case "a":
        case "A":
        case "ArrowLeft":
            event.preventDefault();
            console.log("LEFT");
            break;
        case "s":
        case "S":
        case "ArrowDown":
            event.preventDefault();
            console.log("DOWN");
            break;
        case "d":
        case "D":
        case "ArrowRight":
            event.preventDefault();
            console.log("RIGHT");
            break;
        default:
            return true;
    }
}
document.addEventListener("DOMContentLoaded", ready);
