﻿namespace Ui {
	export class ScrollLoader extends Core.Object {
		constructor() {
			super();
			this.addEvents('change');
		}

		getMin(): number {
			return 0;
		}

		getMax(): number {
			return -1;
		}

		getElementAt(position: number) {
			return undefined;
		}
	}

	export interface VBoxScrollableInit extends ContainerInit {
		loader: ScrollLoader;
		maxScale: number;
		content: Element;
		scrollHorizontal: boolean;
		scrollVertical: boolean;
		scrollbarVertical: Element;
		scrollbarHorizontal: Element;
	}

	export class VBoxScrollable extends Container implements VBoxScrollableInit {
		contentBox: VBoxScrollableContent;
		_scrollHorizontal: boolean = true;
		_scrollVertical: boolean = true;
		scrollbarHorizontalNeeded: boolean = false;
		scrollbarVerticalNeeded: boolean = false;
		scrollbarVerticalHeight: number;
		scrollbarHorizontalWidth: number;
		_scrollbarVertical: Movable;
		_scrollbarHorizontal: Movable;
		showShadows: boolean = false;
		lock: boolean = false;
		isOver: boolean = false;
		showClock: Anim.Clock;
		offsetX: number = 0;
		offsetY: number = 0;
		viewWidth: number = 0;
		viewHeight: number = 0;
		contentWidth: number = 0;
		contentHeight: number = 0;
		overWatcher: PointerWatcher;
		scrollLock: boolean = false;
		relativeOffsetX: number;
		relativeOffsetY: number;

		constructor(init?: Partial<VBoxScrollable>) {
			super();
			this.addEvents('scroll');
			this.contentBox = new VBoxScrollableContent();
			this.connect(this.contentBox, 'scroll', this.onScroll);
			this.connect(this.contentBox, 'down', this.autoShowScrollbars);
			this.connect(this.contentBox, 'inertiaend', this.autoHideScrollbars);
			this.appendChild(this.contentBox);

			this.connect(this, 'ptrmove', (event: PointerEvent) => {
				if (!this.isDisabled && !event.pointer.getIsDown() && (this.overWatcher === undefined)) {
					this.overWatcher = event.pointer.watch(this);
					this.isOver = true;
					// enter
					this.autoShowScrollbars();

					this.connect(this.overWatcher, 'move', function () {
						if (!this.overWatcher.getIsInside())
							this.overWatcher.cancel();
					});
					this.connect(this.overWatcher, 'down', function () {
						this.overWatcher.cancel();
					});
					this.connect(this.overWatcher, 'up', function () {
						this.overWatcher.cancel();
					});
					this.connect(this.overWatcher, 'cancel', function () {
						this.overWatcher = undefined;
						this.isOver = false;
						// leave
						this.autoHideScrollbars();
					});
				}
			});

			this.connect(this, 'wheel', this.onWheel);
			if (init)
				this.assign(init);
		}

		reload() {
			this.contentBox.reload();
		}

		getActiveItems() {
			return this.contentBox.getActiveItems();
		}

		set loader(loader: ScrollLoader) {
			this.contentBox.setLoader(loader);
		}

		set maxScale(maxScale: number) {
			this.contentBox.maxScale = maxScale;
		}

		set content(content: Element) {
			this.contentBox.content = content;
		}

		get content(): Element {
			return this.contentBox.content;
		}

		get scrollHorizontal(): boolean {
			return this._scrollHorizontal;
		}
	
		set scrollHorizontal(scroll: boolean) {
			if (scroll !== this._scrollHorizontal) {
				this._scrollHorizontal = scroll;
				this.invalidateMeasure();
			}
		}

		get scrollVertical(): boolean {
			return this._scrollVertical;
		}

		set scrollVertical(scroll: boolean) {
			if (scroll !== this._scrollVertical) {
				this._scrollVertical = scroll;
				this.invalidateMeasure();
			}
		}

		get scrollbarVertical(): Movable {
			return this._scrollbarVertical;
		}

		set scrollbarVertical(scrollbarVertical: Movable) {
			if (this._scrollbarVertical) {
				this.disconnect(this._scrollbarVertical, 'down', this.autoShowScrollbars);
				this.disconnect(this._scrollbarVertical, 'up', this.autoHideScrollbars);
				this.disconnect(this._scrollbarVertical, 'move', this.onScrollbarVerticalMove);
				this.removeChild(this._scrollbarVertical);
			}
			if (scrollbarVertical) {
				this._scrollbarVertical = scrollbarVertical;
				this._scrollbarVertical.moveHorizontal = false;
				this.connect(this._scrollbarVertical, 'down', this.autoShowScrollbars);
				this.connect(this._scrollbarVertical, 'up', this.autoHideScrollbars);
				this.connect(this._scrollbarVertical, 'move', this.onScrollbarVerticalMove);
				this._scrollbarVertical.opacity = 0;
				this.appendChild(this._scrollbarVertical);
			}
		}

		get scrollbarHorizontal(): Movable {
			return this._scrollbarHorizontal;
		}

		set scrollbarHorizontal(scrollbarHorizontal: Movable) {
			if (this._scrollbarHorizontal) {
				this.disconnect(this._scrollbarHorizontal, 'down', this.autoShowScrollbars);
				this.disconnect(this._scrollbarHorizontal, 'up', this.autoHideScrollbars);
				this.disconnect(this._scrollbarHorizontal, 'move', this.onScrollbarHorizontalMove);
				this.removeChild(this._scrollbarHorizontal);
			}	
			if (scrollbarHorizontal) {
				this._scrollbarHorizontal = scrollbarHorizontal;
				this._scrollbarHorizontal.moveVertical = false;
				this.connect(this._scrollbarHorizontal, 'down', this.autoShowScrollbars);
				this.connect(this._scrollbarHorizontal, 'up', this.autoHideScrollbars);
				this.connect(this._scrollbarHorizontal, 'move', this.onScrollbarHorizontalMove);
				this._scrollbarHorizontal.opacity = 0;
				this.appendChild(this._scrollbarHorizontal);
			}
		}
	
		setOffset(offsetX?: number, offsetY?: number, absolute: boolean = false) {

			if (offsetX === undefined)
				offsetX = this.offsetX;
			else if (!absolute)
				offsetX *= this.contentWidth - this.viewWidth;
			if (offsetY === undefined)
				offsetY = this.offsetY;
			else if (!absolute)
				offsetY *= this.contentHeight - this.viewHeight;

			if (offsetX < 0)
				offsetX = 0;
			else if (this.viewWidth + offsetX > this.contentWidth)
				offsetX = this.contentWidth - this.viewWidth;
			if (offsetY < 0)
				offsetY = 0;
			else if (this.viewHeight + offsetY > this.contentHeight)
				offsetY = this.contentHeight - this.viewHeight;
			
			this.relativeOffsetX = offsetX / (this.contentWidth - this.viewWidth);
			this.relativeOffsetY = offsetY / (this.contentHeight - this.viewHeight);

			if ((this.offsetX !== offsetX) || (this.offsetY !== offsetY)) {
				this.offsetX = offsetX;
				this.offsetY = offsetY;
				this.contentBox.setOffset(offsetX, offsetY);
				return true;
			}
			else
				return false;
		}

		getOffsetX() {
			return this.contentBox.getOffsetX();
		}

		getRelativeOffsetX() {
			return this.relativeOffsetX;
		}

		getOffsetY() {
			return this.contentBox.getOffsetY();
		}
	
		getRelativeOffsetY() {
			return this.relativeOffsetY;
		}

		onWheel(event) {
			if (this.setOffset(this.contentBox.getOffsetX() + event.deltaX * 3, this.contentBox.getOffsetY() + event.deltaY * 3, true)) {
				event.stopPropagation();
			}
		}

		autoShowScrollbars() {
			if (this.showClock == undefined) {
				this.showClock = new Anim.Clock({ duration: 'forever' });
				this.connect(this.showClock, 'timeupdate', this.onShowBarsTick);
				this.showClock.begin();
			}
		}

		autoHideScrollbars() {
			if (this.contentBox.isDown || this.contentBox.isInertia || this.isOver ||
				(this.scrollbarVertical && this.scrollbarVertical.isDown) ||
				(this.scrollbarHorizontal && this.scrollbarHorizontal.isDown))
				return;
			if (this.showClock === undefined) {
				this.showClock = new Anim.Clock({ duration: 'forever' });
				this.connect(this.showClock, 'timeupdate', this.onShowBarsTick);
				this.showClock.begin();
			}
		}

		onShowBarsTick(clock: Anim.Clock, progress: number, delta: number): void {
			let show = (this.contentBox.isDown || this.contentBox.isInertia || this.isOver ||
				(this.scrollbarVertical && this.scrollbarVertical.isDown) ||
				(this.scrollbarHorizontal && this.scrollbarHorizontal.isDown));

			let stop = false;
			let speed = 2;

			let opacity = this.scrollbarHorizontal.opacity;
			if (show) {
				opacity += (delta * speed);
				if (opacity >= 1) {
					opacity = 1;
					stop = true;
				}
			}
			else {
				opacity -= (delta * speed);
				if (opacity <= 0) {
					opacity = 0;
					stop = true;
				}
			}
			this.scrollbarHorizontal.opacity = opacity;
			this.scrollbarVertical.opacity = opacity;
			if (stop) {
				this.showClock.stop();
				this.showClock = undefined;
			}
		}

		onScroll() {
			this.updateOffset();
			this.fireEvent('scroll', this, this.offsetX, this.offsetY);
		}

		updateOffset() {
			if (this.contentBox === undefined)
				return;

			this.offsetX = this.contentBox.getOffsetX();
			this.offsetY = this.contentBox.getOffsetY();

			this.viewWidth = this.layoutWidth;
			this.viewHeight = this.layoutHeight;

			this.contentWidth = this.contentBox.getContentWidth();
			this.contentHeight = this.contentBox.getContentHeight();

			this.relativeOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
			this.relativeOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);

			if (this.contentHeight > this.viewHeight)
				this.scrollbarVerticalNeeded = true;
			else
				this.scrollbarVerticalNeeded = false;
			if (this.contentWidth > this.viewWidth)
				this.scrollbarHorizontalNeeded = true;
			else
				this.scrollbarHorizontalNeeded = false;
	
			if (this.scrollbarVerticalNeeded) {
				this.scrollbarVerticalHeight = Math.max((this.viewHeight / this.contentHeight) * this.viewHeight,
					this.scrollbarVertical.measureHeight);
				this.scrollbarVertical.arrange(this.layoutWidth - this.scrollbarVertical.measureWidth, 0,
					this.scrollbarVertical.measureWidth, this.scrollbarVerticalHeight);
				this.scrollbarVertical.show();
			}
			else {
				this.scrollbarVertical.hide();
				this.offsetY = 0;
			}
			if (this.scrollbarHorizontalNeeded) {
				this.scrollbarHorizontalWidth = Math.max((this.viewWidth / this.contentWidth) * this.viewWidth,
					this.scrollbarHorizontal.measureWidth);
				this.scrollbarHorizontal.arrange(0, this.layoutHeight - this.scrollbarHorizontal.measureHeight,
					this.scrollbarHorizontalWidth, this.scrollbarHorizontal.measureHeight);
				this.scrollbarHorizontal.show();
			}
			else {
				this.scrollbarHorizontal.hide();
				this.offsetX = 0;
			}


			this.scrollLock = true;
			if (this.scrollbarHorizontalNeeded) {
				let relOffsetX = this.offsetX / (this.contentWidth - this.viewWidth);
				if (relOffsetX > 1) {
					relOffsetX = 1;
					this.setOffset(relOffsetX, undefined);
				}
				this.scrollbarHorizontal.setPosition((this.viewWidth - this.scrollbarHorizontalWidth) * relOffsetX, undefined);
			}
			if (this.scrollbarVerticalNeeded) {
				let relOffsetY = this.offsetY / (this.contentHeight - this.viewHeight);
				if (relOffsetY > 1) {
					relOffsetY = 1;
					this.setOffset(undefined, relOffsetY);
				}
				this.scrollbarVertical.setPosition(undefined, (this.viewHeight - this.scrollbarVerticalHeight) * relOffsetY);
			}
			this.scrollLock = false;
		}

		onScrollbarHorizontalMove(movable: Movable) {
			if (this.scrollLock)
				return;

			let totalWidth = this.viewWidth - this.scrollbarHorizontal.layoutWidth;
			let offsetX = Math.min(1, Math.max(0, movable.positionX / totalWidth));
			this.setOffset(offsetX, undefined);
			movable.setPosition(offsetX * totalWidth, undefined);
		}

		onScrollbarVerticalMove(movable: Movable) {
			if (this.scrollLock)
				return;

			let totalHeight = this.viewHeight - this.scrollbarVertical.layoutHeight;
			let offsetY = Math.min(1, Math.max(0, movable.positionY / totalHeight));
			this.setOffset(undefined, offsetY);
			movable.setPosition(undefined, offsetY * totalHeight);
		}

		protected measureCore(width: number, height: number) {
			let size = { width: 0, height: 0 };

			this.scrollbarHorizontal.measure(width, height);
			let sSize = this.scrollbarVertical.measure(width, height);

			let contentSize = this.contentBox.measure(width, height);
			if (contentSize.width < width)
				size.width = contentSize.width;
			else
				size.width = width;
			if (contentSize.height < height)
				size.height = contentSize.height;
			else
				size.height = height;
			if (!this.scrollVertical)
				size.height = contentSize.height;
			if (!this.scrollHorizontal)
				size.width = contentSize.width;
			return size;
		}

		protected arrangeCore(width: number, height: number) {
			this.viewWidth = width;
			this.viewHeight = height;
			this.contentBox.arrange(0, 0, this.viewWidth, this.viewHeight);
			this.contentWidth = this.contentBox.getContentWidth();
			this.contentHeight = this.contentBox.getContentHeight();
			this.updateOffset();
		}
	}

	export class VBoxScrollableContent extends Transformable {
		contentWidth: number = 0;
		contentHeight: number = 0;
		estimatedHeight: number = 36;
		estimatedHeightNeeded: boolean = true;
		loader: ScrollLoader;
		activeItems: Element[];
		activeItemsPos: number = 0;
		activeItemsY: number = 0;
		activeItemsHeight: number = 0;
		reloadNeeded: boolean = false;

		constructor() {
			super();
			this.addEvents('scroll');

			this.activeItems = [];

			this.clipToBounds = true;
			this.connect(this.drawing, 'scroll', () => {
				this.translateX -= this.drawing.scrollLeft;
				this.translateY -= this.drawing.scrollTop;
				this.drawing.scrollLeft = 0;
				this.drawing.scrollTop = 0;
				this.onContentTransform(false);
			});
			this.allowTranslate = true;
			this.allowRotate = false;
			this.minScale = 1;
			this.maxScale = 1;
			this.inertia = true;
			this.setTransformOrigin(0, 0);

			this.removeChild(this.contentBox);
		}

		setLoader(loader) {
			if (this.loader !== loader) {
				if (this.loader !== undefined)
					this.disconnect(this.loader, 'change', this.onLoaderChange);
				this.loader = loader;
				if (this.loader !== undefined)
					this.connect(this.loader, 'change', this.onLoaderChange);
				this.reload();
			}
		}

		getActiveItems() {
			return this.activeItems;
		}

		getOffsetX() {
			return -this.translateX;
		}

		getOffsetY() {
			return Math.max(0, (((-this.translateY) / this.scale) - this.getMinY()) * this.scale);
		}

		setOffset(x, y) {
			let minY = this.getMinY();
			let translateY = -(((y / this.scale) + minY) * this.scale);
			this.setContentTransform(-x, translateY, undefined, undefined);
		}

		getContentWidth() {
			return this.contentWidth;
		}

		getContentHeight() {
			return this.getEstimatedContentHeight() * this.scale;
		}

		getEstimatedContentHeight() {
			let itemsBefore = (this.activeItemsPos - this.loader.getMin());
			let itemsAfter = (this.loader.getMax() + 1 - (this.activeItemsPos + this.activeItems.length));
			let minY = this.activeItemsY - (itemsBefore * this.estimatedHeight);
			let maxY = this.activeItemsY + this.activeItemsHeight + (itemsAfter * this.estimatedHeight);
			return maxY - minY;
		}

		getMinY() {
			let itemsBefore = (this.activeItemsPos - this.loader.getMin());
			let minY = this.activeItemsY - (itemsBefore * this.estimatedHeight);
			return minY;
		}

		getMaxY() {
			let itemsAfter = (this.loader.getMax() + 1 - (this.activeItemsPos + this.activeItems.length));
			let maxY = this.activeItemsY + this.activeItemsHeight + (itemsAfter * this.estimatedHeight);
			return maxY;
		}

		loadItems() {
			if (this.loader.getMax() - this.loader.getMin() < 0)
				return;
			let w = this.layoutWidth;
			let h = this.layoutHeight;
			if ((w === 0) || (h === 0))
				return;
		
			// find the visible part
			let matrix = this.matrix;

			let invMatrix = matrix.inverse();

			let p0 = (new Ui.Point(0, 0)).multiply(invMatrix);
			let p1 = (new Ui.Point(w, h)).multiply(invMatrix);

			let refPos;
			let refY;
			let stillActiveItems = [];
			let stillActiveHeight = 0;

			// find active items still visible
			let y = this.activeItemsY;
			for (let i = 0; i < this.activeItems.length; i++) {
				let activeItem = this.activeItems[i];
				let itemHeight = activeItem.measureHeight;
				// still active
				if (((y >= p0.y) && (y <= p1.y)) || ((y + itemHeight >= p0.y) && (y + itemHeight <= p1.y)) ||
					((y <= p0.y) && (y + itemHeight >= p1.y))) {

					if (refPos === undefined) {
						refPos = (i + this.activeItemsPos);
						refY = y;
					}
					stillActiveItems.push(activeItem);
					stillActiveHeight += activeItem.measureHeight;
				}
				// no more visible, remove it
				else {
					this.removeChild(activeItem);
				}
				y += itemHeight;
			}

			if (refPos === undefined) {
				refPos = Math.floor((-this.translateY) / (this.estimatedHeight * this.scale));
				refPos = Math.max(this.loader.getMin(), Math.min(this.loader.getMax(), refPos));
				refY = -this.translateY / this.scale;
				this.activeItemsPos = refPos;
				this.activeItems = [];

				let item = this.loader.getElementAt(refPos);
				this.appendChild(item);
				let size = item.measure(w, h);
				item.arrange(0, 0, w, size.height);
				item.setTransformOrigin(0, 0);

				this.activeItems.push(item);
				this.activeItemsHeight = size.height;
			}
			else {
				this.activeItemsPos = refPos;
				this.activeItems = stillActiveItems;
				this.activeItemsHeight = stillActiveHeight;
			}

			// build what is missing before the active items
			while (refY > p0.y) {
				let pos = this.activeItemsPos - 1;
				if (pos < this.loader.getMin())
					break;
			
				let item = this.loader.getElementAt(pos);
				this.prependChild(item);
				let size = item.measure(w, h);
				item.arrange(0, 0, w, size.height);
				item.setTransformOrigin(0, 0);

				this.activeItems.unshift(item);
				this.activeItemsHeight += size.height;
				refY -= size.height;
				this.activeItemsPos = pos;
			}

			// build what is missing after the active items
			while (refY + this.activeItemsHeight < p1.y) {
				let pos = this.activeItemsPos + this.activeItems.length;
				if (pos > this.loader.getMax())
					break;

				let item = this.loader.getElementAt(pos);
				this.appendChild(item);
				let size = item.measure(w, h);
				item.arrange(0, 0, w, size.height);
				item.setTransformOrigin(0, 0);

				this.activeItems.push(item);
				this.activeItemsHeight += size.height;
			}

			this.activeItemsY = refY;
			this.activeItemsHeight = 0;
			for (let i = 0; i < this.activeItems.length; i++) {
				let item = this.activeItems[i];
				item.transform = matrix.clone().translate(0, this.activeItemsY + this.activeItemsHeight);
				this.activeItemsHeight += item.measureHeight;
			}

			if (this.estimatedHeightNeeded) {
				this.estimatedHeightNeeded = false;
				this.estimatedHeight = this.activeItemsHeight / this.activeItems.length;
			}
		}

		updateItems() {
			let w = this.layoutWidth;
			let h = this.layoutHeight;

		}

		reload() {
			for (let i = 0; i < this.activeItems.length; i++)
				this.removeChild(this.activeItems[i]);
			this.activeItems = [];
			this.activeItemsPos = 0;
			this.activeItemsY = 0;
			this.activeItemsHeight = 0;
			this.estimatedHeightNeeded = true;
			this.onContentTransform(false);
		}

		onLoaderChange() {
			this.reloadNeeded = true;
			this.invalidateMeasure();
		}

		measureCore(width, height) {
			if (this.reloadNeeded) {
				this.reloadNeeded = false;
				this.reload();
			}

			let y = 0;
			for (let i = 0; i < this.activeItems.length; i++) {
				let item = this.activeItems[i];
				let size = item.measure(width, 0);
				y += size.height;
			}
			this.activeItemsHeight = y;
			return { width: width, height: this.getEstimatedContentHeight() };
		}
		
		arrangeCore(width, height) {
			for (let i = 0; i < this.activeItems.length; i++) {
				let activeItem = this.activeItems[i];
				activeItem.arrange(0, 0, width, activeItem.measureHeight);
			}
			this.loadItems();
		}
		
		onContentTransform(testOnly) {
			let scale = this.scale;

			if (this.translateX > 0)
				this.translateX = 0;
		
			let itemsBefore = (this.activeItemsPos - this.loader.getMin());
			let itemsAfter = (this.loader.getMax() + 1 - (this.activeItemsPos + this.activeItems.length));
		
			let minY = this.activeItemsY - (itemsBefore * this.estimatedHeight);
			let maxY = this.activeItemsY + this.activeItemsHeight + (itemsAfter * this.estimatedHeight);

			minY *= scale;
			maxY *= scale;

			let viewWidth = this.layoutWidth;
			let viewHeight = this.layoutHeight;

			this.contentWidth = this.layoutWidth * scale;
			this.contentHeight = this.getEstimatedContentHeight() * scale;

			this.translateX = Math.max(this.translateX, -(this.contentWidth - viewWidth));

			if (this.translateY < -(maxY - viewHeight))
				this.translateY = -(maxY - viewHeight);
			if (this.translateY > -minY)
				this.translateY = -minY;


			// find the corresponding pos
			this.loadItems();

			this.contentWidth = this.layoutWidth * scale;
			this.contentHeight = this.getEstimatedContentHeight() * scale;

			if (testOnly !== true)
				this.fireEvent('scroll', this);
		}

		protected onChildInvalidateMeasure(child: Element, event) {
			this.invalidateLayout();
		}
	}
	
	export interface VBoxScrollingAreaInit extends VBoxScrollableInit {
	}

	export class VBoxScrollingArea extends VBoxScrollable implements VBoxScrollingAreaInit {
		horizontalScrollbar: Scrollbar;
		verticalScrollbar: Scrollbar;

		constructor(init?: Partial<VBoxScrollingAreaInit>) {
			super();
			this.horizontalScrollbar = new Scrollbar('horizontal');
			this.scrollbarHorizontal = this.horizontalScrollbar;
			this.verticalScrollbar = new Scrollbar('vertical');
			this.scrollbarVertical = this.verticalScrollbar;
			if (init)
				this.assign(init);
		}
	
		protected onStyleChange() {
			let radius = this.getStyleProperty('radius');
			this.horizontalScrollbar.radius = radius;
			this.verticalScrollbar.radius = radius;
	
			let color = this.getStyleProperty('color');
			this.horizontalScrollbar.fill = color;
			this.verticalScrollbar.fill = color;
		}
		
		static style: object = {
			color: 'rgba(50,50,50,0.7)',
			radius: 0
		}
	}
}