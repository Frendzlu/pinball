import {Geometry} from "./Geometry";
import {CollisionConditions} from "./Collisions";

export namespace Hitbox {
    import Point = Geometry.Point;

    export interface Map {
        circular: Circular[],
        linear: Linear[],
        rotatable: Rotatable[]
    }

    export interface Definition {
        defaultDims: {
            x: number,
            y: number
        },
        hitboxes: Map
    }

    export type Options = {
        eventHandle?: string,
        shouldBounce?: boolean
    }

    const defaultHitboxOptions: Options = {
        shouldBounce: true
    }

    export class EmptyDefinition implements Definition {
        defaultDims: { x: number; y: number };
        hitboxes: Hitbox.Map;

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
        options: Options

        constructor(p: Geometry.Point, r: number, options: Options = defaultHitboxOptions) {
            this.maxRange = {
                x: [p.x + r, p.x - r].sort((a, b) => a - b) as [number, number],
                y: [p.y + r, p.y - r].sort((a, b) => a - b) as [number, number]
            }
            this.s = p
            this.r = r
            this.options = options
            if (this.options.shouldBounce === undefined) this.options.shouldBounce = true
        }
    }

    export class Linear {
        line: Segment
        condition: CollisionConditions
        options: Options

        constructor(p1: Geometry.Point, p2: Geometry.Point, condition: CollisionConditions, options: Options = defaultHitboxOptions) {
            this.line = new Segment(p1, p2)
            this.condition = condition
            this.options = options
        }
    }

    type MapJsonConstruct = {
        linear?: {
            a: Point
            b: Point
            condition: CollisionConditions
            options?: Options
        }[]
        circular?: {
            s: Point
            r: number
            options?: Options
        }[]
        rotatable?: {
            anchorPoint: Geometry.Point,
            allowedRotation: number,
            hitboxes: MapJsonConstruct
        } []
    }

    export class Rotatable {
        anchorPoint: Geometry.Point
        allowedRotation: number
        hitboxes: Map

        constructor(p: Geometry.Point, rotation: number, hitboxes: MapJsonConstruct) {
            this.anchorPoint = p
            this.allowedRotation = rotation
            this.hitboxes = process(hitboxes)
        }
    }

    export function process (hitboxes: MapJsonConstruct) {
        let processedHitboxes: Map = new EmptyDefinition().hitboxes
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