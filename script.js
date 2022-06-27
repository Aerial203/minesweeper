import { TILES_STATUS, createBoard, markTile, revealTile, checkWin, checkLoose, positionMatch, markedTilesCount } from "./minesweeper.js"

const BOARD_SIZE = 10
const NUMBER_OF_MINES = 10

let board = createBoard(BOARD_SIZE, getMinePosition(BOARD_SIZE, 
NUMBER_OF_MINES))
const boardElement = document.querySelector(".board")
const minesLeftText = document.querySelector('[data-mine-count]')
const messageText = document.querySelector(".subtext")


function render() {
    boardElement.innerHTML = ""
    checkGameEnd()

    getTileElements().forEach(element => {
        boardElement.append(element)
    })

    listMinesLeft()
}

function getTileElements() {
    return board.flatMap(row => {
        return row.map(tileToElement)
    })
}

function tileToElement(tile) {
    const element = document.createElement("div")
    element.dataset.status = tile.status
    element.dataset.x = tile.x
    element.dataset.y = tile.y
    element.textContent = tile.adjacentMinesCount || ""
    return element
}

boardElement.addEventListener("click", e => {
    if(!e.target.matches('[data-status]')) return

    board = revealTile(
        board, 
        { 
            x: parseInt(e.target.dataset.x),
            y: parseInt(e.target.dataset.y),
        }
    )
    render()
})


boardElement.addEventListener("contextmenu", e => {
    if(!e.target.matches('[data-status]')) return
    e.preventDefault()
    board = markTile(
        board, 
        { 
            x: parseInt(e.target.dataset.x), 
            y: parseInt(e.target.dataset.y) 
        }
        )
    render()
})


boardElement.style.setProperty("--size", BOARD_SIZE)
render()

function listMinesLeft() {
    minesLeftText.textContent = NUMBER_OF_MINES - markedTilesCount(board)
}


function checkGameEnd() {
    const win = checkWin(board)
    const lose = checkLoose(board) 
    if (win || lose ) {
        boardElement.addEventListener("click", stopProp, { capture: true } )
        boardElement.addEventListener("contextmenu", stopProp, { capture: true } )
    }

    if (win) {
        messageText.textContent = "You win 😊"
    }
    if (lose) {
        messageText.textContent = "You Lose 😔"
        board.forEach(row => {
            row.forEach(tile => {
                if (tile.status === TILES_STATUS.MARKED) board = markTile(tile)
                if (tile.mine) board = revealTile(board, tile)
            })
        })
    }

}

function stopProp(e) {
    e.stopImmediatePropagation()
}

function randomNumber(size) {
    return Math.floor(Math.random() * size)
}


function getMinePosition(boardSize, numberOfMines) {
    const positions = []

    while (positions.length < numberOfMines) {
        const position = {
            x: randomNumber(boardSize),
            y: randomNumber(boardSize),
        } 

        if (!positions.some(positionMatch.bind(null, position))) {
            positions.push(position)
        }
    }
    return positions
}