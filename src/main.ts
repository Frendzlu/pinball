import "./style.css"
import {Events} from "./events";
import {game} from "./Game";
import {KeyListener} from "./KeyListener";
import {Envs} from "./envs";

let rotatingLeft = false
let rotatingRight = false
let keyRegister = new KeyListener()

keyRegister.add("Z", ()=> {
	rotatingLeft = true
	game.paletteLeft.rotate(-4)
}, true, () => {
	rotatingLeft = false
	let int = setInterval(()=>{
		if (rotatingLeft) {
			clearInterval(int)
		}
		if (game.paletteLeft.currentRotation >= 0) {
			game.paletteLeft.rotate(0 - game.paletteLeft.currentRotation)
			clearInterval(int)
		} else {
			game.paletteLeft.rotate(4)
		}
	},1)
})

keyRegister.add("M", ()=> {
	rotatingRight = true
	game.paletteRight.rotate(4)
}, true, () => {
	rotatingRight = false
	let int = setInterval(()=>{
		if (rotatingRight) {
			clearInterval(int)
		}
		if (game.paletteRight.currentRotation <= 0) {
			game.paletteRight.rotate(0 - game.paletteRight.currentRotation)
			clearInterval(int)
		} else {
			game.paletteRight.rotate(-4)
		}
	},1)
})
let shouldBallMove = 1

keyRegister.add("P", ()=> {
	if (shouldBallMove > 0) {
		clearInterval(game.gameArea.ball.interval)
	} else game.gameArea.ball.interval = setInterval(() => {
		game.gameArea.ball.move()
	}, Envs.calculationTimeout)
	shouldBallMove *= -1
})

let momentum = 0

keyRegister.add(" ", ()=> {
	momentum += 1
}, true, () => {
	console.log(momentum)
})
Events.outOfBounds.push(()=>{game.onLost()})