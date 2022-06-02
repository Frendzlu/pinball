import {Geometry} from "./Geometry";
import {CollisionConditions} from "./Collisions";
import {game} from "./Game";
import {Envs} from "./envs";

export namespace Hitbox {

	export interface Map {
		circular: Circular[],
		linear: Linear[],
		rotatable: Rotatable[]
	}

	export interface Definition {
		defaultDims: {
			x: number,
			y: number
		},
		hitboxes: Map
	}

	export type Options = {
		eventHandle?: string,
		shouldBounce?: boolean
	}

	const defaultHitboxOptions: Options = {
		shouldBounce: true
	}

	export class EmptyDefinition implements Definition {
		defaultDims: { x: number; y: number };
		hitboxes: Hitbox.Map;

		constructor() {
			this.defaultDims = {
				x: 0,
				y: 0
			}
			this.hitboxes = {
				circular: [],
				linear: [],
				rotatable: []
			}
		}
	}

	export class Segment extends Geometry.Segment {
		angle: number

		constructor(A: Geometry.Point, B: Geometry.Point) {
			super(A, B)
			this.angle = Geometry.angleOf(this)
		}
	}

	export class Circular {
		maxRange: { x: [number, number]; y: [number, number] };
		r: number
		s: Geometry.Point
		options: Options

		constructor(p: Geometry.Point, r: number, options: Options = defaultHitboxOptions) {
			this.maxRange = {
				x: [p.x + r, p.x - r].sort((a, b) => a - b) as [number, number],
				y: [p.y + r, p.y - r].sort((a, b) => a - b) as [number, number]
			}
			this.s = p
			this.r = r
			this.options = options
			if (this.options.shouldBounce === undefined) this.options.shouldBounce = true
			if (this.options.eventHandle) console.log(this)
		}

		checkCondition(_p: Circular) {
			return true
		}

		checkCollision(ball: Circular) {
			let dist = ball.s.distanceFrom(this.s)
			console.log("Distance:", dist, "this radius:", this.r, "ball radius:", ball.r)
			return dist <= this.r + ball.r
		}
	}

	export class Linear {
		line: Segment
		condition: CollisionConditions
		options: Options
		rotatable?: Rotatable

		constructor(p1: Geometry.Point, p2: Geometry.Point, condition: CollisionConditions, options: Options = defaultHitboxOptions, rotatable?: Rotatable) {
			this.line = new Segment(p1, p2)
			this.condition = condition
			if (this.line.coeffA == 0) {
				if (this.condition == CollisionConditions.Below) {
					this.line.angle = 0
				} else if (this.condition == CollisionConditions.Above) {
					this.line.angle = 180
				}
			}
			if (options.shouldBounce == undefined) options.shouldBounce = true
			this.options = options
			this.rotatable = rotatable
		}

		checkCondition(hitbox: Circular): boolean {
			let point = hitbox.s
			let radius = hitbox.r
			//console.log("Condition", this.condition)
			//console.log("line:", this.line)
			//console.log("Value from line equation:", this.line.evalEquation(point.x))
			switch (this.condition) {
				case CollisionConditions.Left:
					//console.log("Point:", point, "Radius:", radius)
					//console.log(point.y < this.line.yRange[0], point.y > this.line.yRange[1])
					if (point.y < this.line.yRange[0] || point.y > this.line.yRange[1]) {
						//console.log("Dist A:", point.distanceFrom(this.line.A), "Dist B:", point.distanceFrom(this.line.B))
						if (point.distanceFrom(this.line.A) < radius || point.distanceFrom(this.line.B) < radius) {
							return true
						}
						return false
					}
					//console.log(point.x < this.line.xRange[0])
					return point.x < this.line.xRange[0]
				case CollisionConditions.Right:
					//console.log("Point:", point, "Radius:", radius)
					//console.log(point.y < this.line.yRange[0], point.y > this.line.yRange[1])
					if (point.y < this.line.yRange[0] || point.y > this.line.yRange[1]) {
						//console.log("Dist A:", point.distanceFrom(this.line.A), "Dist B:", point.distanceFrom(this.line.B))
						if (point.distanceFrom(this.line.A) < radius || point.distanceFrom(this.line.B) < radius) {
							return true
						}
						return false
					}
					//console.log(point.x > this.line.xRange[0])
					return point.x > this.line.xRange[0]
				case CollisionConditions.Above:
					//console.log(point.y < this.line.evalEquation(point.x))
					return point.y < this.line.evalEquation(point.x)
				case CollisionConditions.Below:
					//console.log(point.y > this.line.evalEquation(point.x))
					return point.y > this.line.evalEquation(point.x)
			}
		}

		checkCollision(ball: Circular) {
			//console.log("Line:", this.line)
			//console.log("Ball pos:", ball.s)
			let dist = ball.s.distanceFrom(this.line)
			return dist <= ball.r
		}
	}

	type MapJsonConstruct = {
		linear?: {
			a: Geometry.IPoint
			b: Geometry.IPoint
			condition: CollisionConditions
			options?: Options
		}[]
		circular?: {
			s: Geometry.IPoint
			r: number
			options?: Options
		}[]
		rotatable?: {
			anchorPoint: Geometry.IPoint,
			allowedRotation: number,
			hitboxes: MapJsonConstruct,
			name: string
		} []
	}

	export class Rotatable {
		anchorPoint: Geometry.Point
		allowedRotation: number
		currentRotation: number = 0
		minimalRotation: number = 0
		hitboxes: Map
		initialHitboxes: MapJsonConstruct
		name: string

		constructor(p: Geometry.Point, rotation: number, hitboxes: MapJsonConstruct, name: string) {
			this.anchorPoint = p
			this.allowedRotation = rotation
			this.initialHitboxes = hitboxes
			this.name = name
			this.hitboxes = process(hitboxes, this)
		}

		rotate(degrees: number) {
			let hitboxes = process(this.initialHitboxes)
			//console.log(this.currentRotation, this.allowedRotation)
			this.currentRotation += degrees
			if (Math.abs(this.currentRotation) > Math.abs(this.allowedRotation)) this.currentRotation = this.allowedRotation
			let hitboxVsBall: (Circular | Linear)[] = []
			let ball = game.gameArea.ball
			for (let hitbox of hitboxes.linear) {
				hitbox.line = new Hitbox.Segment(hitbox.line.A.rotateAlong(this.currentRotation, this.anchorPoint), hitbox.line.B.rotateAlong(this.currentRotation, this.anchorPoint))
				if (hitbox.checkCondition(ball.hitbox)) hitboxVsBall.push(hitbox)
			}
			for (let hitbox of hitboxes.circular) {
				hitbox.s = hitbox.s.rotateAlong(this.currentRotation, this.anchorPoint)
				if (hitbox.checkCondition(ball.hitbox)) hitboxVsBall.push(hitbox)
			}
			this.hitboxes = hitboxes
			hitboxVsBall = hitboxVsBall.filter(hb => hb.checkCollision(ball.hitbox))
			for (let hitbox of hitboxVsBall) {
				let shift = 0
				let shiftAngle = -90
				if (hitbox instanceof Linear) {
					//window.alert(hitbox.line.angle)
					game.gameArea.ball.angle = (90 * (hitbox.condition == CollisionConditions.Above ? -1 : 1)) + hitbox.line.angle
					game.gameArea.ball.speed = Envs.paletteSpeed
					shift = ball.hitbox.r - ball.hitbox.s.distanceFrom(hitbox.line)+0.1
					shiftAngle = hitbox.line.angle - (hitbox.condition == CollisionConditions.Above ? 90 : -90)
				} else {
					shift = ball.hitbox.r - (ball.hitbox.s.distanceFrom(hitbox.s)-hitbox.r)+1
					shiftAngle = Geometry.angleOf(hitbox.s, ball.hitbox.s)
				}
				let v = Geometry.Vector.from(shift, shiftAngle, ball.hitbox.s)
				ball.hitbox.s.x += v.x
				ball.hitbox.s.y += v.y
				//window.alert(`${game.gameArea.ball.speed}, ${game.gameArea.ball.angle}`)
			}
		}
	}

	export function process (hitboxes: MapJsonConstruct, rotatable?: Rotatable) {
		let processedHitboxes: Map = new EmptyDefinition().hitboxes
		for (let hitbox of hitboxes.linear || []) {
			if (!hitbox.options) hitbox.options = JSON.parse(JSON.stringify(defaultHitboxOptions))
			processedHitboxes.linear.push(new Linear(new Geometry.Point(hitbox.a), new Geometry.Point(hitbox.b), hitbox.condition, hitbox.options, rotatable))
		}

		processedHitboxes.circular = []
		for (let hitbox of hitboxes.circular || []) {
			if (!hitbox.options) hitbox.options = JSON.parse(JSON.stringify(defaultHitboxOptions))
			processedHitboxes.circular.push(new Circular(new Geometry.Point(hitbox.s), hitbox.r, hitbox.options))
		}

		for (let hitbox of hitboxes.rotatable || []) {
			processedHitboxes.rotatable.push(new Rotatable(new Geometry.Point(hitbox.anchorPoint), hitbox.allowedRotation, hitbox.hitboxes, hitbox.name))
		}
		return processedHitboxes
	}

	export function consideredCollisions(map: Map, range: { x: [number, number]; y: [number, number] }) {
		let toBeReturned: (Circular | Linear)[] = []
		//console.log(range)
		for (let hitbox of map.linear) {
			if (hitbox.line.yRange[0] > range.y[1] ||
				hitbox.line.yRange[1] < range.y[0] ||
				hitbox.line.xRange[0] > range.x[1] ||
				hitbox.line.xRange[1] < range.x[0]) {
			} else toBeReturned.push(hitbox)
		}
		for (let hitbox of map.circular) {
			if (hitbox.maxRange.y[0] > range.y[1] ||
				hitbox.maxRange.y[1] < range.y[0] ||
				hitbox.maxRange.x[0] > range.x[1] ||
				hitbox.maxRange.x[1] < range.x[0]) {
			} else toBeReturned.push(hitbox)
		}
		for (let hitbox of map.rotatable) {
			toBeReturned.push(...consideredCollisions(hitbox.hitboxes, range))
		}
		return toBeReturned
	}
}