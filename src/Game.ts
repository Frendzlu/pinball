import SixteenSegmentDisplay from "./SixteenSegmentDisplay/SixteenSegmentDisplay";
import {GameArea} from "./GameArea/GameArea";
import {Hitbox} from "./Hitbox";

export class Game {
	display: SixteenSegmentDisplay
	gameArea: GameArea
	paletteLeft: Hitbox.Rotatable
	paletteRight: Hitbox.Rotatable

	constructor() {
		this.display = new SixteenSegmentDisplay("display", "test")
		this.display.renderText("Player 1!")

		this.gameArea = new GameArea("ga", "gac")
		this.paletteLeft = this.gameArea.getNamedHitbox("paletteLeft")!
		this.paletteRight = this.gameArea.getNamedHitbox("paletteRight")!
	}

	onLost() {
		this.display.renderText("You lost!")
	}
}