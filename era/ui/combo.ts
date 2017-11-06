namespace Ui {
	export interface ComboInit extends ButtonInit {
		placeHolder: string;
		field: string;
		data: object[];
		position: number;
		current: object;
	}

	export class Combo extends Button implements ComboInit {
		private _field: string;
		private _data: object[];
		private _position: number = -1;
		private _current: object;
		private _placeHolder: string = '...';
		sep: undefined;
		arrowtop: Icon;
		arrowbottom: Icon;

		/**
		 * @constructs
		 * @class
		 * @extends Ui.Pressable
		 * @param {String} [config.field] Name of the data's field to display in the list
		 * @param [config.data] Object List
		 * @param [currentAt] Default selected object position
		 * @param [current] Default selected object
		 * @param [placeHolder] Text displays when no selection
		 */
		constructor(init?: Partial<ComboInit>) {
			super();
			this.addEvents('change');

			this.arrowtop = new Icon({ icon: 'arrowtop', width: 10, height: 10 });
			this.arrowbottom = new Icon({ icon: 'arrowbottom', width: 10, height: 10 });

			this.marker = new Ui.VBox({
				verticalAlign: 'center',
				content: [ this.arrowtop, this.arrowbottom ], marginRight: 5
			});
			if (init)
				this.assign(init);
		}

		set placeHolder(placeHolder: string) {
			this._placeHolder = placeHolder;
			if (this._position === -1)
				this.text = this._placeHolder;
		}

		set field(field: string) {
			this._field = field;
			if (this._data !== undefined)
				this.data = this._data;
		}

		set data(data: object[]) {
			this._data = data;
		}
	
		/**Read only*/
		get data(): object[] {
			return this._data;
		}

		get position(): number {
			return this._position;
		}

		set position(position: number) {
			if (position === -1) {
				this._position = -1;
				this._current = undefined;
				this.text = this._placeHolder;
				this.fireEvent('change', this, this._current, this._position);
			}
			else if ((position >= 0) && (position < this._data.length)) {
				this._current = this._data[position];
				this._position = position;
				this.text = this._current[this._field];
				this.fireEvent('change', this, this._current, this._position);
			}
		}

		get current(): object {
			return this._current;
		}
	
		get value(): object {
			return this._current;
		}

		set current(current: object) {
			if (current == undefined)
				this.position = -1;
			let position = -1;
			for (let i = 0; i < this._data.length; i++) {
				if (this._data[i] == current) {
					position = i;
					break;
				}
			}
			if (position != -1)
				this.position = position;
		}
	
		protected onItemPress(popup, item, position) {
			this.position = position;
		}

		protected onPress() {
			let popup = new Ui.ComboPopup({ field: this._field, data: this._data });
			if (this._position !== -1)
				popup.position = this._position;
			this.connect(popup, 'item', this.onItemPress);
			popup.openElement(this, 'right');
		}

		protected updateColors() {
			super.updateColors();
			this.arrowtop.fill = this.getForegroundColor();
			this.arrowbottom.fill = this.getForegroundColor();
		}

		static style: object = {
			textTransform: 'none'
		}
	}

	export interface ComboPopupInit extends MenuPopupInit {
		field: string;
		data: object[];
		position: number;
	}

	export class ComboPopup extends MenuPopup {
		private list: VBox;
		private _data: object[];
		private _field: string;

		constructor(init?: Partial<ComboPopupInit>) {
			super();
			this.addEvents('item');
			this.autoClose =true;

			this.list = new VBox();
			this.content = this.list;
			if (init)
				this.assign(init);
		}

		set field(field: string) {
			this._field = field;
			if (this._data !== undefined)
				this.data = this._data;
		}

		set data(data: object[]) {
			this._data = data;
			if (this._field === undefined)
				return;
			for (let i = 0; i < data.length; i++) {
				let item = new ComboItem({ text: data[i][this._field] });
				this.connect(item, 'press', this.onItemPress);
				this.list.append(item);
			}
		}

		set position(position: number) {
			(this.list.children[position] as ComboItem).isActive = true;
		}
	
		protected onItemPress(item: ComboItem) {
			let position = -1;
			for (let i = 0; i < this.list.children.length; i++) {
				if (this.list.children[i] == item) {
					position = i;
					break;
				}
			}
			this.fireEvent('item', this, item, position);
			this.close();
		}
	}

	export class ComboItem extends Button {
		static style: object = {
			borderWidth: 0,
			textTransform: 'none'
		}
	}
}	
	