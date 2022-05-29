import "./style.css"
import {Envs} from "./envs";
import {Events} from "./events";
import {Game} from "./Game";
import {KeyListener} from "./KeyListener";

Envs.debugMode = true
Envs.preferredDarkMode = true
Envs.showBounceChecks = false
let rotatingLeft = false
let rotatingRight = false
let game = new Game()
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

keyRegister.add("ArrowRight", ()=> {
	game.gameArea.ball.move()
})

keyRegister.add("Shift+ArrowRight", ()=> {
	game.gameArea.ball.move()
},true)
let momentum = 0

keyRegister.add(" ", ()=> {
	momentum += 1
}, true, () => {
	console.log(momentum)
})

Events.outOfBounds.push(()=>{game.onLost()})