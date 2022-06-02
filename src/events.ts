import {Ball} from "./Ball";
import {Hitbox} from "./Hitbox";
import {Envs} from "./envs";

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
		}
	],
	paletteLeft: [
		(_hitbox, args) => {
			if (args.velocity!.speed < Envs.paletteSpeed) {
				args.velocity!.speed = Envs.paletteSpeed
			}
		}
	],
	paletteRight: [
		(_hitbox, args) => {
			if (args.velocity!.speed < Envs.paletteSpeed) {
				args.velocity!.speed = Envs.paletteSpeed
			}
		}
	]
}