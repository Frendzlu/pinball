import SixteenSegmentDisplay from "./SixteenSegmentDisplay/SixteenSegmentDisplay";
import {GameArea} from "./GameArea/GameArea";

export class Game {
	display: SixteenSegmentDisplay
	gameArea: GameArea
	constructor() {
		this.display = new SixteenSegmentDisplay("display", "test")
		this.display.renderText("Player 1!")

		this.gameArea = new GameArea("ga", "gac")
	}

	onLost() {
		this.display.renderText("You lost!")
	}
}