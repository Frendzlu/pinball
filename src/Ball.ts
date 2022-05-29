import {Hitbox} from "./Hitbox";
import {Geometry} from "./Geometry";
import Point = Geometry.Point;
import {Envs} from "./envs";
import {CanvasOptions} from "./Renderer";
import {Events} from "./events";
import {Game} from "./Game";

const startingData: [Point, number] = [
    new Point(1850, 2600),
    42
]

const GRAVITY_VECTOR: Geometry.Vector = new Geometry.Vector(1 * Envs.horizontalGravityModifier, 1 * Envs.verticalGravityModifier)

export class Ball {
    hitbox: Hitbox.Circular
    angle: number
    speed: number
    options: CanvasOptions
    interval?: number
    game: Game

    constructor(options: CanvasOptions, objRef: Game) {
        //let image = document.getElementById("ball") as HTMLImageElement
        this.hitbox = new Hitbox.Circular(...startingData)
        this.angle = -100
        this.speed = 100
        this.options = options
        this.game = objRef
        // this.interval = setInterval(() => {
        //     this.move()
        // }, Envs.calculationTimeout)
    }

    move() {
        //let normalChange = Geometry.Vector.add(Geometry.Vector.from(this.speed, this.angle), GRAVITY_VECTOR).toVelocity()
        //console.log("Desired:", normalChange.speed, normalChange.angle)
        //console.log(Vector.from(this.speed, this.angle))
        let approx = Math.floor(this.speed)
        let mod = this.speed ? 1/this.speed : 1
        const initialSpeed = this.speed
        //console.log("Approx:", approx)
        //console.log("Gravity:", GRAVITY_VECTOR.multiply(mod))
        //console.log("From:", Geometry.Vector.from(this.speed * mod, this.angle))
        //console.log("Added:", Geometry.Vector.add(Geometry.Vector.from(this.speed * mod, this.angle), GRAVITY_VECTOR.multiply(mod)))
        //console.log("After change:", Geometry.Vector.add(Geometry.Vector.from(this.speed * mod, this.angle), GRAVITY_VECTOR.multiply(mod)).toVelocity())
        for (let i = 0; i <= approx; i++) {
            //console.log(this.speed, this.angle)
            let change = Geometry.Vector.add(Geometry.Vector.from(this.speed * mod, this.angle), GRAVITY_VECTOR.multiply(mod ** 2))
            this.handleVelocityChange(change, initialSpeed ? initialSpeed : mod)
            this.checkForEscape()
            let shouldContinue = this.checkCollisions()
            if (!shouldContinue) break
        }
        console.log(this.speed, this.angle)
    }

    checkForEscape() {
        if (this.hitbox.maxRange.y[0] > this.options.height ||
            this.hitbox.maxRange.y[1] < 0 ||
            this.hitbox.maxRange.x[0] > this.options.width ||
            this.hitbox.maxRange.x[1] < 0
        ) {
            if (this.interval) clearInterval(this.interval)
            Events.outOfBounds.forEach(handle => handle())
        }
    }

    handleVelocityChange(change: Geometry.Vector, approx: number = 1) {
        let velocity = change.toVelocity()
        this.angle = velocity.angle
        this.speed = velocity.speed * approx
        this.hitbox = new Hitbox.Circular(new Point(this.hitbox.s.x + change.x, this.hitbox.s.y + change.y), this.hitbox.r)
    }

    checkCollisions(): boolean {
        let hitboxes = this.game.checkHitboxes()
        if (!hitboxes.length) return true
        else {
            console.log("Found hitboxes:", hitboxes)
            let filtered = hitboxes.filter(hitbox => hitbox.checkCondition(this.hitbox.s))
            console.log("Filtered hitboxes:", filtered)
            return false
        }
    }
}