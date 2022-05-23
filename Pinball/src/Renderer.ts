import {Json} from "./types";

export interface CanvasOptions extends Json<number> {
    width: number,
    height: number
}

export interface Renderer {
    constructor(parentElementID: string, id: string, options: CanvasOptions): this
}

export class Renderer implements Renderer {
    parentElement: HTMLDivElement
    htmlElement: HTMLCanvasElement

    constructor(parentElementID: string, id: string, options: CanvasOptions, bgColor: string = "black") {
        this.parentElement = (document.getElementById(parentElementID) as HTMLDivElement) || document.createElement("div", {
            id: parentElementID
        }).appendTo(document.body)
        this.htmlElement = document.createElement("canvas",{
            id: id,
            width: options.width,
            height: options.height
        }).appendTo(this.parentElement)
        let ctx = this.htmlElement.getContext('2d')!
        ctx.fillStyle = bgColor
        ctx.fillRect(0, 0, options.width, options.height)
    }
}