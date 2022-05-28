import {Json} from "./types";

export {}

interface IElementCreationOptions extends ElementCreationOptions {
    className?: string
    id?: string
    style?: Partial<CSSStyleDeclaration>
    width?: number,
    height?: number
    innerHTML?: string
    innerText?: string

    is?: string
}

declare global{
    interface Document {
        createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: IElementCreationOptions | undefined): HTMLElementTagNameMap[K]
    }

    interface HTMLElement {
        appendTo(element: HTMLElement): this
    }

    interface Object {
        copy<K extends Object>(x: K) : K
    }
}

document.createElement = function (original: <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: ElementCreationOptions | undefined) => HTMLElementTagNameMap[K]) {
    //console.log(original)
    return function <K extends keyof HTMLElementTagNameMap>(tagName: K, options?: IElementCreationOptions | undefined) {
        let el = original.call(document, tagName) as HTMLElementTagNameMap[K]
        if (options) {
            for (const [key, value] of Object.entries(options)) {
                //console.log(key, value, !!value)
                if (key == "style") {
                    for (const [cssPropertyName, cssPropertyValue] of Object.entries(value as Partial<CSSStyleDeclaration>)) {
                        (el.style as {[key: string]: any})[cssPropertyName] = cssPropertyValue
                        //console.log(cssPropertyName, cssPropertyValue)
                    }
                } else if (value) {
                    (el as {[key: string]: any})[key as string] = value
                }
            }
        }
        el.appendTo = function (element: HTMLElement): HTMLElementTagNameMap[K] {
            element.append(el)
            return el
        }
        return el
    }
}(document.createElement)

Object.prototype.copy = function<K extends Object>(toBeCopied: K) {
    let state: Json<any> = JSON.parse(JSON.stringify(toBeCopied))
    let functions: Json<any> = {}
    let currentPrototype = toBeCopied
    do {
        let existingPropNames = Object.keys(functions)
        Object.getOwnPropertyNames(currentPrototype).forEach(propName => {
            let debatedProperty = (currentPrototype as Json<any>)[propName]
            if (!existingPropNames.includes(propName) && typeof debatedProperty == 'function') {
                functions[propName] = debatedProperty
            }
        })
    } while (currentPrototype = Object.getPrototypeOf(currentPrototype));
    Object.entries(functions).forEach(entry => {
        state[entry[0]] = entry[1]
    })
    return state as K
}
export {}