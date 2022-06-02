import {Ball} from "./Ball";
import {Hitbox} from "./Hitbox";
import {Envs} from "./envs";
import {game} from "./Game";

type EventArguments = {
	ball?: Ball,
	velocity?: {
		speed: number,
		angle: number
	}
}

type Events = {
	outOfBounds: (() => any)[]
} & {[key: string]: ((hitbox: Hitbox.Linear | Hitbox.Circular, args: EventArguments) => any)[]}

let blackHoleEnabled = true

export let Events: Events = {
	outOfBounds: [],
	rightPaletteBouncer: [
		(_hitbox, args) => {
			args.velocity!.speed *= Envs.paletteBouncerMod
		}
	],
	leftPaletteBouncer: [
		(_hitbox, args) => {
			args.velocity!.speed *= Envs.paletteBouncerMod
		}
	],
	bumper: [
		(_hitbox, args) => {
			args.velocity!.speed += Envs.bouncerConst
			args.velocity!.speed *= Envs.bouncerMod
			game.addPoints(0.5)
		}
	],
	paletteLeft: [
		(_hitbox, _args) => {}
	],
	paletteRight: [
		(_hitbox, _args) => {}
	],
	blackHole: [
		(_hitbox, _args) => {
			if (blackHoleEnabled) {
				let ball = game.gameArea.ball
				clearInterval(ball.interval)
				ball.hitbox.s.x = 267
				ball.hitbox.s.y = 900
				setTimeout(()=> {
					ball.hitbox.s.x = 267
					ball.hitbox.s.y = 900
				}, Envs.calculationTimeout + 10)
				setTimeout(() => {
					ball.speed = 100
					ball.angle = 65
					ball.interval = setInterval(() => {
						ball.move()
					}, Envs.calculationTimeout)
				}, 5000)
				game.addPoints(10000)
				blackHoleEnabled = false
			}
		}
	],
	enableBlackHole: [
		(_hitbox, _args) => {
			blackHoleEnabled = true
		}
	],
	bonus500: [
		(_hitbox, _args) => {
			game.addPoints(5)
		}
	],
	fuelLetterF: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	fuelLetterU: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	fuelLetterE: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	fuelLetterL: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	sunLetterS: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	sunLetterU: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	sunLetterN: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	lightLetterL: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	lightLetterI: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	lightLetterG: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	lightLetterH: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	lightLetterT: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	warpLetterW: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	warpLetterA: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	warpLetterR: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	warpLetterP: [
		(_hitbox, _args) => {
			game.addPoints(50)
		}
	],
	startBlock: [
		(hitbox, _args) => {
			setTimeout(() => {
				hitbox.options.shouldBounce = true
			}, 50)
			game.ballInStart = false
		}
	],
	sunRun: [
		(_hitbox, _args) => {
			game.addPoints(500)
		}
	],
}