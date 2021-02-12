class GlobalUtils {
    constructor() {
        throw new Error('Can not instantiate. Please use the static members.');
    }

    static polyfillSafari() {
        const getArrayBuffer = function () {
            return new Response(this).arrayBuffer();
        };

        File.prototype.arrayBuffer = File.prototype.arrayBuffer || getArrayBuffer;
        Blob.prototype.arrayBuffer = Blob.prototype.arrayBuffer || getArrayBuffer;

        const getStream = function () {
            return new Response(this).body;
        };

        File.prototype.stream = File.prototype.stream || getStream;
        Blob.prototype.stream = Blob.prototype.stream || getStream;
    }
}

globalThis.utils = GlobalUtils;