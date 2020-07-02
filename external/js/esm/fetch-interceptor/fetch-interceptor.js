const _fetchOriginal = fetch;

const _defaultHeaders = {};

/**
 *
 * @param {RequestInfo} input
 * @param {RequestInit} [init]
 * @return {Promise<Response>}
 */
const _fetchHijacked = async (input, init) => {
    let controller;

    if (!init) init = {};
    if (init.hasOwnProperty('signal')) throw new Error("FetchInterceptor can't receive an abort signal. Please provide the AbortController instance as the 'controller' property instead.");
    if (init.hasOwnProperty('controller')) {
        controller = init.controller;
        delete init.controller;
    } else controller = new AbortController();

    init.signal = controller.signal;

    const request = new Request(input, init);
    for (const [key, value] of Object.entries(_defaultHeaders)) request.headers.set(key, value);

    for (const interceptor of _interceptors.onBeforeRequest) interceptor(request, controller);
    const promise = _fetchOriginal(request);
    for (const interceptor of _interceptors.onAfterRequest) interceptor(request, controller);

    let response, hasError, errorObj;
    try {
        response = await promise;

        if (response.ok) for (const interceptor of _interceptors.onRequestSuccess) interceptor(response, request, controller)
        else for (const interceptor of _interceptors.onRequestFailure) interceptor(response, request, controller);
    } catch (error) {
        for (const interceptor of _interceptors.onRequestException) interceptor(error, request, controller);
        hasError = true;
        errorObj = error;
    } finally {
        for (const interceptor of _interceptors.onRequestFinally) interceptor(request, controller);
    }

    if (hasError) throw errorObj;
    return response;
};

let _interceptors = {
    onBeforeRequest: [],
    onAfterRequest: [],
    onRequestSuccess: [],
    onRequestFailure: [],
    onRequestException: [],
    onRequestFinally: []
};

let _registered = false;

/**
 * The FetchInterceptor class. Allows hijacking the global fetch function to be able to intercept its requests.
 *
 * Based on https://github.com/itsfadnis/fetch-interceptor/blob/e97171f7f6d92b6b8d960991b39400bd14784974/src/index.js
 */
export default class FetchInterceptor {
    constructor() {
        throw new Error('Can not instantiate. Please use the static members.');
    }

    /**
     * Gets a strings-only key-value object of the default headers
     * @returns {Object}
     */
    static get defaultHeaders() {
        return _defaultHeaders;
    }

    /**
     * Sets the default headers. Please use a strings-only key-value object.
     * @param {Object} values
     */
    static set defaultHeaders(values) {
        for (const key of Object.keys(_defaultHeaders)) delete _defaultHeaders[key];
        for (const [key, value] of Object.entries(values)) _defaultHeaders[key] = value;
    }

    /**
     * Gets a default header. If the header does not exist, undefined is returned.
     * @param {string} name
     * @returns {string|undefined}
     */
    static getDefaultHeader(name) {
        return _defaultHeaders[name];
    }

    /**
     * Sets a default header
     * @param {string} name
     * @param {string} value
     */
    static setDefaultHeader(name, value) {
        _defaultHeaders[name] = value;
    }

    /**
     * Adds an interceptor that is executed before every fetch request
     * @param {function} interceptor
     */
    static addOnBeforeRequest(interceptor) {
        _interceptors.onBeforeRequest.push(interceptor);
    }

    /**
     * Adds an interceptor that is executed after every fetch request
     * @param {function} interceptor
     */
    static addOnAfterRequest(interceptor) {
        _interceptors.onAfterRequest.push(interceptor);
    }

    /**
     * Adds an interceptor that is executed after every successful fetch request
     * @param {function} interceptor
     */
    static addOnRequestSuccess(interceptor) {
        _interceptors.onRequestSuccess.push(interceptor);
    }

    /**
     * Adds an interceptor that is executed after every failed fetch request
     * @param {function} interceptor
     */
    static addOnRequestFailure(interceptor) {
        _interceptors.onRequestFailure.push(interceptor);
    }

    /**
     * Adds an interceptor that is executed after every fetch request that throws an exception
     * @param {function} interceptor
     */
    static addOnRequestException(interceptor) {
        _interceptors.onRequestException.push(interceptor);
    }

    /**
     * Adds an interceptor that is executed at the end of every fetch request (even on failure)
     * @param {function} interceptor
     */
    static addOnRequestFinally(interceptor) {
        _interceptors.onRequestFinally.push(interceptor);
    }

    /**
     * Clears all the interceptors
     */
    static clearInterceptors() {
        for (const property in _interceptors) _interceptors[property].length = 0;
    }

    /**
     * Hijack global fetch
     */
    static register() {
        if (_registered) throw new Error('Already registered!');
        _registered = true;

        globalThis.fetch = _fetchHijacked;
    }

    /**
     * Restore fetch
     */
    static unregister() {
        if (!_registered) throw new Error('Not registered!');
        _registered = false;

        globalThis.fetch = _fetchOriginal;
    }
}