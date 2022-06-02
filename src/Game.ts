import SixteenSegmentDisplay from "./SixteenSegmentDisplay/SixteenSegmentDisplay";
import {defaultOptions, GameArea} from "./GameArea/GameArea";
import {Hitbox} from "./Hitbox";
import {Envs} from "./envs";
import {Ball} from "./Ball";

export class Game {
	display: SixteenSegmentDisplay
	gameArea: GameArea
	paletteLeft: Hitbox.Rotatable
	paletteRight: Hitbox.Rotatable
	ballInStart = true
	points: number = 0

	constructor() {
		this.display = new SixteenSegmentDisplay("display", "test")
		this.display.renderText("Player 1!")

		this.gameArea = new GameArea("ga", "gac", defaultOptions, new Ball(defaultOptions, this))
		this.paletteLeft = this.gameArea.getNamedHitbox("paletteLeft")!
		this.paletteRight = this.gameArea.getNamedHitbox("paletteRight")!
	}

	onLost() {
		this.display.renderText("You lost!")
	}

	checkHitboxes() {
		let foundHitboxes = Hitbox.consideredCollisions(this.gameArea.hitboxDefinition.hitboxes, this.gameArea.ball.hitbox.maxRange)
		//console.log(foundHitboxes)
		if (Envs.debugMode) {
			this.gameArea.scheduledEvents["hitboxDebug"] = () => {this.gameArea.drawHitboxRanges(foundHitboxes)}
		}
		return foundHitboxes
	}

	addPoints(points: number) {
		this.points += points * 100
		this.display.renderText(this.points.toString())
	}
}

Envs.debugMode = true
Envs.preferredDarkMode = true
Envs.showBounceChecks = false
export let game = new Game()