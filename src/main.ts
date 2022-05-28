import "./style.css"
import {Envs} from "./envs";
import {Events} from "./events";
import {Game} from "./Game";
import {KeyListener} from "./KeyListener";

Envs.debugMode = true
Envs.preferredDarkMode = true
Envs.showBounceChecks = false
let rotating = false
let game = new Game()
let keyRegister = new KeyListener()
keyRegister.add("C")
keyRegister.add("Z", ()=> {
	rotating = true
	game.paletteLeft.rotate(-2)
}, true, () => {
	rotating = false
	let int = setInterval(()=>{
		if (rotating) {
			clearInterval(int)
		}
		if (game.paletteLeft.currentRotation >= 0) {
			game.paletteLeft.rotate(0 - game.paletteLeft.currentRotation)
			clearInterval(int)
		} else {
			game.paletteLeft.rotate(2)
		}
	},1)
})
Events.outOfBounds.push(()=>{game.onLost()})