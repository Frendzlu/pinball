import "./style.css"

import SixteenSegmentDisplay from "./SixteenSegmentDisplay/SixteenSegmentDisplay";
import {GameArea} from "./GameArea/GameArea";

let display = new SixteenSegmentDisplay("display", "test")
display.clearText()
display.renderText("Hello world 1")

let x = new GameArea("ga", "gac")
x.isDebugOn = true
x.render()