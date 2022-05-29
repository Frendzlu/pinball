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

        relativeTo(point: Point) {
            return new Point(this.x - point.x , this.y - point.y)
        }

        rotate(angle: number) {
            let θ = d2r(angle)
            this.x = (this.x * Math.cos(θ) - this.y * Math.sin(θ))
            this.y = (this.x * Math.sin(θ) + this.y * Math.cos(θ))
            return this
        }

        rotateAlong(angle: number, anchor: Point) {
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
    }

    export class Line {
        A: Point
        B: Point
        coeffA: number
        coeffB: number

        constructor(a: Point, b: Point) {
            this.A = a
            this.B = b
            this.coeffA = (a.y - b.y) / (a.x - b.x)
            this.coeffB = a.y - a.x * this.coeffA
        }

        evalEquation(x: number) {
            return x * this.coeffA + this.coeffB
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
            this.length = Math.sqrt((a.x - b.x) ** 2 + (a.y - b.y) ** 2)
        }
    }

    export function angleOf(line: Line) {
        return Geometry.r2d(Math.atan((line.A.y - line.B.y) / (line.A.x - line.B.x)))
    }

    export function angleBetween(lineA: Line, lineB: Line) {

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

        constructor(x: number = 0, y: number = 0) {
            this.x = x
            this.y = y
        }

        static from(length: number, angle: number): Vector {
            return new Vector(Math.cos(d2r(angle)) * length, Math.sin(d2r(angle)) * length)
        }

        static add(v1: Vector, v2: Vector): Vector {
            return new Vector(v1.x + v2.x,  v1.y + v2.y)
        }

        toVelocity() {
            let vM = this.y < 0 ? 1 : -1
            let hM = this.x < 0 ? 180 : 0
            return {
                speed: Math.sqrt(this.x ** 2 + this.y ** 2),
                angle: (hM * vM) - r2d(Math.atan((-this.y) / this.x))
            }
        }

        multiply(num: number): Vector {
            return new Vector(this.x * num, this.y * num)
        }
    }
}