namespace Ui
{
	export class PointerEvent extends Event
	{
		pointer: Pointer = undefined;
		clientX: number = 0;
		clientY: number = 0;
		pointerType: string = 'mouse';

		constructor(type: string, pointer: Pointer) {
			super();
			this.setType(type);
			this.pointer = pointer;
			this.clientX = this.pointer.getX();
			this.clientY = this.pointer.getY();
			this.pointerType = this.pointer.getType();
		}
	}
	
	export class PointerWatcher extends Core.Object
	{
		element: Element;
		pointer: Pointer;

		constructor(element: Element, pointer: Pointer) {
			super();
			this.addEvents('down', 'move', 'up', 'cancel');
			this.element = element;
			this.pointer = pointer;
		}

		getAbsoluteDelta() {
			let initial = { x: this.pointer.getInitialX(), y: this.pointer.getInitialY() };
			let current = { x: this.pointer.getX(), y: this.pointer.getY() };
			return { x: current.x - initial.x, y: current.y - initial.y };
		}

		getDelta() {
			let initial = new Point(this.pointer.getInitialX(), this.pointer.getInitialY());
			let current = new Point(this.pointer.getX(), this.pointer.getY());
			initial = this.element.pointFromWindow(initial);
			current = this.element.pointFromWindow(current);
			return { x: current.x - initial.x, y: current.y - initial.y };
		}

		getPosition() {
			let current = new Point(this.pointer.getX(), this.pointer.getY());
			return this.element.pointFromWindow(current);
		}

		getIsInside() {
			let pos = this.getPosition();
			if ((pos.x >= 0) && (pos.x <= this.element.layoutWidth) &&
				(pos.y >= 0) && (pos.y <= this.element.layoutHeight))
				return true;
			return false;
		}

		getDirection() {
			let delta = this.getDelta();
			if (Math.abs(delta.x) > Math.abs(delta.y)) {
				if (delta.x < 0)
					return 'left';
				else
					return 'right';
			}
			else {
				if (delta.y < 0)
					return 'top';
				else
					return 'bottom';
			}
		}

		getSpeed() {
			if ((this.pointer === undefined) || (this.pointer.history.length < 2))
				return { x: 0, y: 0 };
			else {
				let measure;
				let i = this.pointer.history.length;
				let now = { time: (new Date().getTime()) / 1000, x: this.pointer.x, y: this.pointer.y };
				do {
					measure = this.pointer.history[--i];
				}
				while ((i > 0) && ((now.time - measure.time) < 0.08));
				let deltaTime = now.time - measure.time;
				return {
					x: (now.x - measure.x) / deltaTime,
					y: (now.y - measure.y) / deltaTime
				};
			}
		}

		getIsCaptured() {
			return (this.pointer !== undefined) && (this.pointer.captureWatcher === this);
		}

		//
		// Ask for exclusive watching on this pointer
		//
		capture() {
			this.pointer.capture(this);
		}

		release() {
			this.pointer.release(this);
		}
	
		cancel() {
			if (this.pointer != undefined) {
				this.fireEvent('cancel', this);
				this.pointer.unwatch(this);
				// no more events must happened, ensure the watcher
				// will no more be used
				this.pointer = undefined;
			}
		}

		down() {
			if (this.pointer != undefined)
				this.fireEvent('down', this);
		}

		move() {
			if (this.pointer != undefined)
				this.fireEvent('move', this);
		}

		up() {
			if (this.pointer != undefined)
				this.fireEvent('up', this);
		}

		//
		// We are no more interested in watchin this pointer
		//
		unwatch() {
			if (this.pointer != undefined)
				this.pointer.unwatch(this);
		}
	}

	export class Pointer extends Core.Object
	{
		id: number = undefined;
		x: number = 0;
		y: number = 0;
		initialX: number = 0;
		initialY: number = 0;
		altKey: boolean = false;
		ctrlKey: boolean = false;
		shiftKey: boolean = false;
		type: string = undefined;
		start: number = undefined;
		cumulMove: number = 0;
		chainLevel: number = 0;
		watchers: PointerWatcher[] = undefined;
		captureWatcher: PointerWatcher = undefined;
		history: any = undefined;
		buttons: number = 0;

		constructor(type: string, id: number) {
			super();
			this.addEvents('ptrmove', 'ptrup', 'ptrcancel');

			this.type = type;
			this.id = id;
			this.start = (new Date().getTime()) / 1000;
			this.watchers = [];
			this.history = [];
		}
	
		capture(watcher) {
			let watchers = this.watchers.slice();
			for (let i = 0; i < watchers.length; i++) {
				if (watchers[i] !== watcher)
					watchers[i].cancel();
			}
			this.captureWatcher = watcher;
		}

		release(watcher) {
			this.captureWatcher = undefined;
		}

		getType() {
			return this.type;
		}

		getIsDown() {
			return this.buttons !== 0;
		}

		getIsCaptured() {
			return (this.captureWatcher !== undefined);
		}

		getX() {
			return this.x;
		}

		getY() {
			return this.y;
		}

		getInitialX() {
			return this.initialX;
		}

		getInitialY() {
			return this.initialY;
		}

		setInitialPosition(x, y) {
			this.initialX = x;
			this.initialY = y;
		}

		getButtons() {
			return this.buttons;
		}

		setButtons(buttons) {
			this.buttons = buttons;
		}
	
		getChainLevel() {
			return this.chainLevel;
		}

		getAltKey() {
			return this.altKey;
		}

		setAltKey(altKey) {
			this.altKey = altKey;
		}

		getCtrlKey() {
			return this.ctrlKey;
		}

		setCtrlKey(ctrlKey) {
			this.ctrlKey = ctrlKey;
		}

		getShiftKey() {
			return this.shiftKey;
		}

		setShiftKey(shiftKey) {
			this.shiftKey = shiftKey;
		}

		setControls(altKey, ctrlKey, shiftKey) {
			this.altKey = altKey;
			this.ctrlKey = ctrlKey;
			this.shiftKey = shiftKey;
		}

		move(x: number, y: number) {
			if (x === undefined)
				x = this.x;
			if (y === undefined)
				y = this.y;
		
			if ((this.x !== x) || (this.y !== y)) {
				// update the cumulated move
				let deltaX = this.x - x;
				let deltaY = this.y - y;
				this.cumulMove += Math.sqrt(deltaX * deltaX + deltaY * deltaY);

				this.x = x;
				this.y = y;

				let time = (new Date().getTime()) / 1000;
				this.history.push({ time: time, x: this.x, y: this.y });
				while ((this.history.length > 2) && (time - this.history[0].time > Ui.Pointer.HISTORY_TIMELAPS)) {
					this.history.shift();
				}
			}

			let watchers = this.watchers.slice();
			for (let i = 0; i < watchers.length; i++)
				watchers[i].move();
			
			if (this.captureWatcher === undefined) {
				let target = App.current.elementFromPoint(new Point(this.x, this.y));
				if (target != undefined) {
					let pointerEvent = new PointerEvent('ptrmove', this);
					this.fireEvent('ptrmove', pointerEvent);
					pointerEvent.dispatchEvent(target);
				}
			}
		}

		getIsHold() {
			return (((new Date().getTime()) / 1000) - this.start) >= Ui.Pointer.HOLD_DELAY;
		}

		getDelta() {
			let deltaX = this.x - this.initialX;
			let deltaY = this.y - this.initialY;
			return Math.sqrt(deltaX * deltaX + deltaY * deltaY);
		}

		getCumulMove() {
			return this.cumulMove;
		}

		getIsMove() {
			return this.cumulMove >= Pointer.MOVE_DELTA;
		}

		down(x: number, y: number, buttons) {
			this.start = (new Date().getTime()) / 1000;

			this.x = x;
			this.initialX = x;

			this.y = y;
			this.initialY = y;

			this.history = [];
			this.history.push({ time: this.start, x: this.initialX, y: this.initialY });

			this.buttons = buttons;
			this.cumulMove = 0;

			let watchers = this.watchers.slice();
			for (let i = 0; i < watchers.length; i++)
				watchers[i].down();

			let target = App.current.elementFromPoint(new Point(this.x, this.y));
			if (target !== undefined) {
				let pointerEvent = new Ui.PointerEvent('ptrdown', this);
				pointerEvent.dispatchEvent(target);
			}
		}

		up() {
			let watchers = this.watchers.slice();
			for (let i = 0; i < watchers.length; i++)
				watchers[i].up();
			if (this.type == 'touch')
				this.watchers = [];
			this.buttons = 0;

			if (this.captureWatcher === undefined) {
				let target = App.current.elementFromPoint(new Point(this.x, this.y));
				if (target != undefined) {
					let pointerEvent = new PointerEvent('ptrup', this);
					this.fireEvent('ptrup', pointerEvent);
					pointerEvent.dispatchEvent(target);
				}
			}
			this.captureWatcher = undefined;
		}

		watch(element) {
			let watcher = new Ui.PointerWatcher(element, this);
			this.watchers.push(watcher);
			return watcher;
		}

		unwatch(watcher) {
			for (let i = 0; i < this.watchers.length; i++) {
				if (this.watchers[i] === watcher) {
					this.watchers.splice(i, 1);
					break;
				}
			}
		}

		static HOLD_DELAY: number = 0.75;
		static MOVE_DELTA: number = 15;
		static HISTORY_TIMELAPS: number = 0.5
	}

	export class PointerManager extends Core.Object
	{
		touches: any = undefined;
		lastUpdate: any = undefined;
		lastTouchX: number = -1;
		lastTouchY: number = -1;
		lastDownTouchX: number = -1;
		lastDownTouchY: number = -1;
		mouse: any = undefined;
		app: App;
		pointers: Core.HashTable<Pointer> = {};

		constructor(app: App) {
			super();
			this.app = app;

			if ('PointerEvent' in window) {
				this.connect(window, 'pointerdown', this.onPointerDown);
				this.connect(window, 'pointermove', this.onPointerMove);
				this.connect(window, 'pointerup', this.onPointerUp);
				this.connect(window, 'pointercancel', this.onPointerCancel);
			}
			else {
				this.mouse = new Ui.Pointer('mouse', 0);

				this.connect(window, 'mousedown', this.onMouseDown);
				this.connect(window, 'mousemove', this.onMouseMove);
				this.connect(window, 'mouseup', this.onMouseUp);
				//			this.connect(document, 'select', function(event) {
				//				console.log('select '+event.target+' START '+this.mouse.getIsCaptured());
				//			});
				this.connect(document, 'selectstart', this.onSelectStart);
				//			this.connect(document, 'dragstart', function(event) {
				//				console.log('ondragstart');
				//				if(this.mouse !== undefined)
				//					this.mouse.capture(undefined);
				//			}, true);

				this.connect(window, 'keydown', function (event) {
					// if Ctrl, Alt or Shift change signal to the mouse
					if ((event.which === 16) || (event.which === 17) || (event.which === 18)) {
						this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);
						this.mouse.move();
					}
				});
				this.connect(window, 'keyup', function (event) {
					// if Ctrl, Alt or Shift change signal to the mouse
					if ((event.which === 16) || (event.which === 17) || (event.which === 18)) {
						this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);
						this.mouse.move();
					}
				});

				this.connect(document, 'contextmenu', function (event) {
					if (this.mouse !== undefined) {
						this.mouse.capture(undefined);
						this.mouse.up();
					}
				});

				this.connect(document.body, 'touchstart', this.updateTouches, true);
				this.connect(document.body, 'touchmove', this.updateTouches, true);
				this.connect(document.body, 'touchend', this.updateTouches, true);
				this.connect(document.body, 'touchcancel', this.updateTouches, true);

				//			this.connect(document.body, 'touchcancel', function() {	console.log('touchcancel');	});
			}
		}

		onSelectStart(event) {
			//console.log('selectstart '+event.target+' START '+this.mouse.getIsCaptured());
			if (this.mouse.getIsCaptured()) {
				event.preventDefault();
				return;
			}

			let selectable = false;
			let current = event.target;
			while (current != undefined) {
				if (current.selectable === true) {
					selectable = true;
					break;
				}
				current = current.parentNode;
			}
			if (!selectable)
				event.preventDefault();
			else if (this.mouse !== undefined)
				this.mouse.capture(undefined);
		}

		onMouseDown(event) {
			// avoid emulated mouse event after touch events
			let deltaTime = (((new Date().getTime()) / 1000) - this.lastUpdate);
			let deltaX = (this.lastTouchX - event.clientX);
			let deltaY = (this.lastTouchY - event.clientY);
			let deltaPos = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			// check the delta position with the lastest touchstart event
			// because iOS8 generate mouse event using the start coordinates
			// and generate mouse event even after a long move
			let downDeltaX = this.lastDownTouchX - event.clientX;
			let downDeltaY = this.lastDownTouchY - event.clientY;
			let downDeltaPos = Math.sqrt(downDeltaX * downDeltaX + downDeltaY * downDeltaY);

			if ((deltaTime < 1) || ((deltaTime < 10) && ((deltaPos < 20) || (downDeltaPos < 20))))
				return;
			let buttons = 0;
			if (event.button === 0)
				buttons |= 1;
			else if (event.button === 1)
				buttons |= 2;
			else if (event.button === 2)
				buttons |= 4;

			this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);

			let oldButtons = this.mouse.getButtons();
			if (oldButtons === 0)
				this.mouse.down(event.clientX, event.clientY, buttons);
			else
				this.mouse.setButtons(oldButtons | buttons);
		}

		onMouseMove(event) {
			this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);
			// avoid emulated mouse event after touch events
			let deltaTime = (((new Date().getTime()) / 1000) - this.lastUpdate);
			let deltaX = (this.lastTouchX - event.clientX);
			let deltaY = (this.lastTouchY - event.clientY);
			let deltaPos = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			// check the delta position with the lastest touchstart event
			// because iOS8 generate mouse event using the start coordinates
			// and generate mouse event even after a long move
			let downDeltaX = this.lastDownTouchX - event.clientX;
			let downDeltaY = this.lastDownTouchY - event.clientY;
			let downDeltaPos = Math.sqrt(downDeltaX * downDeltaX + downDeltaY * downDeltaY);

			if ((deltaTime < 1) || ((deltaTime < 10) && ((deltaPos < 20) || (downDeltaPos < 20))))
				return;
			this.mouse.move(event.clientX, event.clientY);
		}

		onMouseUp(event) {
			this.mouse.setControls(event.altKey, event.ctrlKey, event.shiftKey);
			// avoid emulated mouse event after touch events
			let deltaTime = (((new Date().getTime()) / 1000) - this.lastUpdate);
			let deltaX = (this.lastTouchX - event.clientX);
			let deltaY = (this.lastTouchY - event.clientY);
			let deltaPos = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
			// check the delta position with the lastest touchstart event
			// because iOS8 generate mouse event using the start coordinates
			// and generate mouse event even after a long move
			let downDeltaX = this.lastDownTouchX - event.clientX;
			let downDeltaY = this.lastDownTouchY - event.clientY;
			let downDeltaPos = Math.sqrt(downDeltaX * downDeltaX + downDeltaY * downDeltaY);

			if ((deltaTime < 1) || ((deltaTime < 10) && ((deltaPos < 20) || (downDeltaPos < 20))))
				return;
			this.mouse.move(event.clientX, event.clientY);
			this.mouse.up();
		}

		onWindowLoad() {
			try {
				if (document.body === undefined) {
					let htmlBody = document.createElement('body');
					document.body = htmlBody;
				}
			} catch (e) { }
		}

		onPointerDown(event) {
			event.target.setPointerCapture(event.pointerId);
			if (this.pointers[event.pointerId] === undefined) {
				let type;
				if (event.pointerType === 'pen')
					type = 'pen';
				else if (event.pointerType === 'mouse')
					type = 'mouse';
				else
					type = 'touch';
				
				let pointer = new Pointer(type, event.pointerId);
				this.pointers[event.pointerId] = pointer;
			}	
			this.pointers[event.pointerId].setControls(event.altKey, event.ctrlKey, event.shiftKey);
			this.pointers[event.pointerId].down(event.clientX, event.clientY, 1);
		}

		onPointerMove(event) {
			if (this.pointers[event.pointerId] === undefined) {
				let type;
				if (event.pointerType === 'pen')
					type = 'pen';
				else if (event.pointerType === 'mouse')
					type = 'mouse';
				else
					type = 'touch';
				let pointer = new Pointer(type, event.pointerId);
				this.pointers[event.pointerId] = pointer;
			}

			this.pointers[event.pointerId].setControls(event.altKey, event.ctrlKey, event.shiftKey);
			this.pointers[event.pointerId].move(event.clientX, event.clientY);
		}

		onPointerUp(event) {
			event.target.releasePointerCapture(event.pointerId);
			if (this.pointers[event.pointerId] !== undefined) {
				this.pointers[event.pointerId].setControls(event.altKey, event.ctrlKey, event.shiftKey);
				this.pointers[event.pointerId].up();
				if (this.pointers[event.pointerId].getType() == 'touch')
					delete (this.pointers[event.pointerId]);
			}
		}

		onPointerCancel(event) {
			// TODO
			//		console.log('onPointerCancel');
		}

		updateTouches(event) {
			//console.log('updateTouch '+event.type);

			this.lastUpdate = (new Date().getTime()) / 1000;
			for (let id in this.pointers) {
				let found = false;
				for (let i = 0; (i < event.touches.length) && !found; i++) {
					if (id == event.touches[i].identifier) {
						found = true;
						this.pointers[id].setControls(event.altKey, event.ctrlKey, event.shiftKey);
						this.pointers[id].move(event.touches[i].clientX, event.touches[i].clientY);
					}
				}
				if (!found) {
					this.pointers[id].setControls(event.altKey, event.ctrlKey, event.shiftKey);
					this.pointers[id].up();
					delete (this.pointers[id]);
				}
			}
			for (let i = 0; i < event.touches.length; i++) {
				this.lastTouchX = event.touches[i].clientX;
				this.lastTouchY = event.touches[i].clientY;

				if (this.pointers[event.touches[i].identifier] == undefined) {
					let pointer = new Ui.Pointer('touch', event.touches[i].identifier);
					this.pointers[event.touches[i].identifier] = pointer;
					pointer.setControls(event.altKey, event.ctrlKey, event.shiftKey);
					pointer.down(event.touches[i].clientX, event.touches[i].clientY, 1);
				}
			}
			if (event.type === 'touchstart') {
				for (let i = 0; i < event.changedTouches.length; i++) {
					this.lastDownTouchX = event.changedTouches[i].clientX;
					this.lastDownTouchY = event.changedTouches[i].clientY;
				}
			}
			// we dont prevent default for all events because we need
			// default behavious like focus handling, text selection,
			// virtual keyboard... so we will also need to detect
			// emulated mouse event to avoid them
			if (event.type === 'touchmove')
				event.preventDefault();
		}
	}
}