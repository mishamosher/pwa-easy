const _startHref = window.location.href;
const _rootHref = new URL('./', _startHref).href;

class GlobalConfig {
    constructor() {
        throw new Error('Can not instantiate. Please use the static members.');
    }

    static get rootURL() {
        return new URL(_rootHref);
    }

    static get startURL() {
        return new URL(_startHref);
    }
}

globalThis.config = GlobalConfig;