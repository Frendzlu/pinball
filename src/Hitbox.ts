import {Geometry} from "./Geometry";
import {CollisionConditions} from "./Collisions";

export namespace Hitbox {
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
            a: Geometry.IPoint
            b: Geometry.IPoint
            condition: CollisionConditions
            options?: Options
        }[]
        circular?: {
            s: Geometry.IPoint
            r: number
            options?: Options
        }[]
        rotatable?: {
            anchorPoint: Geometry.IPoint,
            allowedRotation: number,
            hitboxes: MapJsonConstruct,
            name: string
        } []
    }

    export class Rotatable {
        anchorPoint: Geometry.Point
        allowedRotation: number
        currentRotation: number = 0
        minimalRotation: number = 0
        hitboxes: Map
        name: string = ""
        initialHitboxes: MapJsonConstruct

        constructor(p: Geometry.Point, rotation: number, hitboxes: MapJsonConstruct, name: string) {
            this.anchorPoint = p
            this.allowedRotation = rotation
            this.name = name
            this.hitboxes = process(hitboxes)
            this.initialHitboxes = hitboxes
        }

        rotate(degrees: number) {
            let hitboxes = process(this.initialHitboxes)
            //console.log(this.currentRotation, this.allowedRotation)
            this.currentRotation += degrees
            if (Math.abs(this.currentRotation) > Math.abs(this.allowedRotation)) this.currentRotation = this.allowedRotation
            for (let hitbox of hitboxes.linear) {
                hitbox.line = new Hitbox.Segment(hitbox.line.A.rotateAlong(this.currentRotation, this.anchorPoint), hitbox.line.B.rotateAlong(this.currentRotation, this.anchorPoint))
            }
            for (let hitbox of hitboxes.circular) {
                hitbox.s = hitbox.s.rotateAlong(this.currentRotation, this.anchorPoint)
            }
            //@to-do: implement rotatable
            //console.group("Invocation info")
            //console.log("Angle:", degrees)
            //console.log("Current rotation:", this.currentRotation)
            //console.groupEnd()
            this.hitboxes = hitboxes
        }
    }

    export function process (hitboxes: MapJsonConstruct) {
        let processedHitboxes: Map = new EmptyDefinition().hitboxes
        for (let hitbox of hitboxes.linear || []) {
            processedHitboxes.linear.push(new Linear(new Geometry.Point(hitbox.a), new Geometry.Point(hitbox.b), hitbox.condition, hitbox.options))
        }

        processedHitboxes.circular = []
        for (let hitbox of hitboxes.circular || []) {
            processedHitboxes.circular.push(new Circular(new Geometry.Point(hitbox.s), hitbox.r, hitbox.options))
        }

        for (let hitbox of hitboxes.rotatable || []) {
            processedHitboxes.rotatable.push(new Rotatable(new Geometry.Point(hitbox.anchorPoint), hitbox.allowedRotation, hitbox.hitboxes, hitbox.name))
        }
        return processedHitboxes
    }
}