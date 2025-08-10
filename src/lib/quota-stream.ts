import { Readable } from "stream";

export default class QuotaStream extends Readable {
    private reader: ReadableStreamDefaultReader<Uint8Array>;
    private quota: number;
    private bytesRead = 0;

    constructor(stream: ReadableStream, quota: number) {
        super();
        this.reader = stream.getReader();
        this.quota = quota;
    }

    async _read() {
        try {
            const { done, value } = await this.reader.read();
            if (done) {
                this.push(null);
                return;
            }
            this.bytesRead += value.byteLength;

            if (this.bytesRead > this.quota) {
                this.destroy(new Error("Quota exceeded"));
                return;
            }

            this.push(Buffer.from(value));
        } catch (err) {
            this.destroy(err as Error);
        }
    }
}
