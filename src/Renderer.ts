import {Json} from "./types";

export interface CanvasOptions extends Json<number> {
    width: number,
    height: number
}

export class Renderer {
    parentElement: HTMLDivElement
    htmlElement: HTMLCanvasElement
    ctx: CanvasRenderingContext2D

    constructor(parentElementID: string, id: string, options: CanvasOptions, bgColor: string = "black") {
        this.parentElement = (document.getElementById(parentElementID) as HTMLDivElement) || document.createElement("div", {
            id: parentElementID
        }).appendTo(document.body)
        this.htmlElement = document.createElement("canvas",{
            id: id,
            width: options.width,
            height: options.height
        }).appendTo(this.parentElement)
        this.ctx = this.htmlElement.getContext('2d')!
        this.ctx.fillStyle = bgColor
        this.ctx.lineWidth = 3
        this.ctx.fillRect(0, 0, options.width, options.height)
    }
}