
export const TILES_STATUS = {
    HIDDEN: "hidden",
    MINE: "mine",
    NUMBER: "number",
    MARKED: "marked"
}


export function createBoard(boardSize, numberOfMines) {
    const board = []
    const minePositions = getMinePosition(boardSize, numberOfMines)
    for (let x = 0 ; x < boardSize; x++) {
        const row = []
        for (let y = 0; y < boardSize; y++) {
            const element = document.createElement("div")
            element.dataset.status = TILES_STATUS.HIDDEN
            const tiles = {
                element,
                x, 
                y,
                mine: minePositions.some(positionMatch.bind(null, { x, y })),
                get status() {
                    return this.element.dataset.status
                },
                set status(value) {
                    this.element.dataset.status = value
                }
            }
            row.push(tiles)
        }
        board.push(row)
    }

    return board
}

export function markTile(tile) {
    if (
        tile.status !== TILES_STATUS.HIDDEN && 
        tile.status !== TILES_STATUS.MARKED
        ) {
        return
    }

    if (tile.status === TILES_STATUS.MARKED) {
        tile.status = TILES_STATUS.HIDDEN
    } else {
        tile.status = TILES_STATUS.MARKED
    }
}

export function revealTile(board, tile) {
    if (tile.status !== TILES_STATUS.HIDDEN) {
        return
    }
    if (tile.mine) {
        tile.status = TILES_STATUS.MINE
        return
    } 
    tile.status = TILES_STATUS.NUMBER 
    const adjacentTile = nearbyTiles(board, tile)
    const mines = adjacentTile.filter(t => t.mine)
    if (mines.length === 0) {
         adjacentTile.forEach(revealTile.bind(null, board))
    } else {
        tile.element.textContent = mines.length
    }
}

export function checkWin(board) {
    return board.every(row => {
        return row.every(tile => {
            return tile.status === TILES_STATUS.NUMBER || 
            (tile.mine && (tile.status === TILES_STATUS.HIDDEN || tile.status === TILES_STATUS.MARKED)) 
        })
    })
}

export function checkLoose(board){
    return board.some(row => {
        return row.some(tile => {
            return tile.status === TILES_STATUS.MINE
        })
    })
}

function getMinePosition(boardSize, numberOfMines) {
    const positions = []
    while (positions.length < numberOfMines) {
        const position = {
            x: randomNumber(boardSize),
            y: randomNumber(boardSize),
        } //p => positionMatch(p, position)
        if (!positions.some(positionMatch.bind(null, position))) {
            positions.push(position)
        }
    }
    return positions
}

function positionMatch(a, b) {
    return a.x === b.x && a.y === b.y
}


function randomNumber(size) {
    return Math.floor(Math.random() * size)
}

function nearbyTiles(board, { x, y }) {
    const tiles = []
    for (let xOffset = -1; xOffset <= 1; xOffset++) {
        for (let yOffset = -1; yOffset <= 1; yOffset++) {
            const tile = board[x + xOffset]?.[y + yOffset]
            if (tile) tiles.push(tile)
        }
    }
    return tiles
}