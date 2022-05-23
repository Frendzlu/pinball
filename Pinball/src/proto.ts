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