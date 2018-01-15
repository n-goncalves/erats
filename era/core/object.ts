
namespace Core {
	//
	// @class Object class from which every Era classes derives.
	// It handles inheritance, serialization, dump function, manages events connections.
	//
	export class Object {
		//
		// Serialize a javascript object into a string
		// to deserialize, just use JSON.parse
		//
		serialize()
		{
			return JSON.stringify(this);
		}

		getClassName(): string {
			if ('name' in this.constructor)
				return this.constructor['name'];
			else
				return /function (.{1,})\(/.exec(this.constructor.toString())[0];
		}

		protected assign(init?: object) {
			if (!init)
				return;
			for (var prop in init)
				this[prop] = init[prop];
		}

		toString(): string {
			return `[object ${this.getClassName()}]`;
		}
	}
}
