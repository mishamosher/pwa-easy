import FetchInterceptor from "../external/js/esm/fetch-interceptor/fetch-interceptor.js";
import Vue from "../external/js/esm/vue/vue.esm.browser.js";
import VueI18n from "../external/js/esm/vue-i18n/vue-i18n.esm.browser.js";

let _vueI18nInstance;

const _savedLanguageKey = `${config.rootURL.pathname}-language`;

const _propagateLanguage = (language) => {
    _vueI18nInstance.locale = language;
    FetchInterceptor.setDefaultHeader('Accept-Language', language);
    document.documentElement.lang = language;
};

class I18n {
    constructor() {
        throw new Error('Can not instantiate. Please use the static members.');
    }

    static get vueI18nInstance() {
        return _vueI18nInstance;
    }

    static get supportedLanguages() {
        return {
            'en': 'English',
            'es': 'Español',
            'ru': 'Русский'
        }
    }

    static get fallbackLanguage() {
        return 'en';
    }

    static get defaultLanguage() {
        return 'en';
    }

    static isLanguageSupported(language) {
        return Object.keys(I18n.supportedLanguages).includes(language);
    }

    /**
     * Gets the user-preferred language, according to the ones present in {@link window.navigator.languages} (only if
     * it passes a {@link I18n.isLanguageSupported} check), otherwise, {@link I18n.defaultLanguage} is returned.
     * @returns {string}
     */
    static get preferredLanguage() {
        for (let language of window.navigator.languages) if (I18n.isLanguageSupported(language)) return language;
        for (let language of window.navigator.languages.map(item => item.split('-')[0])) if (I18n.isLanguageSupported(language)) return language;
        return I18n.defaultLanguage;
    }

    static get savedLanguage() {
        return window.localStorage.getItem(_savedLanguageKey);
    }

    static set savedLanguage(value) {
        window.localStorage.setItem(_savedLanguageKey, value);
    }

    /**
     * Gets the {@link I18n.savedLanguage} (only if it passes a {@link I18n.isLanguageSupported} check), otherwise,
     * {@link I18n.preferredLanguage} is returned.
     * @returns {string}
     */
    static get savedOrPreferredLanguage() {
        const savedLanguage = I18n.savedLanguage;
        if (I18n.isLanguageSupported(savedLanguage)) return savedLanguage;
        return I18n.preferredLanguage;
    }

    /**
     * Change the language
     * @param {string} language Language to change to
     * @returns {Promise<void>}
     */
    static async changeLanguage(language) {
        if (!I18n.isLanguageSupported(language)) throw new Error(`Language ${language} is not supported!`);

        if (!_vueI18nInstance.messages.hasOwnProperty(language)) {
            const response = await fetch(`${config.rootURL.pathname}lang/${language}.json`)
            _vueI18nInstance.setLocaleMessage(language, await response.json());
        }

        if (_vueI18nInstance.locale === language) return;

        _propagateLanguage(language);
    };

    /**
     * Change and save the language
     * @param {string} language Language to change to
     * @returns {Promise<void>}
     */
    static async saveAndChangeLanguage(language) {
        I18n.savedLanguage = language;
        await I18n.changeLanguage(language);
    }
}

(() => {
    Vue.use(VueI18n);

    _vueI18nInstance = new VueI18n({
        locale: I18n.defaultLanguage,
        fallbackLocale: I18n.fallbackLanguage,
        silentTranslationWarn: true
    });

    _propagateLanguage(I18n.defaultLanguage);
})();

export default I18n;