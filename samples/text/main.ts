/// <reference path="../../era/era.d.ts" />

class App extends Ui.App {
	constructor() {
		super();

		let vbox = new Ui.VBox();
		this.content = vbox;
		
		let toolbar = new Ui.ToolBar();
		vbox.append(toolbar);
		
		let button = new Ui.CheckBox({ text: 'selectable' });
		toolbar.append(button);
		
		this.connect(button, 'toggle', () =>
			text.selectable = true
		);
		
		this.connect(button, 'untoggle', () =>
			text.selectable = false
		);
		
		let lbox = new Ui.LBox({ verticalAlign: 'center', horizontalAlign: 'stretch', margin: 100 });
		vbox.append(lbox, true);
		
		lbox.append(new Ui.Rectangle({ fill: 'lightgreen' }));
		
		let text = new Ui.Text({
			margin: 5,
			textAlign: 'center',
			text: 'hello, this is a simple text, long enought to test the line break feature\n\nwith 2 chapters'
		});
		lbox.append(text);
	}
}

new App();