import FetchInterceptor from "../external/js/esm/fetch-interceptor/fetch-interceptor.js";
import Vue from "../external/js/esm/vue/vue.esm.browser.js";
import VueI18n from "../external/js/esm/vue-i18n/vue-i18n.esm.browser.js";
import {I18nBase} from "./startup.js";

let _vueI18nInstance;

const _propagateLanguage = (language) => {
    _vueI18nInstance.locale = language;
    FetchInterceptor.setDefaultHeader('Accept-Language', language);
    document.documentElement.lang = language;
};

class I18n extends I18nBase {
    static get vueI18nInstance() {
        return _vueI18nInstance;
    }

    static get fallbackLanguage() {
        return 'en';
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