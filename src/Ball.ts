import {Hitbox} from "./Hitbox";
import {Geometry} from "./Geometry";
import Point = Geometry.Point;
import {Envs} from "./envs";
const Vector = Geometry.Vector

const startingData: [Point, number, Hitbox.Options] = [
    new Point(1850, 2600),
    42,
    {
        shouldBounce: true
    }
]

const GRAVITY_VECTOR: Geometry.Vector = {
    x: 1 * Envs.horizontalGravityModifier,
    y: 1 * Envs.verticalGravityModifier
}

export class Ball {
    hitbox: Hitbox.Circular
    angle: number
    speed: number

    constructor() {
        //let image = document.getElementById("ball") as HTMLImageElement
        this.hitbox = new Hitbox.Circular(...startingData)
        this.angle = -100
        this.speed = 25
        setInterval(() => {
            this.move()
        }, Envs.calculationTimeout)
    }

    move() {
        //console.log(Vector.from(this.speed, this.angle))
        let change = Vector.add(Vector.from(this.speed, this.angle), GRAVITY_VECTOR)
        console.log("Change:", change)
        this.hitbox.s.x += change.x
        this.hitbox.s.y += change.y
        let velocity = Vector.toVelocity(change)
        console.log("Velocity:", velocity)
        this.angle = velocity.angle
        this.speed = velocity.speed
    }
}