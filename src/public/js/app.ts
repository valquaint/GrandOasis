let root:HTMLElement;
let rows = 20;
let columns = 20;
let MAP;
async function ready() {
    root = document.querySelector("#root")as HTMLElement;
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

async function clearMap() {
    for(const ele of document.querySelectorAll(".row") as unknown as Array<any>){
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
    MAP = new GameMap(columns, rows, map);
    await MAP.processMaze(columns, rows);
    await MAP.testwfc();
}



document.addEventListener("DOMContentLoaded", ready);