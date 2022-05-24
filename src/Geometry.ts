export namespace Geometry {
    export interface Point {
        x: number,
        y: number
    }

    export class Point implements Point {
        constructor(x: number = 0, y: number = 0) {
            this.x = x
            this.y = y
        }
    }

    export class Line {
        A: Point
        B: Point

        constructor(a: Point, b: Point) {
            this.A = a
            this.B = b
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

    export type Vector = {
        x: number
        y: number
    }

    export namespace Vector {
        export function from(length: number, angle: number): Vector {
            return {
                x: Math.cos(d2r(angle)) * length,
                y: Math.sin(d2r(angle)) * length
            }
        }

        export function add(v1: Vector, v2: Vector): Vector {
            return {
                x: v1.x + v2.x,
                y: v1.y + v2.y
            }
        }

        export function toVelocity(v: Vector){
            let vM = v.y < 0 ? 1 : -1
            let hM = v.x < 0 ? 180 : 0
            return {
                speed: Math.sqrt(v.x ** 2 + v.y ** 2),
                angle: (hM * vM) - r2d(Math.atan((-v.y) / v.x))
            }
        }
    }
}