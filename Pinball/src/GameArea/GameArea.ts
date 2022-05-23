import {CanvasOptions, Renderer} from "../Renderer";
import hitboxDefinitions from "./hitboxes.json"
import {Hitbox} from "../Hitbox";

export class GameArea extends Renderer {
    hitboxes: Hitbox
    constructor(parentElementID: string, id: string, options: CanvasOptions) {
        super(parentElementID, id, options);
    }
}