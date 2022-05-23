import {Json} from "../types";
import colors from "../../data/colors.json"
import charMap from "./mappings.json"
import "../proto.ts"
import {CanvasOptions, Renderer} from "../Renderer";
import {Envs} from "../envs";

interface DisplayCreationOptions extends CanvasOptions {
    numberOfCharacters: number,
    width: number,
    height: number
    characterGap: number,
    horizontalMargin: number
    verticalMargin: number
}

const defaultCreationOptions: DisplayCreationOptions = {
    numberOfCharacters: 30,
    width: 1920,
    height: 96,
    characterGap: 3,
    horizontalMargin: 3,
    verticalMargin: 1,
}

const ALL_LIT = "11111111111111111"

export default class SixteenSegmentDisplay extends Renderer {
    displacement: number = 0
    initialValues: [number, number, number, number][][] = []
    options: DisplayCreationOptions


    constructor(parentElementID: string, id: string, options: Partial<DisplayCreationOptions> = defaultCreationOptions) {
        for (let optionsKey in Object.keys(defaultCreationOptions)) {
            (options as Json<number>)[optionsKey] = (options as Json<number>)[optionsKey] || (defaultCreationOptions as Json<any>)[optionsKey]
        }
        let parsedOptions = options as DisplayCreationOptions
        super(parentElementID, id, parsedOptions)
        this.options = parsedOptions
        this.calculateRectangles()
    }

    calculateRectangles() {
        let w = this.options.width / (
            this.options.numberOfCharacters * 13 +
            (this.options.numberOfCharacters - 1) * this.options.characterGap +
            this.options.horizontalMargin * 2
        )
        let h = this.options.height / (19 + this.options.verticalMargin * 2 + 6)
        console.log(this.options)
        this.displacement = (13 + this.options.characterGap) * w
        this.initialValues = [
            [[w * this.options.horizontalMargin, h * (this.options.verticalMargin + 4), w, 8 * h]],
            [
                [w * (this.options.horizontalMargin + 1), h * (this.options.verticalMargin + 4), w, h],
                [w * (this.options.horizontalMargin + 2), h * (this.options.verticalMargin + 5), w, h * 2],
                [w * (this.options.horizontalMargin + 3), h * (this.options.verticalMargin + 7), w, h * 2],
                [w * (this.options.horizontalMargin + 4), h * (this.options.verticalMargin + 9), w, h * 2],
                [w * (this.options.horizontalMargin + 5), h * (this.options.verticalMargin + 11), w, h],
            ],
            [[w * (this.options.horizontalMargin + 1), h * (this.options.verticalMargin + 3), 5 * w, h]],
            [[w * (this.options.horizontalMargin + 6), h * (this.options.verticalMargin + 4), w, 8 * h]],
            [[w * (this.options.horizontalMargin + 7), h * (this.options.verticalMargin + 3), 5 * w, h]],
            [
                [w * (this.options.horizontalMargin + 11), h * (this.options.verticalMargin + 4), w, h],
                [w * (this.options.horizontalMargin + 10), h * (this.options.verticalMargin + 5), w, h * 2],
                [w * (this.options.horizontalMargin + 9), h * (this.options.verticalMargin + 7), w, h * 2],
                [w * (this.options.horizontalMargin + 8), h * (this.options.verticalMargin + 9), w, h * 2],
                [w * (this.options.horizontalMargin + 7), h * (this.options.verticalMargin + 11), w, h],
            ],
            [[w * (this.options.horizontalMargin + 12), h * (this.options.verticalMargin + 4), w, 8 * h]],
            [[w * (this.options.horizontalMargin + 1), h * (this.options.verticalMargin + 12), 5 * w, h]],
            [[w * this.options.horizontalMargin, h * (this.options.verticalMargin + 13), w, 8 * h]],
            [
                [w * (this.options.horizontalMargin + 5), h * (this.options.verticalMargin + 13), w, h],
                [w * (this.options.horizontalMargin + 4), h * (this.options.verticalMargin + 14), w, h * 2],
                [w * (this.options.horizontalMargin + 3), h * (this.options.verticalMargin + 16), w, h * 2],
                [w * (this.options.horizontalMargin + 2), h * (this.options.verticalMargin + 18), w, h * 2],
                [w * (this.options.horizontalMargin + 1), h * (this.options.verticalMargin + 20), w, h],
            ],
            [[w * (this.options.horizontalMargin + 1), h * (this.options.verticalMargin + 21), 5 * w, h]],
            [[w * (this.options.horizontalMargin + 6), h * (this.options.verticalMargin + 13), w, 8 * h]],
            [[w * (this.options.horizontalMargin + 7), h * (this.options.verticalMargin + 21), 5 * w, h]],
            [
                [w * (this.options.horizontalMargin + 7), h * (this.options.verticalMargin + 13), w, h],
                [w * (this.options.horizontalMargin + 8), h * (this.options.verticalMargin + 14), w, h * 2],
                [w * (this.options.horizontalMargin + 9), h * (this.options.verticalMargin + 16), w, h * 2],
                [w * (this.options.horizontalMargin + 10), h * (this.options.verticalMargin + 18), w, h * 2],
                [w * (this.options.horizontalMargin + 11), h * (this.options.verticalMargin + 20), w, h],
            ],
            [[w * (this.options.horizontalMargin + 12), h * (this.options.verticalMargin + 13), w, 8 * h]],
            [[w * (this.options.horizontalMargin + 7), h * (this.options.verticalMargin + 12), 5 * w, h]],
            [[w * (this.options.horizontalMargin + 5.5), h * (this.options.verticalMargin + 23), 2 * w, 2 *h]],
        ]
        console.log(this.initialValues)
    }

    renderText(text: string, shouldClear: boolean = false) {
        if (shouldClear) this.clearText()
        let ctx = this.htmlElement.getContext('2d')!
        ctx.fillStyle = colors.display.on
        let charArr = text.toLowerCase().split("")
        for (let i = 0; i < this.options.numberOfCharacters && i < charArr.length; i++) {
            let litSegments = ((charMap as Json<string>)[charArr[i]] || ALL_LIT).split("")
            for (let j = 0; j < 17; j++) {
                if (litSegments[j] == "1") {
                    for (let beamPart of this.initialValues[j]) {
                        ctx.fillRect(beamPart[0] + i * this.displacement, beamPart[1], beamPart[2], beamPart[3])
                    }
                }
            }
        }
    }

    clearText() {
        let ctx = this.htmlElement.getContext('2d')!
        ctx.fillStyle = "black"
        ctx.fillRect(0, 0, this.options.width, this.options.height)
        console.log(Envs.preferredDarkMode)
        ctx.fillStyle = Envs.preferredDarkMode ? "black" : colors.display.off
        for(let beam of this.initialValues) {
            for (let beamPart of beam) {
                for (let i = 0; i < this.options.numberOfCharacters; i++) {
                    ctx.fillRect(beamPart[0] + i * this.displacement, beamPart[1], beamPart[2], beamPart[3])
                }
            }
        }
    }
}