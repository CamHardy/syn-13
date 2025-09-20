export const OpCode = Object.freeze({
	OP_RETURN: 1,
	OP_CONSTANT: 2
});

export class Chunk {
	count;
	capacity;
	code;
	constructor() {
		this.count = 0;
		this.capacity = 0;
		this.code = new Uint8Array(this.capacity);
	}

	/** @param { number } byte */
	write(byte) {
		if (this.capacity < this.count + 1) {
			let oldCapacity = this.capacity;
			this.capacity = this.#growCapacity(oldCapacity);
			this.code = this.#growArray(this.capacity);
		}
		
		this.code[this.count] = byte;
		this.count++;
	}

	/** @param { number } capacity */
	#growCapacity(capacity) {
		return (capacity < 8) ? 8 : capacity * 2;
	}

	/** @param { number } capacity */
	#growArray(capacity) {
		const newCode = new Uint8Array(capacity);
		newCode.set(this.code);
		return newCode;
	}
}
