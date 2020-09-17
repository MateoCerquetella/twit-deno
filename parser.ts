import EventEmitter from "https://deno.land/std/node/events.ts";

export default class Parser extends EventEmitter {
    buffer = "";
    static END = "\r\n";
    static END_LENGTH = 2;

    constructor() {
        super();
    }

    receive(buffer: Uint8Array) {
        const decoder = new TextDecoder();
        this.buffer += decoder.decode(buffer);
        let index, json;

        while ((index = this.buffer.indexOf(Parser.END)) > -1) {
            json = this.buffer.slice(0, index);
            this.buffer = this.buffer.slice(index + Parser.END_LENGTH);
            if (json.length > 0) {
                try {
                    json = JSON.parse(json);
                    if (json.event !== undefined) {
                        this.emit(json.event, json);
                        this.emit("event", json);
                    }
                    else if (json.delete !== undefined) {
                        this.emit("delete", json);
                    }
                    else if (
                        json.friends !== undefined ||
                        json.friends_str !== undefined
                    ) {
                        this.emit("friends", json);
                    }
                    else {
                        this.emit("data", json);
                    }
                } catch (error) {
                    error.source = json;
                    this.emit("error", error);
                }
            } else {
                this.emit("ping");
            }
        }
    }
}