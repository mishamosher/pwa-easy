let _status = null;
let _settings = {
    minimum: 20, // Range is: 0 <= minimum <= 100. Must be less than maximum. Used only when start is called with no params.
    maximum: 95, // Range is: 0 <= maximum <= 100. Must be more than minimum. The progress bar will never be bigger than this.
    speed: 0.5,  // In seconds. Wait time for the immediate action (start/go/increment/complete) to complete.
    increaseSpeed: 30, // In seconds. Wait time for the (start/go/increment) to grow to maximum.
    height: '3px', // Must be a string. Can use any CSS measurement unit.
    defaultColor: '#9400d3', // Must be a string. Can be null. Required (and used only) when color is empty.
    color: ["#9400d3"] // Can't be null. Can be empty. Must be an array.
};

/**
 * @type {HTMLElement}
 */
let _progressBarElement = null;

/**
 * Clamps n to be between min and max (inclusive)
 * @param {number} n Number to clamp
 * @param {number} min Minimum value of n
 * @param {number} max Maximum value of n
 * @return {number} Clamped value of n
 */
const _clamp = function (n, min, max) {
    if (n < min) return min;
    if (n > max) return max;
    return n;
};

/**
 * Checks if the progress bar has started or not
 * @return {boolean}
 */
const _isStarted = function () {
    return _status !== null;
};

/**
 * Checks if the progress bar element is rendered or not
 * @return {boolean}
 */
const _isRendered = function () {
    return _progressBarElement !== null;
};

/**
 * Retrieves the newly generated css for the progress bar
 * @param {number} progress
 * @param {number} speed
 * @param {string} timing
 * @return {Object} generated object CSS
 */
const _getBarCss = function (progress, speed, timing) {
    return {
        transitionDuration: `0s, ${speed}s`,
        transitionTimingFunction: `linear, ${timing}`,
        width: `${progress}%`
    };
};

/**
 * Apply CSS to the element
 * @param {HTMLElement} element
 * @param {Object} properties
 */
const _applyCss = function (element, properties) {
    for (const prop in properties) {
        const value = properties[prop];
        if (value !== undefined) element.style[prop] = value;
    }
};

/**
 * Fade out the element.
 * @param {HTMLElement} elem
 */
const _fadeOut = function (elem) {
    const styles = elem.style;

    styles.transitionDuration = `${_settings.speed}s, 0s`;
    styles.opacity = '0';

    _timeoutComplete = setTimeout(() => {
        _timeoutComplete = null; // avoid any clearTimeout call to clear a handled timeout

        styles.width = '0%'
    }, 1000 * _settings.speed);
};

let _timeoutGo = null;
let _timeoutComplete = null;

/**
 * The Progress class. Allows rendering a progress bar via a simple JavaScript API.
 *
 * Based on https://github.com/shashibeit/progressbar/blob/master/demo/progress.js
 */
export default class Progress {
    constructor() {
        throw new Error('Can not instantiate. Please use the static functions.');
    }

    /**
     * Initializes the progress bar, adding the required div as a direct child of body.
     *
     * Please call this function once when the DOM finishes loading to avoid animation issues.
     */
    static initialize() {
        if (_isRendered()) return;

        _progressBarElement = document.createElement('div');

        const style = _progressBarElement.style;
        style.height = _settings.height;
        style.width = '0%';
        style.position = 'fixed';
        style.zIndex = '99999';
        style.top = '0';
        style.left = '0';
        style.boxShadow = '0 0 2px #777';
        style.transitionProperty = 'opacity, width';
        style.transitionTimingFunction = 'linear';
        style.transitionDuration = `0s, 0s`;

        switch (_settings.color.length) {
            case 0:
                style.background = _settings.defaultColor;
                break;
            case 1:
                style.background = _settings.color[0];
                break;
            default:
                style.background = `linear-gradient(to right,${_settings.color.join()})`;
                break;
        }

        document.body.appendChild(_progressBarElement);
    }

    /**
     * Configures the settings for the progress bar
     * @param {Object} options Key-value settings object
     */
    static configure(options) {
        let key, value;
        for (key in options) {
            value = options[key];
            if (_settings.hasOwnProperty(key)) _settings[key] = value;
        }
    };

    /**
     * Start the progress with minimum width set up in settings, and grow to maximum. Does nothing if {@link Progress.start} was called already.
     * @param {number} [progress] Width to use instead of the minimum one set up in settings
     */
    static start(progress) {
        if (_isStarted()) return;

        _status = 0; // mark the progress bar as started

        _progressBarElement.style.opacity = 1;

        if (typeof progress === "undefined") progress = _settings.minimum;
        Progress.go(progress);
    };

    /**
     * Set the progress to the given width, and grow to maximum. Does nothing if {@link Progress.start} was not called first.
     * @param {number} progress
     */
    static go(progress) {
        if (!_isStarted()) return;

        _status = progress = _clamp(progress, 1, _settings.maximum);

        // go "stacks" (if called multiple times, all of them are effective). Clear _timeoutGo and _timeoutComplete here.
        clearTimeout(_timeoutGo);
        clearTimeout(_timeoutComplete);
        _timeoutComplete = null; // _timeoutGo is assigned below, there is no point on clearing it too

        if (!_isRendered()) Progress.initialize();

        _applyCss(_progressBarElement, _getBarCss(progress, _settings.speed, 'linear'));

        _timeoutGo = setTimeout(() => {
            _timeoutGo = null; // avoid any clearTimeout call to clear a handled timeout

            _applyCss(_progressBarElement, _getBarCss(_settings.maximum, _settings.increaseSpeed, 'cubic-bezier(0,0,0,1)'));
        }, Number(_settings.speed) * 1000);
    };

    /**
     * Complete the progress bar by setting the width to 100% and then fading out. Does nothing if {@link Progress.start} was not called first.
     */
    static complete() {
        if (!_isStarted()) return;

        _status = null;

        // complete doesn't "stack" (if called multiple times, only the first call is effective). It is not necessary to handle _timeoutComplete here.
        clearTimeout(_timeoutGo);
        _timeoutGo = null;

        _applyCss(_progressBarElement, _getBarCss(100, _settings.speed, 'linear'));

        _timeoutComplete = setTimeout(() => {
            _timeoutComplete = null; // avoid any clearTimeout call to clear a handled timeout

            _fadeOut(_progressBarElement);
        }, Number(_settings.speed) * 1000);
    };

    /**
     * Increment progress by amount and continue until maximum width configured in settings. Does nothing if {@link Progress.start} was not called first.
     *
     * If the amount is skipped, one will be generated according to the current progress.
     * @param {number} [amount]
     */
    static increment(amount) {
        if (!_isStarted()) return;

        let n = _status;

        if (typeof amount === 'undefined') {
            if (n >= 0 && n < 20) amount = 10;
            else if (n >= 20 && n < 50) amount = 4;
            else if (n >= 50 && n < 80) amount = 2;
            else if (n >= 80 && n < 99) amount = 1;
            else amount = 0;
        }
        n = _clamp(n + amount, 1, _settings.maximum);

        Progress.go(n);
    };
}