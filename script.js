import { TILES_STATUS, createBoard, markTile, revealTile, checkWin, checkLoose } from "./minesweeper.js"

const BOARD_SIZE = 10
const NUMBER_OF_MINES = 10

const board = createBoard(BOARD_SIZE, NUMBER_OF_MINES)
const boardELement = document.querySelector(".board")
const minesLeftText = document.querySelector('[data-mine-count]')
const messageText = document.querySelector(".subtext")


board.forEach(row => {
    row.forEach(tile => {
        boardELement.appendChild(tile.element)
        tile.element.addEventListener("click", () => {
            revealTile(board, tile)
            checkGameEnd()
        })
        tile.element.addEventListener("contextmenu", e => {
            e.preventDefault()
            markTile(tile)
            listMinesLeft()
        })

    })
})
boardELement.style.setProperty("--size", BOARD_SIZE)
minesLeftText.textContent = NUMBER_OF_MINES


function listMinesLeft() {
    const markedTilesCount = board.reduce((count, row) => {
        return (
            count + row.filter(tile => tile.status === TILES_STATUS.MARKED).length
        )
    }, 0)
    minesLeftText.textContent = NUMBER_OF_MINES - markedTilesCount
}


function checkGameEnd() {
    const win = checkWin(board)
    const lose = checkLoose(board) 
    if (win || lose ) {
        boardELement.addEventListener("click", stopProp, { capture: true } )
        boardELement.addEventListener("contextmenu", stopProp, { capture: true } )
    }

    if (win) {
        messageText.textContent = "You win 😊"
    }
    if (lose) {
        messageText.textContent = "You Lose 😔"
        board.forEach(row => {
            row.forEach(tile => {
                if (tile.status === TILES_STATUS.MARKED) markTile(tile)
                if (tile.mine) revealTile(board, tile)
            })
        })
    }

}

function stopProp(e) {
    e.stopImmediatePropagation()
}