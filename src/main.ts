import "./style.css"
import {Envs} from "./envs";
import {Events} from "./events";
import {Game} from "./Game";

Envs.debugMode = false
Envs.preferredDarkMode = true
Envs.showBounceChecks = false

let game = new Game()
Events.outOfBounds.push(()=>{game.onLost()})