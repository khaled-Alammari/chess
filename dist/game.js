export class Game {
    constructor(gameBoard) {
        this.gameBoard = gameBoard;
        this.allCells = createCells(this.gameBoard)
        this.kings = [this.allCells[4].material, this.allCells[60].material];
        this.turn = "white";
        this.choosed = null;
    };
    
    cells() {
        return clearBlankCells(this.allCells);
    };

    teams() {
        return [filterTeam("white", this.cells()), filterTeam("black", this.cells())];
    };

    changeTurn() {
        this.turn = this.turn == "white"? "black": "white";
        return this.turn;
    };

    getCellByPosition(x, y) {
        for (let i = 0; i < 64; i++) {
            if (this.allCells[i].x == x && this.allCells[i].y == y) return this.allCells[i];
        };
    };
};

class Cell {
    constructor(cellELement, x, y, material) {
        this.element = cellELement;
        this.x = x;
        this.y = y;
        this.material = material.name? material: null;
        this.jumpedCell = false;
    };

    isLastSquare() {
        return this.y == 0 || this.y == 7;
    };
};

export class Material {
    constructor(materialElement, imgElement, x, y) {
        this.elem = materialElement;
        this.img = imgElement;
        this.x = x;
        this.y = y;
        this.name = hasMaterial(this.img)? infoFromImgSrc(this.img.src).name: null;
        this.team = hasMaterial(this.img)? infoFromImgSrc(this.img.src).team: null;
    };

    allowedMoves(game) {
        if (!this.name) return;
        switch(this.name) {
            case "king":
                return kingAllowedMoves(this, game);
            case "queen":
                return queenAllowedMoves(this, game);
            case "bishop":
                return bishopAllowedMoves(this, game);
            case "knight":
                return knightAllowedMoves(this, game);
            case "rook":
                return rookAllowedMoves(this, game);
            case "pawn":
                return pawnAllowedMoves(this, game);
        };
        return [];
    };

    threatening(game) {
        return this.allowedMoves(game).filter(e => oppenentCell(e, this.team));
    };

    onCheck(game) {
        const oppTeam = game.teams()[Number(teamDigit(this.team))];
        for (let i = 0; i < oppTeam.length; i++) {
            const arr = oppTeam[i].material.threatening(game);
            if (arr[0]) {
                for (let j = 0; j < arr.length; j++) {
                    if (arr[j].material == this) return true;
                };
            };
        };
    };

    legalMoves(game) {
        // this.allowedMoves(game).filter(e => {return e});
        return this.allowedMoves(game).filter(e => !assuming(game, this, e));
    };

    getParent(game) {
        for (let i = 0; i < game.allCells.length; i++) {
            if (this == game.allCells[i].material) {
                return game.allCells.indexOf(game.allCells[i]);
            };
        };
    };
};

function createCells(gameBoard) {
    const cells = [];
    for (let i = 0; i < 64; i++) {
        // Define position
        const x = i % 8;
        const y =  Math.floor(i / 8);

        // Create cell element in the browser
        const divCell = document.createElement('div');
        divCell.classList.add('cell');

        // Create material element in the browser
        const divMaterial = document.createElement('div');
        divMaterial.classList.add('material');

        // Create img element in the browser
        const img = document.createElement('img');
        if (y <= 1 || y >= 6) {
            img.src = getSourceByPosition(x, y);
        } else {
            img.classList.add("empty");
        };

        divMaterial.appendChild(img)
        divCell.appendChild(divMaterial)
        gameBoard.appendChild(divCell);
        
        // Put the elemenet on the array
        const material = new Material(divMaterial, img, x, y);
        const cell = new Cell(
            divCell,
            x,
            y,
            material
        );
        cells.push(cell);
    };
    return cells;
};

function getSourceByPosition(x, y) {
    let source = "./imgs/";
    y <= 2? source += 'white-': source += 'black-';
    if (y == 1 || y == 6) return source + "pawn.png"
    x == 0 || x == 7? source += 'rook':
    x == 1 || x == 6? source += 'knight':
    x == 2 || x == 5? source += 'bishop':
    x == 3? source += 'queen':
    x == 4? source += 'king':0;

    return source + ".png";
};

// Name and team From the img
function infoFromImgSrc(imgSrc) {
    const info = imgSrc.split("imgs/")[1].split(".")[0].split("-");
    return {
        name: info[1],
        team: info[0]
    };
};

// Cecking if the cell has real material
function hasMaterial(img) {
    return img.src.length !== 0;
};

// Removing empty cells from all the cells in the game
function clearBlankCells(cells) {
    return cells.filter(e => e.material);
};

// Removing the oppenents' materials
function filterTeam(team, cells) {
    return cells.filter(e => e.material.team == team);
};

// Checking if the cell empty or has openents' element
function availbleCell(cell, team) {
    return emptyCell(cell) || oppenentCell(cell, team);
};

function emptyCell(cell) {
    return !cell.material;
};

// Checking if the cell has openents' element
function oppenentCell(cell, team) {
    if (!emptyCell(cell)) {
        return cell.material.team != team;
    };
};

function teamDigit(team) {
    return team == "white";
};

function assuming(game, material, cell) {
    const indexOfMaterial = material.getParent(game);
    const oldCellMaterial = cell.material;
    const oldSrc = cell.element.children[0].children[0].src;
    const oldKing = game.kings[Number(!teamDigit(material.team))];
    const oldMaterial = material;

    cell.element.children[0].children[0].src = `./imgs/${material.team}-${material.name}.png`;
    cell.material = new Material(
        cell.element.children[0],
        cell.element.children[0].children[0],
        cell.x,
        cell.y
    );

    game.allCells[indexOfMaterial].material = null;

    if (material.name == "king") {
        game.kings[Number(!teamDigit(material.team))] = cell.material;
    };

    const result = game.kings[Number(!teamDigit(material.team))].onCheck(game);

    cell.element.children[0].children[0].src = oldSrc;
    cell.material = oldCellMaterial;
    game.kings[Number(!teamDigit(material.team))] = oldKing;
    game.allCells[indexOfMaterial].material = oldMaterial;

    return result;
};

function kingAllowedMoves(material, game) {
    return game.allCells.filter(e => {
        if (e.y == material.y || e.y == material.y - 1 || e.y == material.y + 1) {
            if (e.x == material.x || e.x == material.x - 1 || e.x == material.x + 1) {
                if (availbleCell(e, material.team)) return e;
            };
        };
    });
};

function knightAllowedMoves(material, game) {
    return game.allCells.filter(e => {
        if (e.y == material.y + 2 || e.y == material.y - 2) {
            if (e.x == material.x + 1 || e.x == material.x - 1) {
                if (availbleCell(e, material.team)) return e;
            };
        } else if (e.y == material.y + 1 || e.y == material.y - 1) {
            if (e.x == material.x + 2 || e.x == material.x - 2) {
                if (availbleCell(e, material.team)) return e;
            };
        };
    });
};

function pawnAllowedMoves(material, game) {
    const VAR = material.team == "white"? 1: -1;
    return game.allCells.filter(e => {
        if (e.y == material.y + VAR) {
            if (e.x == material.x &&
                emptyCell(e)
            ) return e;

            if ((e.x == material.x + 1 || e.x == material.x - 1)) {
                if (oppenentCell(e, material.team) ||
                game.getCellByPosition(e.x, e.y + VAR * -1).jumpedCell) {
                    // console.log(game.getCellByPosition(e.x, e.y + VAR * -1));
                    return e;
                };
            };
        } else if (e.y == material.y + 2 * VAR &&
            e.x == material.x &&
            emptyCell(e) &&
            (material.y == VAR || material.y == 7 + VAR) &&
            emptyCell(game.getCellByPosition(material.x, material.y + VAR))) return e;
    });
};

function bishopAllowedMoves(material, game) {
    const arr = [];
    const cells = [
        game.allCells.filter(e => material.x - e.x == material.y - e.y && material.y < e.y),
        game.allCells.filter(e => material.x - e.x == material.y - e.y && material.y > e.y),
        game.allCells.filter(e => material.x - e.x == e.y - material.y && material.y < e.y),
        game.allCells.filter(e => material.x - e.x == e.y - material.y && material.y > e.y)
    ];
    cells.forEach((list, index) => {
        list = index == 0 || index == 2? list: list.reverse();
        for (let i = 0; i < list.length; i++) {
            if (!availbleCell(list[i], material.team)) break;
            arr.push(list[i]);
            if (list[i].material) break;
        };
    });
    return arr;
};


function rookAllowedMoves(material, game) {
    const arr = [];
    const cells = [
        game.allCells.filter(e => material.y == e.y && material.x < e.x),
        game.allCells.filter(e => material.y == e.y && material.x > e.x),
        game.allCells.filter(e => material.x == e.x && material.y < e.y),
        game.allCells.filter(e => material.x == e.x && material.y > e.y)
    ];
    cells.forEach((list, index) => {
        list = index == 0 || index == 2? list: list.reverse();
        for (let i = 0; i < list.length; i++) {
            if (!availbleCell(list[i], material.team)) break;
            arr.push(list[i]);
            if (list[i].material) break;
        };
    });
    return arr;
};

function queenAllowedMoves(material, game) {
    return [...bishopAllowedMoves(material, game), ...rookAllowedMoves(material, game)];
};