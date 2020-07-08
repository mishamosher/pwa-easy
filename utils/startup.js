let _siteLanguage;
let _route;

/**
 * Removes the [sitePath] query param of {@link GlobalConfig.startURL} if present.
 * @returns {Object} Object with these properties:
 *  - URL `startURL`: Starting URL, without the [sitePath] query param
 *  - string|null `sitePath`: The extracted `sitePath`, with trailing '/' characters removed. Null if: not present, empty, or containing '/' characters only.
 */
const _cleanLocation = () => {
    const startURL = config.startURL;

    // Only accept non-empty strings for [sitePath]. Remove all the trailing slashes.
    let sitePath = startURL.searchParams.get('sitePath')?.trim() ?? null;
    if (sitePath !== null) {
        sitePath = sitePath.replace(/\/+$/, '');
        if (sitePath.length === 0) sitePath = null;
    }

    startURL.searchParams.delete('sitePath');
    if (startURL.href !== config.startURL.href) window.history.replaceState(null, '', startURL.href);
    return {startURL, sitePath};
};

/**
 * Processes the [sitePath].
 * @returns {Object} Object with these properties:
 *  - string `siteLanguage`: Language to be used
 *  - string|null `route`: Identified route
 */
const _processSitePath = (startURL, sitePath) => {
    let siteLanguage, route;
    if (sitePath) { // If a sitePath query parameter is set, re-route there. View service-worker.js for more details.
        siteLanguage = sitePath.replace(/\/.*/, '');

        if (!I18nBase.isLanguageSupported(siteLanguage)) {
            siteLanguage = I18nBase.savedOrPreferredLanguage;
            sitePath = `${I18nBase.savedOrPreferredLanguage}/${sitePath}`;
        }

        route = `/${sitePath}${startURL.search}${startURL.hash}`;
    } else {
        siteLanguage = I18nBase.savedOrPreferredLanguage;
        route = `/${siteLanguage}`;
    }
    return {siteLanguage, route};
};

class StartupUtils {
    constructor() {
        throw new Error('Can not instantiate. Please use the static members.');
    }

    static get siteLanguage() {
        return _siteLanguage;
    }

    static get route() {
        return _route;
    }

    static addHeaders() {
        document.head.append(...[
            {href: `manifest.${I18nBase.savedOrPreferredLanguage}.webmanifest`, rel: "manifest"},
            {href: "img/logo-pwa-192x192.png", rel: "apple-touch-icon"},
            {href: "img/favicon-32x32.png", rel: "icon", type: "image/png", sizes: "32x32"},
            {href: "img/favicon-16x16.png", rel: "icon", type: "image/png", sizes: "16x16"},
            {href: "favicon.ico", rel: "shortcut icon"},
            {href: "img/safari-pinned-tab.svg", rel: "mask-icon", color: "#5bbad5"},
        ].map((linkObj) => {
            const link = document.createElement('link');
            for (const [key, value] of Object.entries(linkObj)) {
                switch (key) {
                    case 'href':
                        link[key] = `${config.rootURL.pathname}${value}`;
                        break;
                    default:
                        link[key] = value;
                        break;
                }
            }
            return link;
        }));
    }
}

const _savedLanguageKey = `${config.rootURL.pathname}-language`;

class I18nBase {
    static get supportedLanguages() {
        return {
            'en': 'English',
            'es': 'Español',
            'ru': 'Русский'
        }
    }

    static get defaultLanguage() {
        return 'en';
    }

    static get savedLanguage() {
        return window.localStorage.getItem(_savedLanguageKey);
    }

    static set savedLanguage(value) {
        window.localStorage.setItem(_savedLanguageKey, value);
    }

    /**
     * Gets the user-preferred language, according to the ones present in {@link window.navigator.languages} (only if
     * it passes a {@link I18nBase.isLanguageSupported} check), otherwise, {@link I18nBase.defaultLanguage} is returned.
     * @returns {string}
     */
    static get preferredLanguage() {
        for (let language of window.navigator.languages) if (I18nBase.isLanguageSupported(language)) return language;
        for (let language of window.navigator.languages.map(item => item.split('-')[0])) if (I18nBase.isLanguageSupported(language)) return language;
        return I18nBase.defaultLanguage;
    }

    /**
     * Gets the {@link I18nBase.savedLanguage} (only if it passes a {@link I18nBase.isLanguageSupported} check), otherwise,
     * {@link I18nBase.preferredLanguage} is returned.
     * @returns {string}
     */
    static get savedOrPreferredLanguage() {
        const savedLanguage = I18nBase.savedLanguage;
        if (I18nBase.isLanguageSupported(savedLanguage)) return savedLanguage;
        return I18nBase.preferredLanguage;
    }

    static isLanguageSupported(language) {
        return Object.keys(I18nBase.supportedLanguages).includes(language);
    }
}

(() => {
    const {startURL, sitePath} = _cleanLocation();
    const {siteLanguage, route} = _processSitePath(startURL, sitePath);
    _siteLanguage = siteLanguage;
    _route = route;
})();

export {I18nBase, StartupUtils};