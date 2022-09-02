import {Game, Material} from "./game.js";

const gameBoard = document.getElementsByClassName('game-board')[0];
const winningBoard = document.getElementsByClassName('winning-board')[0];
const restart = winningBoard.children[1];
const avatar = winningBoard.children[0].children[0];
const title = winningBoard.children[0].children[1];
const improvingBoard = document.getElementsByClassName("improving")[0];
const timers = document.getElementsByClassName("timer")[0].children;

console.log(timers)
for (let i = 0; i < 4; i++) {
    improvingBoard.children[i].addEventListener("click", _ => {
        improvingBoard.children[i].children[0].src = improvingBoard.children[i].children[0].src.split("white").join(`${game.choosed.material.team}`);

        const name = improvingBoard.children[i].children[1].textContent;
        game.choosed.material.name = name == "وزير"? "queen": name == "قلعة"? "rook": name == "حصان"? "knight": "bishop";
        game.choosed.material.img.src = `./imgs/${game.choosed.material.team}-${game.choosed.material.name}.png`;
        improvingBoard.style.bottom = "-80vmin";
    });
};

const game = new Game(gameBoard);

const timing = setInterval(_ => {
        const timer = timers[Number(game.turn == "black")];
        if (timer.textContent == "0:01") {
            game.changeTurn();
            winning(game.turn);
        };
        if (timer.textContent.split(":")[1] == "00") {
            timer.textContent = `${timer.textContent.split(":")[0] - 1}:59`;
        } else {
            timer.textContent = `${timer.textContent.split(":")[0]}:${timer.textContent.split(":")[1] - 1}`;
            if (timer.textContent.split(":")[1].length == 1) {
                timer.textContent = `${timer.textContent.split(":")[0]}:0${timer.textContent.split(":")[1]}`;
            };
        };
    }, 1000);

restart.addEventListener("click", _ => {
    location.reload();
});

game.allCells.forEach(e => {
    e.element.addEventListener("click", _ => {
        if (e.material) {
            functionsOfMaterials(e);
        } else {
            functionsOfEmptyCells(e);
        };
    });
});

function functionsOfMaterials(cell) {
    if (cell.material.team == game.turn) {
        removingActivity();
        if (cell.material.legalMoves(game)[0]) {
            if (game.choosed == cell) {
                removingActivity();
                game.choosed = null;
            } else {
                addingActivity(cell, cell.material.legalMoves(game));
                game.choosed = cell;
            };
        };
    } else {
        if (active(cell)) {
            eating(game.choosed, cell)
        };
        removingActivity();
    };
};

function functionsOfEmptyCells(cell) {
    if (active(cell)) {
        const VAR = game.choosed.material.team == "white"? -1: 1;
        const y = game.choosed.y;
        if (/threatened/.test(cell.element.className)) {
            game.getCellByPosition(cell.x, cell.y + VAR).material.img.classList.add('empty');
            game.getCellByPosition(cell.x, cell.y + VAR).material = null;
            game.getCellByPosition(cell.x, cell.y + VAR).jumpedCell = false;
        };
        eating(game.choosed, cell);
        if (game.choosed.material.name == "pawn") {
            if (Math.abs(game.choosed.y - y) == 2) {
                game.choosed.jumpedCell = true;
            };
        };
    };
    removingActivity();
};

function eating(eater, eaten) {
    const img = eaten.element.children[0].children[0];
    img.classList.remove("empty");
    img.src = eater.material.img.src;

    eaten.element.classList.remove("empty");
    eaten.material = new Material(
        eaten.element.children[0],
        img,
        eaten.x,
        eaten.y
    );

    if (eaten.material.name == "king") {
        const digit = eaten.material.team == "white"? 0: 1;
        game.kings[digit] = eaten.material;
    };
    if (eaten.material.name == "pawn" && (eaten.y == 0 || eaten.y == 7)) {
        improvingBoard.style.bottom = "10vmin";
    };

    eater.material.img.classList.add("empty");
    eater.material = null;
    eater.jumpedCell = false;
    eaten.jumpedCell = false;
    game.choosed = eaten;

    game.changeTurn();
    checkEnd(eaten.material.team);
};

function removingActivity() {
    game.allCells.forEach(e => {
        e.element.classList.remove("active");
        e.element.classList.remove("threatened");
    });
};

function addingActivity(cell, cells) {
    cells.forEach(e => {
        e.element.classList.add("active");
        if (e.material) {
            e.element.classList.add("threatened");
        } else if (cell.material.name == "pawn" && cell.x != e.x) {
            e.element.classList.add("threatened");
        };
    });
};

function active(cell) {
    return /active/.test(cell.element.className);
};

function checkEnd(team) {
    const TEAM_INDEX = team == "black";

    const arr = game.teams()[Number(!TEAM_INDEX)];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i].material.legalMoves(game).length) return;
    };
    winning(team);
    if (!game.kings[Number(!TEAM_INDEX)].onCheck(game)) {
        title.textContent = "تعادل";
    };
};

function winning(winner){
    const WINNER = winner == "white"? "الأبيض": "الأسود"

    title.textContent = `!${WINNER} يفوز`;
    winningBoard.style.bottom = "var(--game-size)";
    avatar.children[0].src = `./imgs/${winner}-pawn.png`;
    avatar.style.backgroundColor = `var(--${winner})`;    
    avatar.style.boxShadow = `inset .5vmin .5vmin #666, .5vmin .5vmin var(--${winner})`

    clearInterval(timing);
};