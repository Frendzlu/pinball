import {Geometry} from "./Geometry";
import {CollisionConditions} from "./Collisions";

export namespace Hitbox {
    import Point = Geometry.Point;

    export interface HitboxMap {
        circular: Circular[],
        linear: Linear[],
        rotatable: Rotatable[]
    }

    export interface Definition {
        defaultDims: {
            x: number,
            y: number
        },
        hitboxes: HitboxMap
    }

    type HitboxOptions = {
        eventHandle?: string,
        shouldBounce: boolean
    }

    const defaultHitboxOptions: HitboxOptions = {
        shouldBounce: true
    }

    export class EmptyDefinition implements Definition {
        defaultDims: { x: number; y: number };
        hitboxes: Hitbox.HitboxMap;

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
        options: HitboxOptions

        constructor(p: Geometry.Point, r: number, options: HitboxOptions = defaultHitboxOptions) {
            this.maxRange = {
                x: [p.x + r, p.x - r].sort((a, b) => a - b) as [number, number],
                y: [p.y + r, p.y - r].sort((a, b) => a - b) as [number, number]
            }
            this.s = p
            this.r = r
            this.options = options
        }
    }

    export class Linear {
        line: Segment
        condition: CollisionConditions
        options: HitboxOptions

        constructor(p1: Geometry.Point, p2: Geometry.Point, condition: CollisionConditions, options: HitboxOptions = defaultHitboxOptions) {
            this.line = new Segment(p1, p2)
            this.condition = condition
            this.options = options
        }
    }

    type HitboxMapJsonConstruct = {
        linear?: {
            a: Point
            b: Point
            condition: CollisionConditions
            options?: HitboxOptions
        }[]
        circular?: {
            s: Point
            r: number
            options?: HitboxOptions
        }[]
        rotatable?: {
            anchorPoint: Geometry.Point,
            allowedRotation: number,
            hitboxes: HitboxMapJsonConstruct
        } []
    }

    export class Rotatable {
        anchorPoint: Geometry.Point
        allowedRotation: number
        hitboxes: HitboxMap

        constructor(p: Geometry.Point, rotation: number, hitboxes: HitboxMapJsonConstruct) {
            this.anchorPoint = p
            this.allowedRotation = rotation
            this.hitboxes = processHitboxes(hitboxes)
        }
    }

    export function processHitboxes (hitboxes: HitboxMapJsonConstruct) {
        let processedHitboxes: HitboxMap = new EmptyDefinition().hitboxes
        for (let hitbox of hitboxes.linear || []) {
            processedHitboxes.linear.push(new Linear(hitbox.a, hitbox.b, hitbox.condition, hitbox.options))
        }

        processedHitboxes.circular = []
        for (let hitbox of hitboxes.circular || []) {
            processedHitboxes.circular.push(new Circular(hitbox.s, hitbox.r, hitbox.options))
        }

        for (let hitbox of hitboxes.rotatable || []) {
            processedHitboxes.rotatable.push(new Rotatable(hitbox.anchorPoint, hitbox.allowedRotation, hitbox.hitboxes))
        }
        return processedHitboxes
    }
}