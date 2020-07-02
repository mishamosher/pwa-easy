let _status = null;
let _settings = {
    minimum: 20,
    maximum: 95,
    speed: 0.5,
    increaseSpeed: 30,
    height: 3,
    defaultColor: '#9400D3',
    color: ["#9400D3"]
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

    setTimeout(() => {
        styles.width = '0%'
    }, 1000 * _settings.speed);
};

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
        style.height = `${_settings.height}px`;
        style.width = '0%';
        style.position = 'fixed';
        style.zIndex = '99999';
        style.top = '0';
        style.left = '0';
        style.boxShadow = '0 0 2px #29d, 0 0 1px #29d';
        style.background = 'transparent';
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
            if (value !== undefined && _settings.hasOwnProperty(key)) _settings[key] = value;
        }
    };

    /**
     * Start the progress with minimum width set up in settings
     * @param {number} [progress] Width to use instead of the minimum one set up in settings
     */
    static start(progress) {
        if (_isStarted()) return;

        _progressBarElement.style.opacity = '1';

        _status = 0; // mark the progress bar as started

        if (typeof progress === "undefined") progress = _settings.minimum;
        this.go(progress);
    };

    /**
     * Increment progress up to given width
     * @param {number} progress
     */
    static go(progress) {
        if (!_isStarted()) return;

        _status = progress = _clamp(progress, 1, _settings.maximum);

        if (!_isRendered()) this.initialize();

        const barCss = _getBarCss(progress, _settings.speed, 'linear');
        _applyCss(_progressBarElement, barCss);

        setTimeout(() => {
            const barCss = _getBarCss(_settings.maximum, _settings.increaseSpeed, 'cubic-bezier(0,0,0,1)');
            _applyCss(_progressBarElement, barCss);
        }, Number(_settings.speed) * 1000);
    };

    /**
     * Complete the progress bar by setting the width to 100%.
     */
    static complete() {
        if (!_isStarted()) return;

        setTimeout(() => { // we can have a pending timeout from the [go] function. Let's play nice and wait.
            const barCss = _getBarCss(100, _settings.speed, 'linear');
            _applyCss(_progressBarElement, barCss);

            setTimeout(() => {
                _fadeOut(_progressBarElement);
                _status = null;
            }, Number(_settings.speed) * 1000);
        }, Number(_settings.speed) * 1000);
    };

    /**
     * Increment progress by amount and continue until maximum width configured in settings
     * @param {number} [amount]
     */
    static increment(amount) {
        if (!_isStarted()) return;

        let n = _status;

        if (typeof n === 'undefined') {
            return this.start(0);
        } else if (n > 100) {
            return;
        } else {
            if (typeof amount === 'undefined') {
                if (n >= 0 && n < 20) {
                    amount = 10;
                } else if (n >= 20 && n < 50) {
                    amount = 4;
                } else if (n >= 50 && n < 80) {
                    amount = 2;
                } else if (n >= 80 && n < 99) {
                    amount = 1;
                } else {
                    amount = 0;
                }
            }
            n = _clamp(n + amount, 1, _settings.maximum);

            this.go(n);
        }
    };
}