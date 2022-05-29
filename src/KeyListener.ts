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

interface CurrentEvent {
	id: number
	key: string
	onUp: () => void
	interval?: number
}

export class KeyListener {
	keyBinds: Keybind[] = []
	currentEvents: CurrentEvent[]
	currentId = 1

	constructor() {
		document.body.onkeydown = (e) => {this.narrowSearch(e)}
		this.currentEvents = []
		document.body.onkeyup = (e) => {
			//console.log(this.currentEvents)
			let related = this.currentEvents.find(event => event.key.toLowerCase() == e.key.toLowerCase())
			//console.log(related)
			if (related) {
				related.onUp()
				if (related.interval) clearInterval(related.interval)
				this.currentEvents.splice(this.currentEvents.indexOf(related!), 1)
			}
			this.currentEvents.indexOf(related!)
		}
	}

	narrowSearch(e: KeyboardEvent) {
		//console.log(e.key, e.metaKey, e.altKey, e.ctrlKey, e.shiftKey)
		let found = this.keyBinds.find(bind =>
			bind.key.toLowerCase() == e.key.toLowerCase() &&
			bind.meta == e.metaKey &&
			bind.alt == e.altKey &&
			bind.ctrl == e.ctrlKey &&
			bind.shift == e.shiftKey
		)
		if (found) {
			let searched = this.currentEvents.find(event => event.id == found!.id)
			let toPush: CurrentEvent = {
				id: -1,
				key: "sus",
				onUp: () => {console.log("amogus")}
			}
			if (!searched) {
				//console.log("First time", e.key)
				found.associatedEvent()
				toPush.key = e.key
				toPush.id = found.id
				toPush.onUp = found.onUp
				if (found.repeatable) {
					toPush.interval = setInterval(() => {
						found!.associatedEvent()
					}, 10)
				}

			}
			if (toPush.id != -1) this.currentEvents.push(toPush)
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
			key: generalMatch[2] || " ",
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