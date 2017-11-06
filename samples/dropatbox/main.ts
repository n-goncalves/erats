/// <reference path="../../era/era.d.ts" />

interface ItemInit extends Ui.DraggableInit {
	fill: Ui.Color | string;
}

class Item extends Ui.Draggable {
	private rect: Ui.Rectangle;

	constructor(init?: Partial<ItemInit>) {
		super();
		this.rect = new Ui.Rectangle({ width: 150, height: 150 });
		this.append(this.rect);
		this.draggableData = this;
		if (init)
			this.assign(init);	
	}

	set fill(color: Ui.Color) {
		this.rect.fill = color;
	}
}

class App extends Ui.App {
	container: Ui.SFlowDropBox;

	constructor() {
		super();

		var scroll = new Ui.ScrollingArea();
		this.setContent(scroll);

		this.container = new Ui.SFlowDropBox({
			spacing: 20, margin: 20,
			stretchMaxRatio: 2, itemAlign: 'stretch'
		});
		this.container.addType(Item, this.onDragEffect);
		this.container.addType('files', this.onDragEffect);
		scroll.content = this.container;
		this.connect(this.container, 'dropat', this.onDropAt);

		this.container.append(new Item({ width: 150, height: 150, fill: 'red' }));
		this.container.append(new Item({ width: 150, height: 150, fill: 'green' }));
		this.container.append(new Item({ width: 150, height: 150, fill: 'pink' }));
		this.container.append(new Item({ width: 250, height: 150, fill: 'purple' }));
		this.container.append(new Item({ width: 150, height: 150, fill: 'brown' }));
		this.container.append(new Item({ width: 150, height: 150, fill: 'orange' }));
		this.container.append(new Item({ width: 150, height: 150, fill: 'lightblue' }));
	}

	onDragEffect(data: any, pos: number): Ui.DropEffect[] {
		console.log(`testFunction data: ${data}, pos: ${pos}`);
		if((pos === 0) || (pos === 1) || (pos === 7))
			return [];
		else if(pos === 4)
			return [{ action: 'copy' }];
		else
			return [{ action: 'move' }];
	}

	onDropAt(dropbox: Ui.DropBox, data: any, effect: string, pos: number, x: number, y: number) {
		console.log(`onDropAt data: ${data}, effect: ${effect}, pos: ${pos}, coord: ${x},${y}`);
	}
}

new App();