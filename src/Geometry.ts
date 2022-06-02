import {Hitbox} from "./Hitbox"

export namespace Geometry {
    export interface IPoint {
        x: number,
        y: number
    }

    export class Point implements IPoint {
        x: number
        y: number

        constructor(x: number, y: number)
        constructor(point: IPoint)
        constructor(...args: any) {
            if (!args.length) {
                this.x = 0
                this.y = 0
            } else if (typeof args[0] == "number") {
                this.x = args[0]
                this.y = args[1] || 0
            } else {
                this.x = args[0].x
                this.y = args[0].y
            }
        }

        relativeTo(point: IPoint) {
            return new Point(this.x - point.x , this.y - point.y)
        }

        rotate(angle: number) {
            let θ = d2r(angle)
            this.x = (this.x * Math.cos(θ) - this.y * Math.sin(θ))
            this.y = (this.x * Math.sin(θ) + this.y * Math.cos(θ))
            return this
        }

        rotateAlong(angle: number, anchor: IPoint) {
            //console.group("Point")
            //console.log("point:", this)
            //console.log("anchor:", anchor)
            let relativePoint = this.relativeTo(anchor)
            //console.log("relative:",relativePoint)
            //console.log("angle:", angle)
            let currentAngle = 0
            for (let i = 0; i < Math.abs(angle) / 0.1; i++){
                let toRotate = (angle / Math.abs(angle)) * 0.1
                relativePoint.rotate(toRotate)
                currentAngle += toRotate
            }
            relativePoint.rotate(angle - currentAngle)
            //console.log("rotated:",relativePoint)
            relativePoint.x += anchor.x
            relativePoint.y += anchor.y
            //console.groupEnd()
            return relativePoint
        }

        distanceFrom(point: IPoint): number
        distanceFrom(line: Line): number
        distanceFrom(target: IPoint | Line) {
            //console.log("coords:", this.x, this.y)
            if (target instanceof Line) {
                let coeff = 0
                if (Math.abs(target.coeffA) == Infinity) {
                    //console.log("Inf")
                    coeff = Math.abs(this.x - target.A.x)
                } else if (Math.abs(target.coeffA) == 0) {
                    //console.log("Zero")
                    coeff = Math.abs(this.y + target.coeffB)
                } else {
                    //console.log("Not zero")
                    coeff = Math.abs(this.x + (1 / target.coeffA) * this.y + (1 / target.coeffA) * target.coeffB) / Math.sqrt((1 / target.coeffA) ** 2 + 1)
                }
                //console.log("coeff:", coeff)
                return coeff
            } else return Math.sqrt((this.x - target.x) ** 2 + (this.y - target.y) ** 2)
        }
    }

    export class Line {
        A: Point
        B: Point
        coeffA: number
        coeffB: number

        constructor(a: Point, b: Point) {
            this.A = a
            this.B = b
            this.coeffA = (b.y - a.y) / (a.x - b.x)
            this.coeffB = - a.y - a.x * this.coeffA
        }

        evalEquation(x: number) {
            return (x * this.coeffA + this.coeffB) * - 1
        }
    }

    export class Segment extends Line {
        yRange: [number, number]
        xRange: [number, number]
        length: number

        constructor(a: Point, b: Point) {
            super(a, b)
            this.yRange = [a.y, b.y].sort((a, b) => a - b) as [number, number]
            this.xRange = [a.x, b.x].sort((a, b) => a - b) as [number, number]
            this.length = a.distanceFrom(b)
        }
    }

    export function angleOf(A: Point, B: Point): number
    export function angleOf(line: Line): number
    export function angleOf(arg1: Line | Point, arg2?: Point) {
        if (arg1 instanceof Line) {
            return r2d(Math.atan((arg1.A.y - arg1.B.y) / (arg1.A.x - arg1.B.x)))
        } else {
            let vm = arg1.y < arg2!.y ? 1 : -1
            let hm = arg1.x < arg2!.x ? 0 : 180
            return (vm * hm) + r2d(Math.atan((arg1.y - arg2!.y) / (arg1.x - arg2!.x)))
        }
    }

    export function r2d(radians: number) {
        return radians * 180 / Math.PI
    }

    export function d2r(degrees: number) {
        return degrees * Math.PI / 180
    }

    export interface IVector {
        x: number
        y: number
    }

    export class Vector implements IVector {
        x: number
        y: number
        anchorPoint: Point

        constructor(x: number = 0, y: number = 0, anchorPoint: Point = new Point(0, 0)) {
            this.x = x
            this.y = y
            this.anchorPoint = anchorPoint
        }

        static from(length: number, angle: number, anchor: Point): Vector {
            return new Vector(Math.cos(d2r(angle)) * length, Math.sin(d2r(angle)) * length, anchor)
        }

        static add(v1: Vector, v2: Vector): Vector {
            return new Vector(v1.x + v2.x,  v1.y + v2.y, v1.anchorPoint)
        }

        toVelocity() {
            //console.log(this.x, this.y)
            let vM = this.y < 0 ? 1 : -1
            let hM = this.x < 0 ? -180 : 0
            //console.log((hM * vM) - r2d(Math.atan((-this.y) / this.x)))
            let resAngle = (hM * vM) - r2d(Math.atan((-this.y) / this.x))
            return {
                speed: Math.sqrt(this.x ** 2 + this.y ** 2),
                angle: isNaN(resAngle) ? 0 : resAngle
                //angle: r2d(Math.atan2((-this.y), this.x))
            }
        }

        multiply(num: number): Vector {
            return new Vector(this.x * num, this.y * num, this.anchorPoint)
        }

        deflectFrom(target: Hitbox.Linear | Hitbox.Circular) {
            let velocity = this.toVelocity()
            //console.log("Current velocity:", velocity)
            if (target instanceof Hitbox.Linear) {
                velocity.angle = (180 - (180 + 2 * target.line.angle - velocity.angle) % 360) * - 1
            } else {
                console.log("From ball:", angleOf(this.anchorPoint, target.s))
                console.log("From hitbox:", angleOf(target.s, this.anchorPoint))
                velocity.angle = 2 * angleOf(this.anchorPoint, target.s) - velocity.angle - 180
            }
            return velocity
        }
    }
}