type Events = {
	outOfBounds: (() => any)[]
} & {[key: string]: (() => any)[]}

export let Events: Events = {
	outOfBounds: []
}