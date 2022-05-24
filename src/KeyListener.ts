export interface Keybind {
	id: number
	key: string

	alt: boolean
	ctrl: boolean
	meta: boolean
	shift: boolean

	associatedEvent: () => void
	repeatable: false | {
		interval: number
	}
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
			this.currentEvent.id = -1
			this.currentEvent.interval = undefined
		}
	}

	narrowSearch(e: KeyboardEvent) {
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
			if (found.repeatable) {
				this.currentEvent.interval = setInterval(() => {
					found!.associatedEvent()
				}, found.repeatable.interval)
			}
		}
	}

	add(path: string, e: () => void, repeat: boolean | number = false) {
		let generalMatch = path.toLowerCase().match(/^((?:shift|alt|ctrl|meta|\+|\s)*)(.*)$/i)
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
			repeatable: repeat ? {
				interval: repeat as number
			} : false
		})
	}
}