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
}