import "./style.css"
import SixteenSegmentDisplay from "./SixteenSegmentDisplay/SixteenSegmentDisplay";
import {GameArea} from "./GameArea/GameArea";
import {Envs} from "./envs";
import {KeyListener} from "./KeyListener";

let display = new SixteenSegmentDisplay("display", "test")
display.clearText()
display.renderText("!%*()-_=+\\|{}[]'\"`.,?/")

let x = new GameArea("ga", "gac")
Envs.debugMode = true
Envs.preferredDarkMode = true
Envs.showBounceChecks = true
var envs = Envs
console.log(envs)
display.clearText()
display.renderText("Player 1ś")
x.render()

let listener = new KeyListener()

console.log(listener.keyBinds)