
let score = 0
let combo = 0
let highscore = +localStorage.highscore || 0

let gamestate = 'mainmenu' // mainmenu, game
let gamestarted = false

// colors: n (none) r (red) y (yellow) g (green) b (blue) p (purple)
// color string: '[outer][middle][inner]' eg. 'nnn'
let board = [
    ['nnn', 'nnn', 'nnn'],
    ['nnn', 'nnn', 'nnn'],
    ['nnn', 'nnn', 'nnn']
]

// let board = [
//     ['rgb', 'rny', 'ybn'],
//     ['ngb', 'nnn', 'nny'],
//     ['ppp', 'pnp', 'gnb']
// ]

let selectables = ['nnn', 'nnn', 'nnn']

let selectstate = 'not selected' // not selected, dragging, returning
let returnPercentage = 0 // between 0 and 1
let dropX, dropY
let selected // 0 first, 1 second, 2 third

// utils
let isBetween = (num, low, high) => num > low && num < high

let pickRandom = (...choices) => choices[Math.floor(Math.random() * choices.length)]

// let hasColor = (str, c) => str[0] == c || str[1] == c || str[2] == c

// p5
function setup() {
    createCanvas(windowWidth, windowHeight)
    textAlign(CENTER, CENTER)
    populateSelectables()
}

function draw() {
    background(30, 30, 30)
    drawOutline()
    // drawShape(width / 10, width / 10, width * .09, 'pny')
    drawShapes()
    if (frameCount % 100 == 0) checkIfGameOver()
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight)
}

function drawOutline() {
    if (gamestate == 'mainmenu') {
        drawMainMenuOutline()
    }
    else {
        drawGameOutline()
    }
    drawScore()
}

function drawMainMenuOutline() {
    colorMode(HSL, 100)
    fill(frameCount % 200 / 2, 50, 50)
    textSize(60 + 30 * Math.cos(Math.cos(frameCount * .01)))
    textAlign(CENTER)
    text(gamestarted ? 'Game Over' : 'Ring Crush', width / 2, height * .4)

    colorMode(RGB, 256)
    if (isBetween(mouseX, width * .4, width * .6) &&
        isBetween(mouseY, height * .45, height * .55)) {
        if (frameCount % 80 > 8) {
            fill(0, 200, 0)
        }
        else {
            fill(255)
        }
        textSize(35)
    }
    else {
        fill(100)
        textSize(30)
    }
    text(gamestarted ? 'Restart' : 'Start', width / 2, height / 2)
}

function drawScore() {
    textSize(20)
    textAlign(LEFT)
    fill(100)
    text(`HIGH ${highscore}`, width * .8, height * .05)
    if (score || gamestate == 'game') text(`SCORE ${score}`, width * .8, height * .1)
    if (gamestate == 'game') text(`COMBO ${combo}`, width * .8, height * .15)
}

function mouseClicked() {
    if (gamestate == 'mainmenu') {
        if (isBetween(mouseX, width * .4, width * .6) &&
            isBetween(mouseY, height * .45, height * .55)) {
            gamestate = 'game'
            gamestarted = true
            score = 0
            combo = 0
            cleanSelectables()
            populateSelectables()
            cleanBoard()
        }
    }
}

function drawGameOutline() {

    let cell = mouseIsOnCell()
    rectMode(CENTER, CENTER)

    for (let x = -1; x < 2; x++) {
        for (let y = -1; y < 2; y++) {

            if (cell && !cell.selectableCell && cell.x == x + 1 && cell.y == y + 1) {
                fill(50)
            }
            else fill(40)

            square(width * (.5 + x / 10),
                height * .5 + width * y / 10,
                width * .09)
        }
    }
}

function mouseIsOnCell() {
    let lowX = width * (.4 - .09 / 2)
    let highX = width * (.6 + .09 / 2)
    let lowY = height * .5 - width * (.1 + .09 / 2)
    let highY = height * .5 + width * (.1 + .09 / 2)

    let selectMenuLowY = height - width * .09
    let selectMenuHighY = height

    let cell = { x: '?', y: '?', selectableCell: false }

    if (isBetween(mouseX, lowX, highX) && isBetween(mouseY, lowY, highY)) {
        cell.x = Math.floor((mouseX - lowX) / (highX - lowX) * 3)
        cell.y = Math.floor((mouseY - lowY) / (highY - lowY) * 3)
        return cell
    }

    else if (isBetween(mouseX, lowX, highX) && isBetween(mouseY, selectMenuLowY, selectMenuHighY)) {
        cell.x = Math.floor((mouseX - lowX) / (highX - lowX) * 3)
        cell.selectableCell = true
        return cell
    }

    else {
        return null
    }
}

function drawShape(x, y, w, colors) {

    push()
    colorMode(RGB, 256)

    let strToColor = str => {
        if (str == 'n') return color('rgba(0,0,0,0)')
        if (str == 'r') return color(200, 0, 0)
        if (str == 'g') return color(0, 200, 0)
        if (str == 'b') return color(0, 0, 200)
        if (str == 'y') return color(200, 200, 0)
        if (str == 'p') return color(200, 0, 200)
    }

    let outerColor = strToColor(colors[0])
    let middleColor = strToColor(colors[1])
    let innerColor = strToColor(colors[2])

    noFill()
    strokeWeight(15)
    stroke(outerColor)
    circle(x, y, w)
    stroke(middleColor)
    circle(x, y, w * .6)
    stroke(innerColor)
    circle(x, y, w * .2)

    pop()
}

function populateSelectables() {

    let allSame = str => (str[0] == str[1] && str[1] == str[2] && str[0] == str[2])

    for (let i = 0; i<3; i++) {
        if ( selectables[i] != 'nnn') continue

        while ( allSame( selectables[i]) || selectables[i].indexOf('n') == -1) {
            selectables[i] = selectables[i]
                .split('')
                .map(c => pickRandom('n', 'n', 'n', 'n', 'r', 'b', 'g', 'y'))
                .join('')
        }
    }
    
}

function cleanBoard() {
    board = [
        ['nnn', 'nnn', 'nnn'],
        ['nnn', 'nnn', 'nnn'],
        ['nnn', 'nnn', 'nnn']
    ]
}

function cleanSelectables() {
    selectables = ['nnn', 'nnn', 'nnn']
}

function drawShapes() {
    if (gamestate != 'game') return

    // board
    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {

            let x = width * .5 + width * .1 * (i - 1)
            let y = height * .5 + width * .1 * (j - 1)

            drawShape(x, y, width / 15, board[j][i])
        }
    }

    // selectables
    for (let i = 0; i < 3; i++) {

        let x = width * .5 + width * .1 * (i - 1)
        let y = height - width * .05

        if (selectstate == 'not selected' || selected != i)
            drawShape(x, y, width / 15, selectables[i])
    }

    if (selectstate == 'dragging') {
        drawShape(mouseX, mouseY, width / 15, selectables[selected])
    }
    else if (selectstate == 'returning') {

        // destination
        let destX = width * .5 + width * .1 * (selected - 1)
        let destY = height - width * .05

        let dx = (destX - dropX) * returnPercentage
        let dy = (destY - dropY) * returnPercentage

        drawShape(dropX + dx, dropY + dy, width / 15, selectables[selected])

    }

}


function mouseDragged() {
    if (gamestate != 'game' || selectstate != 'not selected') return

    let cell = mouseIsOnCell()

    // lazy eval, so no problem
    if (!cell || !cell.selectableCell) return

    selected = cell.x
    selectstate = 'dragging'

}

function mouseReleased() {
    if (gamestate != 'game' || selectstate != 'dragging') return

    let cell = mouseIsOnCell()

    if (!cell || cell.selectableCell || !canMerge(selectables[selected], board[cell.y][cell.x])) {
        dropX = mouseX
        dropY = mouseY
        returnPercentage = 0
        selectstate = 'returning'

        let interval
        interval = setInterval(() => {
            returnPercentage += .1
            if (returnPercentage > 1) {
                selectstate = 'not selected'
                clearInterval(interval)
            }
        }, 16)

    }

    else if (canMerge(selectables[selected], board[cell.y][cell.x])) {
        board[cell.y][cell.x] = mergeRings(selectables[selected], board[cell.y][cell.x])
        selectables[selected] = 'nnn'
        selectstate = 'not selected'

        updateBoard()

        // if (selectables[0] == 'nnn' && selectables[1] == 'nnn' && selectables[2] == 'nnn') {
            setTimeout(() => {
                populateSelectables()
            }, 1000)
        // }
    }
}

function canMerge(what, to) {
    if (what[0] != 'n' && to[0] != 'n') return false
    if (what[1] != 'n' && to[1] != 'n') return false
    if (what[2] != 'n' && to[2] != 'n') return false
    return true
}

function mergeRings(what, to) {
    let news = ''

    news += what[0] == 'n' ? to[0] : what[0]
    news += what[1] == 'n' ? to[1] : what[1]
    news += what[2] == 'n' ? to[2] : what[2]

    return news
}

function updateBoard() {

    let scoreAdd = 0

    let allSeqs = [
        [{ x: 0, y: 0 }, { x: 1, y: 0 }, { x: 2, y: 0 }],
        [{ x: 0, y: 1 }, { x: 1, y: 1 }, { x: 2, y: 1 }],
        [{ x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }],
        [{ x: 0, y: 0 }, { x: 0, y: 1 }, { x: 0, y: 2 }],
        [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 1, y: 2 }],
        [{ x: 2, y: 0 }, { x: 2, y: 1 }, { x: 2, y: 2 }],
        [{ x: 0, y: 0 }, { x: 1, y: 1 }, { x: 2, y: 2 }],
        [{ x: 2, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 2 }]
    ]

    let colors = ['y', 'g', 'b', 'r']

    let newboard = [
        [board[0][0], board[0][1], board[0][2]],
        [board[1][0], board[1][1], board[1][2]],
        [board[2][0], board[2][1], board[2][2]]
    ]

    for (let i = 0; i < 3; i++) {
        for (let j = 0; j < 3; j++) {
            let cell = board[i][j]
            if (cell == 'nnn') continue
            if (cell[0] == cell[1] &&
                cell[1] == cell[2] &&
                cell[0] == cell[2]) {
                newboard[i][j] = 'nnn'
                scoreAdd++
            }
        }
    }

    let changestr = (str, ind, to) => {
        let ar = str.split('')
        ar[ind] = to
        return ar.join('')
    }

    allSeqs.forEach(s => {
        let c0 = board[s[0].y][s[0].x]
        let c1 = board[s[1].y][s[1].x]
        let c2 = board[s[2].y][s[2].x]

        colors.forEach(c => {
            for (let i = 0; i < 3; i++) {
                if (c0[i] == c && c1[i] == c && c2[i] == c) {
                    newboard[s[0].y][s[0].x] = changestr(newboard[s[0].y][s[0].x], i, 'n')
                    newboard[s[1].y][s[1].x] = changestr(newboard[s[1].y][s[1].x], i, 'n')
                    newboard[s[2].y][s[2].x] = changestr(newboard[s[2].y][s[2].x], i, 'n')
                    scoreAdd++
                }
            }
        })
    })

    board = newboard
    score += scoreAdd * (2 ** combo)
    if (scoreAdd == 0) combo = 0
    else combo += scoreAdd
    if (score > highscore) {
        highscore = score
        window.localStorage.highscore = highscore
    }
}

function checkIfGameOver() {

    if (selectables[0] == 'nnn' && selectables[1] == 'nnn' && selectables[2] == 'nnn') return
    let isgameover = true

    ice:
    for (let s = 0; s < 3; s++) {
        if (selectables[s] == 'nnn') continue
        for (let y = 0; y < 3; y++) {
            for (let x = 0; x < 3; x++) {
                if (canMerge(selectables[s], board[y][x])) {
                    isgameover = false
                    break ice
                }
            }
        }
    }

    if (isgameover) {
        gamestate = 'mainmenu'
        selectstate = 'not selected'
    }
}