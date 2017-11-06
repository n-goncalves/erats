namespace Ui
{
	export interface AppInit extends LBoxInit {
		content: Element;
	}

	export class App extends LBox
	{
		styles: any = undefined;
		private updateTask: boolean = false;
		loaded: boolean = false;
		focusElement: any = undefined;
		arguments: any = undefined;
		private ready: boolean = false;
		orientation: number = 0;
		webApp: boolean = true;
		lastArrangeHeight: number = 0;

		private drawList: Element = undefined;
		private layoutList: Element = undefined;
		windowWidth: number = 0;
		windowHeight: number = 0;

		private contentBox: Box = undefined;
		private _content: Element = undefined;

		dialogs: LBox = undefined;
		topLayers: LBox = undefined;

		requireFonts: any = undefined;
		testFontTask: any = undefined;
		bindedUpdate: any = undefined;

		selection: Selection = undefined;

		//
		// @constructs
		// @class Define the App class. A web application always start
		// with a App class as the main container
		// @extends Ui.LBox
		//
		constructor(init?: Partial<AppInit>) {
			super();
			let args;
			this.addEvents('resize', 'ready', 'parentmessage', 'orientationchange');
			this.clipToBounds = true;

			Ui.App.current = this;
			this.drawing.style.cursor = 'default';

			this.selection = new Ui.Selection();
			this.connect(this.selection, 'change', this.onSelectionChange);

			// check if arguments are available
			if ((window.location.search !== undefined) && (window.location.search !== '')) {
				let base64;
				args = {};
				let tab = window.location.search.substring(1).split('&');
				for (let i = 0; i < tab.length; i++) {
					let tab2 = tab[i].split('=');
					if (tab2.length == 2) {
						let key = decodeURIComponent(tab2[0]);
						let val = decodeURIComponent(tab2[1]);
						if (key === 'base64')
							base64 = JSON.parse(Core.Util.fromBase64(val));
						else
							args[key] = val;
					}
				}
				if (base64 !== undefined) {
					this.arguments = base64;
					for (let prop in args)
						this.arguments[prop] = args[prop];
				}
				else
					this.arguments = args;
			}
			else
				this.arguments = {};
			// handle remote debugging
			if (this.arguments.remotedebug !== undefined) {
				args = this.arguments.remotedebug.split(':');
				new Core.RemoteDebug({ host: args[0], port: args[1] });
			}

			this.contentBox = new Ui.VBox();
			this.append(this.contentBox);

			this.setTransformOrigin(0, 0);

			this.connect(window, 'load', this.onWindowLoad);
			this.connect(window, 'resize', this.onWindowResize);
			this.connect(window, 'keyup', this.onWindowKeyUp);

			this.connect(window, 'focus', function (event) {
				if (event.target == undefined)
					return;
				this.focusElement = event.target;
			}, true);

			this.connect(window, 'blur', function (event) {
				this.focusElement = undefined;
			}, true);

			this.connect(window, 'dragstart', function (event) { event.preventDefault(); });
			this.connect(window, 'dragenter', function (event) { event.preventDefault(); return false; });
			this.connect(window, 'dragover', function (event) {
				event.dataTransfer.dropEffect = 'none';
				event.preventDefault(); return false;
			});
			this.connect(window, 'drop', function (event) { event.preventDefault(); return false; });


			if ('onorientationchange' in window)
				this.connect(window, 'orientationchange', this.onOrientationChange);

			// handle messages
			this.connect(window, 'message', this.onMessage);

			this.bindedUpdate = this.update.bind(this);

			if (init)
				this.assign(init);
		}

		setWebApp(webApp: boolean) {
			this.webApp = webApp;
		}

		// implement a selection handler for Selectionable elements
		getSelectionHandler() {
			return this.selection;
		}
		
		forceInvalidateMeasure(element) {
			if (element === undefined)
				element = this;
			if ('getChildren' in element) {
				for (let i = 0; i < element.getChildren().length; i++)
					this.forceInvalidateMeasure(element.getChildren()[i]);
			}
			element.invalidateMeasure();
		}

		requireFont(fontFamily, fontWeight) {
			let fontKey = fontFamily + ':' + fontWeight;
			if (this.requireFonts === undefined)
				this.requireFonts = {};
			if (!this.requireFonts[fontKey]) {
				let test = false;
				if (this.isReady)
					test = Ui.Label.isFontAvailable(fontFamily, fontWeight);
				this.requireFonts[fontKey] = test;
				if (test)
					this.forceInvalidateMeasure(this);
				else if (this.isReady && !test && (this.testFontTask === undefined))
					this.testFontTask = new Core.DelayedTask(this, 0.25, this.testRequireFonts);
			}
		}
	
		testRequireFonts() {
			let allDone = true;
			for (let fontKey in this.requireFonts) {
				let test = this.requireFonts[fontKey];
				if (!test) {
					let fontTab = fontKey.split(':');
					test = Ui.Label.isFontAvailable(fontTab[0], fontTab[1]);
					if (test) {
						this.requireFonts[fontKey] = true;
						let app = this;
						this.forceInvalidateMeasure(this);
					}
					else
						allDone = false;
				}
			}
			if (!allDone)
				this.testFontTask = new Core.DelayedTask(this, 0.25, this.testRequireFonts);
			else
				this.testFontTask = undefined;
		}

		checkWindowSize() {
			let innerWidth = (window.innerWidth !== undefined) ? window.innerWidth : document.body.clientWidth;
			let innerHeight = (window.innerHeight !== undefined) ? window.innerHeight : document.body.clientHeight;
			if ((innerWidth !== this.layoutWidth) || (innerHeight !== this.layoutHeight))
				this.invalidateMeasure();
		}

		getOrientation() {
			return this.orientation;
		}

		protected onSelectionChange(selection) {
		}

		protected onWindowLoad() {
			let meta; let style;
			if (Core.Navigator.iPad || Core.Navigator.iPhone || Core.Navigator.Android) {
				if (this.webApp) {
					// support app mode for iPad, iPod and iPhone
					meta = document.createElement('meta');
					meta.name = 'apple-mobile-web-app-capable';
					meta.content = 'yes';
					document.getElementsByTagName("head")[0].appendChild(meta);
					// black status bar for iPhone
					meta = document.createElement('meta');
					meta.name = 'apple-mobile-web-app-status-bar-style';
					meta.content = 'black';
					document.getElementsByTagName("head")[0].appendChild(meta);
					// support for Chrome
					meta = document.createElement('meta');
					meta.name = 'mobile-web-app-capable';
					meta.content = 'yes';
					document.getElementsByTagName("head")[0].appendChild(meta);
				}
			}
			// stop the scaling of the page for Safari and Chrome*
			meta = document.createElement('meta');
			meta.name = 'viewport';
			meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';
			document.getElementsByTagName("head")[0].appendChild(meta);
			// hide scroll tap focus (webkit)
			if (Core.Navigator.isWebkit) {
				style = document.createElement('style');
				style.type = 'text/css';
				style.innerHTML = '* { -webkit-tap-highlight-color: rgba(0, 0, 0, 0); }';
				document.getElementsByTagName('head')[0].appendChild(style);
			}
			// disable page zoom and auto scale for IE
			else if (Core.Navigator.isIE) {
				style = document.createElement('style');
				style.type = 'text/css';
				style.innerHTML =
					'@-ms-viewport { width: device-width; } ' +
					'body { -ms-content-zooming: none; } ' +
					'* { touch-action: none; } ';
				document.getElementsByTagName('head')[0].appendChild(style);
			}
			this.loaded = true;
			this.onReady();
		}
	
		protected onWindowResize(event) {
			this.checkWindowSize();
		}

		protected onOrientationChange(event) {
			this.orientation = window.orientation as number;
			this.fireEvent('orientationchange', this.orientation);
			this.checkWindowSize();
		}

		update() {
			//		if(this.updateCounter === undefined)
			//			this.updateCounter = 0;	
			//		else
			//			this.updateCounter++;
			//		let localCounter = this.updateCounter;
			//		console.log('update START '+localCounter+' task: '+this.updateTask);
			// clean the updateTask to allow a new one
			// important to do it first because iOS with its
			// bad thread system can trigger code that will ask for an
			// update without having finish this code
			//		this.updateTask = false;
			//		console.log('update task: '+this.updateTask);

			// update measure
			//		let innerWidth = (window.innerWidth !== undefined) ? window.innerWidth : document.body.clientWidth;
			//		let innerHeight = (window.innerHeight !== undefined) ? window.innerHeight : document.body.clientHeight;

			let innerWidth = document.body.clientWidth;
			let innerHeight = document.body.clientHeight;
			// to work like Windows 8 and iOS. Take outer size for not
			// taking care of the virtual keyboard size
			//		if(navigator.Android) {
			//			innerWidth = window.outerWidth;
			//			innerHeight = window.outerHeight;
			//		}

			if ((this.windowWidth !== innerWidth) || (this.windowHeight !== innerHeight)) {
				this.windowWidth = innerWidth;
				this.windowHeight = innerHeight;
				this.fireEvent('resize', this, this.windowWidth, this.windowHeight);
				this.invalidateLayout();
			}

			// disable page scroll horizontal that might happened because of focused elements
			// out of the screen

			//		document.body.scrollLeft = 0;
			//		document.body.scrollTop = 0;

			//		let innerWidth = document.body.clientWidth;
			//		let innerHeight = document.body.clientHeight;
		
			//		let size = this.measure(innerWidth, innerHeight);
			//			console.log('update M1 '+localCounter+', task: '+this.updateTask);

			//		console.log(this+'.update size: '+this.windowWidth+' x '+this.windowHeight+', child: '+size.width+' x '+size.height);

			//		this.arrange(0, 0, Math.max(this.windowWidth * this.windowScale, size.width), Math.max(this.windowHeight * this.windowScale, size.height));
			//		this.arrange(0, 0, innerWidth, innerHeight);

			//		console.log('update A1 '+localCounter+', task: '+this.updateTask);

			// update measure/arrange
			while (this.layoutList != undefined) {
				let next = this.layoutList.layoutNext;
				this.layoutList.layoutValid = true;
				this.layoutList.layoutNext = undefined;
				this.layoutList.updateLayout(this.windowWidth, this.windowHeight);
				this.layoutList = next;
			}

			// update draw
			while (this.drawList != undefined) {
				let next = this.drawList.drawNext;
				this.drawList.drawNext = undefined;
				this.drawList.draw();
				this.drawList = next;
			}

			//		console.log('update D1 '+localCounter+', task: '+this.updateTask);

			//		console.log(this+'.update end ('+(new Date()).getTime()+')');

			//		console.log('update STOP '+localCounter+', task: '+this.updateTask);

			this.updateTask = false;
		}

		get content(): Element {
			return this._content;
		}

		set content(content: Element) {
			if (this._content !== content) {
				if (this._content !== undefined)
					this.contentBox.remove(this._content);
				if (content !== undefined)
					this.contentBox.prepend(content, true);
				this._content = content;
			}
		}

		getFocusElement() {
			return this.focusElement;
		}

		appendDialog(dialog) {
			if (this.dialogs === undefined) {
				this.dialogs = new Ui.LBox();
				this.dialogs.eventsHidden = true;
				if (this.topLayers !== undefined)
					this.insertBefore(this.dialogs, this.topLayers);
				else
					this.append(this.dialogs);
			}
			this.dialogs.append(dialog);
			this.contentBox.disable();
			for (let i = 0; i < this.dialogs.children.length - 1; i++)
				this.dialogs.children[i].disable();
		}

		removeDialog(dialog) {
			if (this.dialogs !== undefined) {
				this.dialogs.remove(dialog);
				if (this.dialogs.children.length === 0) {
					this.remove(this.dialogs);
					this.dialogs = undefined;
					this.contentBox.enable();
				}
				else
					this.dialogs.lastChild.enable();
			}
		}

		appendTopLayer(layer) {
			if (this.topLayers === undefined) {
				this.topLayers = new Ui.LBox();
				this.topLayers.eventsHidden = true;
				this.append(this.topLayers);
			}
			this.topLayers.append(layer);
		}

		removeTopLayer(layer) {
			if (this.topLayers !== undefined) {
				this.topLayers.remove(layer);
				if (this.topLayers.children.length === 0) {
					this.remove(this.topLayers);
					this.topLayers = undefined;
				}
			}
		}

		//
		// Return the arguments given if any
		//
		getArguments() {
			return this.arguments;
		}
	
		get isReady(): boolean {
			return this.ready;
		}

		protected onReady() {
			if (this.loaded) {
				document.documentElement.style.position = 'absolute';
				document.documentElement.style.padding = '0px';
				document.documentElement.style.margin = '0px';
				document.documentElement.style.border = '0px solid black';
				document.documentElement.style.width = '100%';
				document.documentElement.style.height = '100%';

				document.body.style.position = 'absolute';
				document.body.style.overflow = 'hidden';
				document.body.style.padding = '0px';
				document.body.style.margin = '0px';
				document.body.style.border = '0px solid black';
				document.body.style.outline = 'none';
				document.body.style.width = '100%';
				document.body.style.height = '100%';

				document.body.appendChild(this.drawing);

				this.handleScrolling(document.body);

				if ((this.requireFonts !== undefined) && (this.testFontTask === undefined))
					this.testRequireFonts();

				this.isLoaded = true;
				this.parentVisible = true;
				this.fireEvent('ready');
			
				this.ready = true;
				if ((this.updateTask === false) && this.ready) {
					let app = this;
					this.updateTask = true;
					requestAnimationFrame(function () { app.update(); });
				}

				// create a WheelManager to handle wheel events
				new Ui.WheelManager(this);

				// handle pointer events
				new Ui.PointerManager(this);

				// handle native drag & drop
				new Ui.DragNativeManager(this);
			}
		}

		protected onWindowKeyUp(event) {
			let key = event.which;

			// escape
			if ((key == 27) && (this.dialogs !== undefined) && (this.dialogs.children.length > 0)) {
				let dialog = this.dialogs.children[this.dialogs.children.length - 1] as Dialog;
				if ('close' in dialog)
					dialog.close();
				else
					dialog.hide();
				event.preventDefault();
				event.stopPropagation();
			}
		}

		protected onMessage(event) {
			if (parent === event.source) {
				event.preventDefault();
				event.stopPropagation();
				let msg = JSON.parse(event.data);
				this.fireEvent('parentmessage', msg);
			}
		}

		sendMessageToParent(msg) {
			parent.postMessage(msg.serialize(), "*");
		}

		findFocusableDiv(current) {
			if (('tabIndex' in current) && (current.tabIndex >= 0))
				return current;
			if ('childNodes' in current) {
				for (let i = 0; i < current.childNodes.length; i++) {
					let res = this.findFocusableDiv(current.childNodes[i]);
					if (res !== undefined)
						return res;
				}
			}
			return undefined;
		}

		enqueueDraw(element) {
			element.drawNext = this.drawList;
			this.drawList = element;
			if ((this.updateTask === false) && this.ready) {
				this.updateTask = true;
				setTimeout(this.bindedUpdate, 0);
			}
		}

		enqueueLayout(element) {
			element.layoutNext = this.layoutList;
			this.layoutList = element;
			if ((this.updateTask === false) && this.ready) {
				this.updateTask = true;
				requestAnimationFrame(this.bindedUpdate);
			}
		}

		handleScrolling(drawing) {
			this.connect(this, 'ptrdown', function (event: PointerEvent) {
				let startOffsetX = drawing.scrollLeft;
				let startOffsetY = drawing.scrollTop;
				let watcher = event.pointer.watch(this);
				this.connect(watcher, 'move', function () {
					if (!watcher.getIsCaptured()) {
						if (watcher.pointer.getIsMove()) {
							let direction = watcher.getDirection();
							let allowed = false;
							if (direction === 'left')
								allowed = (drawing.scrollLeft + drawing.clientWidth) < drawing.scrollWidth;
							else if (direction === 'right')
								allowed = drawing.scrollLeft > 0;
							else if (direction === 'bottom')
								allowed = drawing.scrollTop > 0;
							// if scroll down, allways allow it because of virtual keyboards
							else if (direction === 'top')
								allowed = true;// (drawing.scrollTop + drawing.clientHeight) < drawing.scrollHeight;
							if (allowed)
								watcher.capture();
							else
								watcher.cancel();
						}
					}
					else {
						let delta = watcher.getDelta();
						drawing.scrollLeft = startOffsetX - delta.x;
						drawing.scrollTop = startOffsetY - delta.y;
					}
				});
			});
		}

		getElementsByClassName(className) {
			let res = [];
			let reqSearch = function (current) {
				if (current.classType === className)
					res.push(current);
				if (current.children !== undefined) {
					for (let i = 0; i < current.children.length; i++)
						reqSearch(current.children[i]);
				}
			};
			reqSearch(this);
			return res;
		}

		getElementByDrawing(drawing) {
			let reqSearch = function (current) {
				if (current.drawing === drawing)
					return current;
				if (current.children !== undefined) {
					for (let i = 0; i < current.children.length; i++) {
						let res = reqSearch(current.children[i]);
						if (res !== undefined)
							return res;
					}
				}
			};
			return reqSearch(this);
		}

		getInverseLayoutTransform() {
			return Ui.Matrix.createTranslate(-document.body.scrollLeft, -document.body.scrollTop).
				multiply(super.getInverseLayoutTransform());
		}

		getLayoutTransform() {
			return super.getLayoutTransform().translate(document.body.scrollLeft, document.body.scrollTop);
		}

		invalidateMeasure() {
			// Ui.App is layout root, handle the layout here
			this.invalidateLayout();
		}

		invalidateArrange() {
			// Ui.App is layout root, handle the layout here
			this.invalidateLayout();
		}

		protected arrangeCore(w: number, h: number) {
			// on Android, remove focus of text elements when
			// the virtual keyboard is closed. Else it will re-open at each touch
			if (Core.Navigator.Android && Core.Navigator.isWebkit) {
				if ((this.focusElement != undefined) && ((this.focusElement.tagName === 'INPUT') || (this.focusElement.tagName === 'TEXTAREA') || (this.focusElement.contenteditable))) {
					if (h - 100 > this.lastArrangeHeight)
						this.focusElement.blur();
				}
			}
			this.lastArrangeHeight = h;
			super.arrangeCore(w, h);
		}

		// {Ui.App} Reference to the current application instance
		static current: App = undefined;

		static getWindowIFrame(currentWindow) {
			if (currentWindow === undefined)
				currentWindow = window;
			let iframe;
			if (currentWindow.parent !== currentWindow) {
				try {
					let frames = currentWindow.parent.document.getElementsByTagName("IFRAME");
					for (let i = 0; i < frames.length; i++) {
						if (frames[i].contentWindow === currentWindow) {
							iframe = frames[i];
							break;
						}
					}
				} catch (e) { }
			}
			return iframe;
		}

		static getRootWindow() {
			let rootWindow = window;
			while (rootWindow.parent != rootWindow)
				rootWindow = rootWindow.parent;
			return rootWindow;
		}
	}
}	