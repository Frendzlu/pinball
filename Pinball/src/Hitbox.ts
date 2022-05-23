import {Segment, Point, Geometry} from "./Geometry";
import {CollisionConditions} from "./Collisions";

export interface HitboxMap {
    hitboxes: {
        circle: CircularHitbox[],
        line: LineHitbox[],
        rotatable: RotatableHitbox[]
    }
}

export interface HitboxDefinition {
    defaultDims: {
        x: number,
        y: number
    },
    hitboxes: HitboxMap
}

export class HitboxSegment {
    line: Segment
    angle: number

    constructor(A: Point, B: Point) {
        this.line = new Segment(A, B)
        this.angle = Geometry.angleOf(this.line)
    }
}

export class CircularHitbox {
    maxRange: { x: [number, number]; y: [number, number] };
    r: number
    s: Point

    constructor(p: Point, r: number) {
        this.maxRange = {
            x: [p.x + r, p.x - r].sort((a, b) => a - b) as [number, number],
            y: [p.y + r, p.y - r].sort((a, b) => a - b) as [number, number]
        }
        this.s = p
        this.r = r
    }
}

export class LineHitbox {
    line: HitboxSegment
    condition: CollisionConditions

    constructor(p1: Point, p2: Point, condition: CollisionConditions) {
        this.line = new HitboxSegment(p1, p2)
        this.condition = condition
    }
}

export class RotatableHitbox {
    anchorPoint: Point
    allowedRotation: number
    hitboxes: HitboxMap

    constructor(p: Point, rotation: number, hitboxes: HitboxMap) {
        this.anchorPoint = p
        this.allowedRotation = rotation
        this.hitboxes = hitboxes
    }
}