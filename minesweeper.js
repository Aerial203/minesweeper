import { times, range } from "lodash/fp"
import { off } from "process"


export const TILES_STATUS = {
    HIDDEN: "hidden",
    MINE: "mine",
    NUMBER: "number",
    MARKED: "marked"
}


export function createBoard(boardSize, minePositions) {
    return times(x => {
        return times(y => {
            return {
                x, 
                y,
                mine: minePositions.some(positionMatch.bind(null, { x, y })),
                status: TILES_STATUS.HIDDEN
            }
        }, boardSize)
    }, boardSize)
}


export function markedTilesCount(board) {
    return board.reduce((count, row) => {
        return (
            count + row.filter(tile => tile.status === TILES_STATUS.MARKED).length
        )
    }, 0)
}

export function markTile(board, { x, y }) {
    const tile = board[x][y]
    if (
        tile.status !== TILES_STATUS.HIDDEN && 
        tile.status !== TILES_STATUS.MARKED
        ) {
        return board
    }

    if (tile.status === TILES_STATUS.MARKED) {
        return replaceTile(
            board, 
            { x, y }, 
            { ...tile, status: TILES_STATUS.HIDDEN }
        )
    } else {
        return replaceTile(
            board, 
            { x, y }, 
            { ...tile, status: TILES_STATUS.MARKED }
        )
    }
}


function replaceTile(board, position, newTile) {
    return board.map((row, x) => {
        return row.map((tile, y) => {
            if (positionMatch(position, { x, y })) {
                return newTile
            }
            return tile
        })
    })
}


export function revealTile(board, { x, y }) {
    const tile = board[x][y]
    if (tile.status !== TILES_STATUS.HIDDEN) {
        return board
    }
    if (tile.mine) {
        return replaceTile(board, { x, y }, { ...tile, status: TILES_STATUS.MINE})
    } 
    tile.status = TILES_STATUS.NUMBER 
    const adjacentTiles = nearbyTiles(board, tile)
    const mines = adjacentTiles.filter(t => t.mine)
    const newBoard = replaceTile(
        board, 
        { x, y}, 
        {...tile, status: TILES_STATUS.NUMBER, adjacentMinesCount: mines.length }
    )
    if (mines.length === 0) {
        return adjacentTiles.reduce((b, t) => {
            return revealTile(b, t)
        }, newBoard)
    } 
    return newBoard
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

export function positionMatch(a, b) {
    return a.x === b.x && a.y === b.y
}

function nearbyTiles(board, { x, y }) {
    const offsets = range(-1, 2)
    
    return offsets.flatMap(xOffset => {
        return offsets.map(yOffset => {
            return board[x + xOffset]?.[y + yOffset]
        })
    }).filter(tile => tile != null)
}