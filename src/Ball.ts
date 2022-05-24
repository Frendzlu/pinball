import {Hitbox} from "./Hitbox";
import {Geometry} from "./Geometry";
import Point = Geometry.Point;
import {Envs} from "./envs";
import {CanvasOptions} from "./Renderer";
import {Events} from "./events";
const Vector = Geometry.Vector

const startingData: [Point, number] = [
    new Point(1850, 2600),
    42
]

const GRAVITY_VECTOR: Geometry.Vector = {
    x: 1 * Envs.horizontalGravityModifier,
    y: 1 * Envs.verticalGravityModifier
}

export class Ball {
    hitbox: Hitbox.Circular
    angle: number
    speed: number
    options: CanvasOptions
    interval: number

    constructor(options: CanvasOptions) {
        //let image = document.getElementById("ball") as HTMLImageElement
        this.hitbox = new Hitbox.Circular(...startingData)
        this.angle = -100
        this.speed = 25
        this.options = options
        this.interval = setInterval(() => {
            this.move()
        }, Envs.calculationTimeout)
    }

    move() {
        //console.log(Vector.from(this.speed, this.angle))
        let change = Vector.add(Vector.from(this.speed, this.angle), GRAVITY_VECTOR)
        //console.log("Change:", change)
        this.hitbox.s.x += change.x
        this.hitbox.s.y += change.y
        let velocity = Vector.toVelocity(change)
        //console.log("Velocity:", velocity)
        this.angle = velocity.angle
        this.speed = velocity.speed
        this.hitbox = new Hitbox.Circular(this.hitbox.s, this.hitbox.r)

        if (this.hitbox.maxRange.y[0] > this.options.height ||
            this.hitbox.maxRange.y[1] < 0 ||
            this.hitbox.maxRange.x[0] > this.options.width ||
            this.hitbox.maxRange.x[1] < 0
        ) {
            clearInterval(this.interval)
            Events.outOfBounds.forEach(handle => handle())
        }
    }
}