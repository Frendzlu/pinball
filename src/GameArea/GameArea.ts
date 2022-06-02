import {CanvasOptions, Renderer} from "../Renderer";
import hitboxDefinitions from "./hitboxes.json"
import {Hitbox} from "../Hitbox";
import colors from "../../data/colors.json";
import {Envs} from "../envs";
import {Ball} from "../Ball";
import {Geometry} from "../Geometry";

export const defaultOptions: CanvasOptions = {
    width: 1920,
    height: 2900
}

export class GameArea extends Renderer {
    hitboxDefinition: Hitbox.Definition
    options: CanvasOptions
    ball: Ball
    scheduledEvents: {[key: string]: ()=>void }

    constructor(parentElementID: string, id: string, options: CanvasOptions = defaultOptions, ball: Ball) {
        super(parentElementID, id, options);
        this.options = options
        this.hitboxDefinition = new Hitbox.EmptyDefinition()
        this.hitboxDefinition.defaultDims = hitboxDefinitions.defaultDims
        this.hitboxDefinition.hitboxes = Hitbox.process(hitboxDefinitions.hitboxes)
        this.scheduledEvents = {}
        this.ball = ball

        this.render()
        setInterval(() => {
            this.render()
        }, Envs.drawingTimeout)
    }

    getNamedHitbox(name: string) {
        return this.hitboxDefinition.hitboxes.rotatable.find(hitbox => hitbox.name == name)
    }

    render() {
        let ctx = this.htmlElement.getContext('2d')!
        let image = document.getElementById("mainImg") as HTMLImageElement
        if (Envs.debugMode) {
            ctx.globalCompositeOperation = "source-over"; // in case not set
            ctx.drawImage(image,0,0);
            ctx.globalCompositeOperation = "multiply"
            ctx.fillStyle = "rgb(64,64,64)";  // dest pixels will darken by
                                                 // (128/255) * dest
            ctx.fillRect(0,0,image.width,image.height)
            ctx.globalCompositeOperation = "destination-in";
            ctx.drawImage(image,0,0);
            ctx.globalCompositeOperation = "source-over"
        } else ctx.drawImage(image, 0, 0)
        let ballImage = document.getElementById("ball") as HTMLImageElement
        let hbox = this.ball.hitbox
        let range = hbox.maxRange
        ctx.drawImage(ballImage, range.x[0], range.y[0])
        if (Envs.debugMode) {
            this.drawHitboxes(this.hitboxDefinition.hitboxes)
            ctx.arc(this.ball.hitbox.s.x, this.ball.hitbox.s.y, this.ball.hitbox.r, 0, 2 * Math.PI)
            ctx.moveTo(this.ball.hitbox.s.x, this.ball.hitbox.s.y)
            let v = Geometry.Vector.from(this.ball.speed, this.ball.angle, this.ball.hitbox.s)
            ctx.lineTo(this.ball.hitbox.s.x + v.x * Envs.vectorLengthMod, this.ball.hitbox.s.y + v.y * Envs.vectorLengthMod)
            ctx.stroke()
            ctx.beginPath()
            ctx.strokeStyle = "rgb(240, 140, 140)"
            ctx.moveTo(this.ball.hitbox.maxRange.x[0], this.ball.hitbox.maxRange.y[0])
            ctx.lineTo(this.ball.hitbox.maxRange.x[1], this.ball.hitbox.maxRange.y[0])
            ctx.lineTo(this.ball.hitbox.maxRange.x[1], this.ball.hitbox.maxRange.y[1])
            ctx.lineTo(this.ball.hitbox.maxRange.x[0], this.ball.hitbox.maxRange.y[1])
            ctx.lineTo(this.ball.hitbox.maxRange.x[0], this.ball.hitbox.maxRange.y[0])
            ctx.stroke()
        }
        for (let fn of Object.values(this.scheduledEvents)) {
            fn()
        }
    }

    drawHitboxes(hitboxes: Hitbox.Map, keepColor = false) {
        let ctx = this.htmlElement.getContext('2d')!
        ctx.lineWidth = 3
        for (let hitbox of hitboxes.linear){
            ctx.beginPath()
            if (!keepColor) ctx.strokeStyle = colors.hitbox.linear
            ctx.moveTo(hitbox.line.A.x, hitbox.line.A.y)
            ctx.lineTo(hitbox.line.B.x, hitbox.line.B.y)
            ctx.stroke()
            if (Envs.showBounceChecks) {
                this.drawBounceChecks(hitbox)
            }
            ctx.beginPath()
            if (hitbox.options.eventHandle) {
                ctx.fillStyle = "red";
                ctx.font = "bold 16px Arial";
                let avgX = (hitbox.line.xRange[0] + hitbox.line.xRange[1]) / 2
                let x = avgX > this.options.width/2 ? avgX - 9 * hitbox.options.eventHandle.length : avgX + 25
                let y = (hitbox.line.yRange[0] + hitbox.line.yRange[1]) / 2
                ctx.fillText(hitbox.options.eventHandle, x, y);
            }
        }
        for (let hitbox of hitboxes.circular){
            ctx.beginPath()
            if (!keepColor) ctx.strokeStyle = colors.hitbox.circular
            ctx.arc(hitbox.s.x, hitbox.s.y, hitbox.r, 0, 2 * Math.PI)
            ctx.stroke()
            if (hitbox.options.eventHandle) {
                ctx.fillStyle = "red";
                ctx.font = "bold 16px Arial";
                let x = hitbox.s.x + 400 > this.options.width ? hitbox.s.x - (hitbox.r + 10 + 12.5 * hitbox.options.eventHandle.length) : hitbox.s.x + hitbox.r + 10
                ctx.fillText(hitbox.options.eventHandle, x, hitbox.s.y);
            }
        }
        ctx.beginPath()
        ctx.fillStyle = colors.hitbox.anchor
        for (let hitbox of hitboxes.rotatable){
            ctx.arc(hitbox.anchorPoint.x, hitbox.anchorPoint.y, 10, 0, 2 * Math.PI);
            ctx.fill()
            if (!keepColor) ctx.strokeStyle = colors.hitbox.rotatable
            this.drawHitboxes(hitbox.hitboxes, true)
        }
        ctx.stroke()
    }

    drawHitboxRanges(hitboxes: (Hitbox.Circular | Hitbox.Linear)[]) {
        let ctx = this.htmlElement.getContext('2d')!
        for (let hitbox of hitboxes) {
            ctx.beginPath()
            ctx.strokeStyle = "rgb(255, 23, 255)"
            let yr: [number, number] = [0, 0]
            let xr: [number, number] = [0, 0]
            if (hitbox instanceof Hitbox.Circular) {
                yr = hitbox.maxRange.y
                xr = hitbox.maxRange.x
            } else {
                yr = hitbox.line.yRange
                xr = hitbox.line.xRange
            }
            //console.log(xr, yr)
            ctx.moveTo(xr[0], yr[0])
            ctx.lineTo(xr[1], yr[0])
            ctx.lineTo(xr[1], yr[1])
            ctx.lineTo(xr[0], yr[1])
            ctx.lineTo(xr[0], yr[0])
            ctx.stroke()
        }
    }

    private drawBounceChecks(hitbox: Hitbox.Linear) {
        let ctx = this.htmlElement.getContext('2d')!
        ctx.lineWidth = 1
        let vs = hitbox.condition == 0 ? -3 : hitbox.condition == 2 ? 3 : 0
        let hs = hitbox.condition == 1 ? 3 : hitbox.condition == 3 ? -3 : 0
        ctx.fillStyle = "#1d4d7d"
        ctx.moveTo(hitbox.line.A.x + hs, hitbox.line.A.y + vs)
        ctx.lineTo(hitbox.line.B.x + hs, hitbox.line.B.y + vs)
        ctx.lineTo(hitbox.line.B.x + hs + 5 * hs, hitbox.line.B.y + vs + 5 * vs)
        ctx.lineTo(hitbox.line.A.x + hs + 5 * hs, hitbox.line.A.y + vs + 5 * vs)
        ctx.lineTo(hitbox.line.A.x + hs, hitbox.line.A.y + vs)
        ctx.closePath();
        ctx.fill();
        ctx.lineWidth = 3
    }
}