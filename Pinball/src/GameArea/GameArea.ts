import {CanvasOptions, Renderer} from "../Renderer";
import hitboxDefinitions from "./hitboxes.json"
import {Hitbox} from "../Hitbox";
import colors from "../../data/colors.json";

const defaultOptions: CanvasOptions = {
    width: 1920,
    height: 2900
}

export class GameArea extends Renderer {
    hitboxDefinition: Hitbox.Definition
    isDebugOn = false

    constructor(parentElementID: string, id: string, options: CanvasOptions = defaultOptions) {
        super(parentElementID, id, options);

        this.hitboxDefinition = new Hitbox.EmptyDefinition()
        this.hitboxDefinition.defaultDims = hitboxDefinitions.defaultDims
        this.hitboxDefinition.hitboxes = Hitbox.processHitboxes(hitboxDefinitions.hitboxes)
        console.log(this.hitboxDefinition)
    }

    async render() {
        let ctx = this.htmlElement.getContext('2d')!
        let image = document.getElementById("mainImg") as HTMLImageElement
        if (this.isDebugOn) {
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
        if (this.isDebugOn) {
            this.drawHitboxes(this.hitboxDefinition.hitboxes)
        }
    }

    drawHitboxes(hitboxes: Hitbox.HitboxMap, keepColor = false) {
        let ctx = this.htmlElement.getContext('2d')!
        ctx.lineWidth = 3
        for (let hitbox of hitboxes.linear){
            ctx.beginPath()
            if (!keepColor) ctx.strokeStyle = colors.hitbox.linear
            ctx.moveTo(hitbox.line.A.x, hitbox.line.A.y)
            ctx.lineTo(hitbox.line.B.x, hitbox.line.B.y)
            ctx.stroke()
        }
        for (let hitbox of hitboxes.circular){
            ctx.beginPath()
            if (!keepColor) ctx.strokeStyle = colors.hitbox.circular
            ctx.arc(hitbox.s.x, hitbox.s.y, hitbox.r, 0, 2 * Math.PI)
            ctx.stroke()
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
}