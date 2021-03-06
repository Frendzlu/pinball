import {Hitbox} from "./Hitbox";
import {Geometry} from "./Geometry";
import {Envs} from "./envs";
import {CanvasOptions} from "./Renderer";
import {Events} from "./events";
import {Game} from "./Game";
import {CollisionConditions} from "./Collisions";
import Point = Geometry.Point;
import Vector = Geometry.Vector;

const startingData: [Point, number] = [
    //new Point(1850, 2600),
    new Point(1860, 2600),
    42
]

const GRAVITY_VECTOR: Geometry.Vector = new Geometry.Vector(Envs.horizontalGravityModifier, Envs.verticalGravityModifier)
const ANTIGRAVITY_VECTOR: Geometry.Vector = new Geometry.Vector(Envs.horizontalGravityModifier, -1 * Envs.verticalGravityModifier)

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
        this.angle = 0
        this.speed = 0
        this.options = options
        this.game = objRef
        this.interval = setInterval(() => {
            this.move()
        }, Envs.calculationTimeout)
    }

    move() {
        //let normalChange = Geometry.Vector.add(Geometry.Vector.from(this.speed, this.angle, this.hitbox.s), GRAVITY_VECTOR).toVelocity()
        //console.log("Desired:", normalChange.speed, normalChange.angle)
        //console.log(Vector.from(this.speed, this.angle, this.hitbox.s))
        let approx = Math.floor(this.speed)
        let mod = this.speed >= 1 ? 1/this.speed : 1 
        const initialSpeed = this.speed
        // console.log("Approx:", approx)
        // console.log("Gravity:", GRAVITY_VECTOR.multiply(mod))
        // console.log("From:", Geometry.Vector.from(this.speed * mod, this.angle))
        // console.log("Added:", Geometry.Vector.add(Geometry.Vector.from(this.speed * mod, this.angle), GRAVITY_VECTOR.multiply(mod)))
        // console.log("After change:", Geometry.Vector.add(Geometry.Vector.from(this.speed * mod, this.angle), GRAVITY_VECTOR.multiply(mod)).toVelocity())
        //console.log(this.speed, mod)
        for (let i = 0; i <= approx; i++) {
            //console.log("Speed:", this.speed, "Angle:", this.angle)
            let change = Geometry.Vector.add(Geometry.Vector.from(this.speed * mod, this.angle, this.hitbox.s), GRAVITY_VECTOR.multiply(mod ** 2))
            this.handleVelocityChange(change, initialSpeed >= 1 ? initialSpeed : mod)
            this.checkForEscape()
            let shouldContinue = this.checkCollisions()
            if (!shouldContinue) break
        }
        //console.log("Speed:", this.speed, "Angle:", this.angle)
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
        let currentVector = Vector.from(this.speed, this.angle, this.hitbox.s)
        let hitboxes = this.game.checkHitboxes()
        if (!hitboxes.length) return true
        else {
            //console.group("Found")
            //console.log("Hitboxes:", hitboxes)
            let filtered = hitboxes.filter(hitbox => hitbox.checkCondition(this.hitbox))
            //console.groupEnd()
            //console.group("Filtered")
            //console.log("Hitboxes:", filtered)
            let collided = filtered.filter(hitbox => hitbox.checkCollision(this.hitbox))
            //console.groupEnd()
            if (collided.length != 0) {

                //console.group("Collided")
                console.log("Hitboxes:", collided)
                let vectors: Vector[] = [new Vector(0, 0, this.hitbox.s)]
                let smthHappened = false
                for (let hitbox of collided) {
                    //console.group(hitbox)
                    let velocity = currentVector.toVelocity()
                    //console.log("Hitbox options:", hitbox.options)
                    let flage = false
                    if (hitbox.options.shouldBounce) {
                        velocity = currentVector.deflectFrom(hitbox)
                        let shift = 0
                        let shiftAngle = 0
                        if (hitbox instanceof Hitbox.Linear) {
                            shift = this.hitbox.r - this.hitbox.s.distanceFrom(hitbox.line) + 0.1
                            if (hitbox.condition != CollisionConditions.Right) {
                                if (hitbox.condition == CollisionConditions.Left) shiftAngle = -180
                                else {
                                    shiftAngle = hitbox.line.angle - (hitbox.condition == CollisionConditions.Above ? 90 : -90)
                                }
                            }
                            if (hitbox.condition == CollisionConditions.Above) {
                                let modifiedLineAngle = hitbox.line.angle < 0 ? 180 + hitbox.line.angle : hitbox.line.angle
                                if (velocity.speed < Envs.minSpeedOnCollision) {
                                    velocity.angle = modifiedLineAngle
                                } else if (Math.abs(velocity.angle - modifiedLineAngle) < 5) {
                                    velocity.angle = modifiedLineAngle
                                }
                                velocity.angle += modifiedLineAngle < 90 ? 1 : -1
                            }
                        } else {
                            //console.log(this.hitbox.s.distanceFrom(hitbox.s))
                            shift = this.hitbox.r - (this.hitbox.s.distanceFrom(hitbox.s) - hitbox.r) + 1
                            shiftAngle = Geometry.angleOf(hitbox.s, this.hitbox.s)
                        }
                        if (velocity.speed < Envs.minSpeedOnCollision) {
                            flage = true
                        }
                        if (!(hitbox instanceof Hitbox.Circular) && hitbox.condition == CollisionConditions.Above) {
                            let modifiedLineAngle = hitbox.line.angle < 0 ? 180 + hitbox.line.angle : hitbox.line.angle
                            if (hitbox.line.angle == 0 || hitbox.line.angle == 180) {
                                velocity.speed = 0
                                flage = false
                            } else if (Math.abs(velocity.angle - modifiedLineAngle) < 5) {
                                flage = true
                            } else velocity.speed *= Envs.forceDispersion
                        } else velocity.speed *= Envs.forceDispersion
                        console.log("Shift:", shift)
                        console.log("Deflection angle:", velocity.angle, "Current angle", this.angle)
                        console.log("Shift angle:", shiftAngle)
                        let shiftVector = Vector.from(shift, shiftAngle, this.hitbox.s)
                        this.hitbox.s.x += shiftVector.x
                        this.hitbox.s.y += shiftVector.y
                        if (hitbox instanceof Hitbox.Linear) {
                            console.log("Distance:", this.hitbox.s.distanceFrom(hitbox.line))
                        } else {
                            //console.log("Distance:", this.hitbox.s.distanceFrom(hitbox.s))
                        }
                        //console.log("Velocity:", velocity)
                        if (!(hitbox instanceof Hitbox.Circular) && hitbox.rotatable) {
                           // console.log(hitbox.rotatable.currentRotation)
                            //console.log(hitbox.rotatable.allowedRotation)
                            //console.log(hitbox.rotatable.minimalRotation)
                            if (hitbox.rotatable.currentRotation != hitbox.rotatable.allowedRotation && hitbox.rotatable.currentRotation != hitbox.rotatable.minimalRotation) {
                                flage = true
                                velocity.angle = 0
                                velocity.speed = 0
                            }
                        }
                    } else smthHappened = true
                    if (hitbox.options.eventHandle) {
                        for (let event of Events[hitbox.options.eventHandle]) {
                            event(hitbox, {velocity: velocity})
                        }
                    }
                    //console.log("flage:", flage)
                    if (flage) {
                        vectors.push(ANTIGRAVITY_VECTOR)
                        smthHappened = true
                    }
                    vectors.push(Vector.from(velocity.speed, velocity.angle, this.hitbox.s))
                    //console.groupEnd()
                }
                //console.log("Vectors:", vectors)
                let colors = ["#99ff66", "#00ffff", "#ff00ff", "#ff9933", "#cc00ff"]
                let counter = 0
                for (let vector of vectors) {
                    let ctx = this.game.gameArea.htmlElement.getContext("2d")!
                    ctx.moveTo(vector.anchorPoint.x, vector.anchorPoint.y + this.game.gameArea.shift)
                    ctx.strokeStyle = colors[counter]
                    ctx.lineWidth = 5
                    ctx.beginPath()
                    ctx.lineTo(vector.anchorPoint.x + vector.x * Envs.vectorLengthMod, vector.anchorPoint.y + vector.y * Envs.vectorLengthMod + this.game.gameArea.shift)
                    counter++
                }
                let resultingVector = vectors.reduce((vPrev, vCurr) => Vector.add(vPrev, vCurr)).toVelocity()
                //console.log("Result:", resultingVector)
                if (isNaN(resultingVector.angle)) resultingVector.angle = 0
                this.angle = resultingVector.angle
                this.speed = resultingVector.speed
                //console.groupEnd()
                return smthHappened
            }
            return true
        }
    }
}