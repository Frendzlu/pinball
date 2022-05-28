export interface Keybind {
	id: number
	key: string

	alt: boolean
	ctrl: boolean
	meta: boolean
	shift: boolean

	associatedEvent: () => void
	repeatable: boolean

	onUp: () => void
}

export class KeyListener {
	keyBinds: Keybind[] = []
	currentEvent: {
		id: number
		interval?: number
	}
	currentId = 1

	constructor() {
		document.body.onkeydown = (e) => {this.narrowSearch(e)}
		this.currentEvent = {
			id: -1
		}
		document.body.onkeyup = () => {
			if (this.currentEvent.interval) clearInterval(this.currentEvent.interval)
			let current = this.keyBinds.find(bind => bind.id == this.currentEvent.id)
			if (current) current.onUp()
			this.currentEvent.id = -1
			this.currentEvent.interval = undefined
		}
	}

	narrowSearch(e: KeyboardEvent) {
		//console.log(e.key, e.metaKey, e.altKey, e.ctrlKey, e.shiftKey)
		let found = this.keyBinds.find(bind =>
			bind.key == e.key &&
			bind.meta == e.metaKey &&
			bind.alt == e.altKey &&
			bind.ctrl == e.ctrlKey &&
			bind.shift == e.shiftKey
		)
		if (found) {
			if (this.currentEvent.id != found.id) {
				found.associatedEvent()
				this.currentEvent.id = found.id
			}
			if (found.repeatable && this.currentEvent.interval == undefined) {
				this.currentEvent.interval = setInterval(() => {
					found!.associatedEvent()
				}, 1)
			}
		}
	}

	add(path: string, e?: () => void, repeat: boolean = false, onKeyUp?: () => void) {
		let generalMatch = path.toLowerCase().match(/^((?:shift|alt|ctrl|meta|\+|\s)*)(.*)$/i)
		e = e || (() => console.log(`You have pressed key: ${path}`))
		onKeyUp = onKeyUp || (() => console.log(`You have unpressed key: ${path}`))
		if (!generalMatch) {
			console.error("Failed to register key:", path)
			return
		}
		let actionKeys = generalMatch[1].match(/shift|alt|ctrl|meta/ig)
		this.keyBinds.push({
			id: this.currentId,
			key: generalMatch[2],
			alt: actionKeys ? actionKeys.includes("alt") : false,
			ctrl: actionKeys ? actionKeys.includes("ctrl") : false,
			meta: actionKeys ? actionKeys.includes("meta") : false,
			shift: actionKeys ? actionKeys.includes("shift") : false,

			associatedEvent: e,
			repeatable: repeat,
			onUp: onKeyUp
		})
		this.currentId += 1
	}
}