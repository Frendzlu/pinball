export {}


interface IElementCreationOptions extends ElementCreationOptions {
    className?: string
    id?: string
    style?: Partial<CSSStyleDeclaration>

    innerHTML?: string
    innerText?: string

    is?: string
}

declare global{
    interface Document {
        createElement<K extends keyof HTMLElementTagNameMap>(tagName: K, options?: IElementCreationOptions | undefined): HTMLElementTagNameMap[K]
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
        return el
    }
}(document.createElement)