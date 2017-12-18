/// <reference path="../../era/era.d.ts" />

class Item1 extends Ui.Draggable { }

class Item2 extends Ui.Draggable { }

class DropBox1 extends Ui.DropBox {
    background: Ui.Rectangle;

    constructor() {
        super();
		this.background = new Ui.Rectangle({ fill: 'lightgreen' });		
		this.append(this.background);

		this.append(new Ui.Frame({ frameWidth: 2, fill: 'black' }));

		this.addType('files', [ 'copy', 'move' ]);
		this.addType(Ui.Draggable, [
			{ action: 'copy', text: 'Copier', primary: true },
			{ action: 'move', text: 'Déplacer', secondary: true }
		]);
	}

	protected onDragEnter() {
		this.background.fill = 'orange';
	}

	protected onDragLeave() {
		this.background.fill = 'lightgreen';
	}
}

class DropBox2 extends Ui.DropBox {
    background: Ui.Rectangle;
    border: Ui.Frame;

    constructor() {
        super();
		this.background = new Ui.Rectangle({ fill: 'lightgreen' });
		this.append(this.background);

		this.border = new Ui.Frame({ frameWidth: 2, fill: 'black' });
		this.append(this.border);

		this.addType('text', [ 'copy' ]);
		this.addType(Item1, [
			{ action: 'copy', text: 'Copier', dragicon: 'dragcopy' },
			{ action: 'warn', text: 'Attention', dragicon: 'warning' }
		]);
	}

	protected onDragEnter() {
		this.background.fill = 'pink';
	}

	protected onDragLeave() {
		this.background.fill = 'lightgreen';
	}
}

class DropBox3 extends Ui.DropBox {
    background: Ui.Rectangle;
    border: Ui.Frame;

    constructor() {
        super();
		this.background = new Ui.Rectangle({ fill: 'lightgreen' });		
		this.append(this.background);

		this.border = new Ui.Frame({ frameWidth: 2, fill: 'black' });
		this.append(this.border);

		this.addType(Item1, [ 'link' ]);
    }
    
	protected onDragEnter() {
		this.background.fill = 'pink';
	}

	protected onDragLeave() {
		this.background.fill = 'lightgreen';
	}
}

let app = new Ui.App();

let vbox = new Ui.VBox({ verticalAlign: 'center', horizontalAlign: 'center', spacing: 20 });
app.content = vbox;

let hbox = new Ui.HBox({ horizontalAlign: 'center', spacing: 20 });
vbox.append(hbox);

let item1 = new Item1({ width: 64, height: 64 });
item1.setAllowedMode([ 'copy', 'link', 'move', 'warn' ]);
item1.draggableData = item1;
item1.append(new Ui.Rectangle({ fill: 'lightblue' }));
item1.append(new Ui.Label({ text: 'drag me', horizontalAlign: 'center', verticalAlign: 'center', margin: 10 }));
hbox.append(item1);

let item2 = new Item2({ width: 64, height: 64 });
item2.draggableData = item2;
item2.append(new Ui.Rectangle({ fill: 'rgb(255, 122, 255)' }));
item2.append(new Ui.Label({ text: 'drag me', horizontalAlign: 'center', verticalAlign: 'center', margin: 10 }));
hbox.append(item2);


let dropbox = new DropBox1();
dropbox.width = 200; dropbox.height = 200;
let droplabel = new Ui.Label({ text: 'drop here', horizontalAlign: 'center', verticalAlign: 'center', margin: 10 });
dropbox.append(droplabel);
vbox.append(dropbox);
app.connect(dropbox, 'dropfile', function() {
	console.log('dropfile');
	return false;
});
app.connect(dropbox, 'drop', function(dropbox: Ui.DropBox, data: any, effect: string) {
	console.log('drop effect: '+effect);
	droplabel.text = data.toString();
	new Core.DelayedTask(2, () => droplabel.text = 'drop here');
});


let dropbox2 = new DropBox2();
dropbox2.height = 50; dropbox2.margin = 10;
dropbox2.verticalAlign = 'bottom';
let droplabel2 = new Ui.Label();
droplabel2.text = 'drop here';
droplabel2.horizontalAlign = 'center';
droplabel2.verticalAlign = 'center';
droplabel2.margin = 10;
dropbox2.append(droplabel2);
dropbox.append(dropbox2);
app.connect(dropbox2, 'drop', function(dropbox: Ui.DropBox, data: any) {
	droplabel2.text = data.toString();
	new Core.DelayedTask(2, () => droplabel2.text = 'drop here');
});

let dropbox3 = new DropBox3();
dropbox3.height = 50; dropbox3.margin = 10;
dropbox3.verticalAlign = 'bottom';
let droplabel3 = new Ui.Label({	text: 'drop here', horizontalAlign: 'center', verticalAlign: 'center', margin: 10 })
dropbox3.append(droplabel3);
vbox.append(dropbox3);
app.connect(dropbox3, 'drop', function(dropbox: Ui.DropBox, data: any) {
	droplabel3.text = data.toString();
	new Core.DelayedTask(2, () => droplabel3.text = 'drop here');
});
