import EmojiUnicode from "../external/js/esm/emoji-unicode/emoji-unicode.js";
import GEmojiElement from "../external/js/esm/gemoji/gemoji.js";
import FetchInterceptor from "../external/js/esm/fetch-interceptor/fetch-interceptor.js";
import I18n from "../utils/i18n.js";
import Progress from "../external/js/esm/progress/progress.js";
import Router from "../utils/router.js";
import Vue from "../external/js/esm/vue/vue.esm.browser.js";
import Vuetify from "../external/js/esm/vuetify/vuetify.js";
import {StartupUtils} from "../utils/startup.js";

let _initialized = false;

const _progressFetchInterceptor = () => {
    let requests = 0;
    FetchInterceptor.addOnBeforeRequest(() => {
        if (requests > 0) Progress.increment();
        else Progress.start();
        requests++;
    });
    FetchInterceptor.addOnRequestFinally(() => {
        requests--;
        if (requests === 0) Progress.complete();
    });
}

const _savedThemeKey = `${config.rootURL.pathname}-theme`;

const _processHTMLHeader = () => {
    document.head.append(...[
        'external/css/fontawesome/css/all.css',
        'external/css/vuetify/vuetify.css',
        'external/css/roboto/css/css.css'
    ].map((css) => Object.assign(document.createElement('link'), {
        rel: 'stylesheet',
        type: 'text/css',
        href: `${config.rootURL.pathname}${css}`
    })));

    const styleSkipToContent = document.createElement('style');
    // language=CSS
    styleSkipToContent.textContent = `
.skip-to-content {
    position: absolute;
    width: 1px;
    height: 1px;
    overflow: hidden;
}

.skip-to-content:focus, .skip-to-content:active {
    z-index: 10;
    width: initial;
    height: initial;
    padding: 12px !important;
}`;
    document.head.append(styleSkipToContent);
};

export default class ControllerIndex {
    constructor() {
        throw new Error('Can not instantiate. Please use the static members.');
    }

    static async initialize() {
        if (_initialized) throw new Error('Already initialized!')
        _initialized = true;

        window.customElements.define('g-emoji', GEmojiElement);

        FetchInterceptor.register();
        Progress.configure({color: ['#4caf50', '#2196f3']});
        Progress.initialize();
        _progressFetchInterceptor();

        Vue.use(Vuetify);

        GEmojiElement.emojiToUriCallback = emoji => {
            if (emoji === '') return null;
            const emojiCode = EmojiUnicode.hex(emoji, {separator: '-', psMaxLength: 4, psFillString: '0'}).toUpperCase();
            return `${config.rootURL.pathname}external/img/openmoji/${emojiCode}.svg`;
        };
        document.getElementById('app-template').textContent = await (await fetch(`views/index.html`)).text();

        _processHTMLHeader();

        await I18n.saveAndChangeLanguage(StartupUtils.siteLanguage);

        const mqlDark = window.matchMedia("(prefers-color-scheme: dark)");
        const mqlLight = window.matchMedia("(prefers-color-scheme: light)");

        let theme = window.localStorage.getItem(_savedThemeKey);
        if (!theme) {
            if (mqlDark.matches) theme = 'dark';
            else if (mqlLight.matches) theme = 'light';
            else {
                const hour = (new Date()).getHours();
                theme = (hour < 4 || hour >= 17) ? 'dark' : 'light';
            }
        }

        Object.defineProperty(Vue.prototype, '$window', {
            get() { return window; }
        });

        globalThis.app = new Vue({
            i18n: I18n.vueI18nInstance,
            router: Router.vueRouterInstance,
            vuetify: new Vuetify({
                icons: {
                    iconfont: 'fa',
                },
                lang: {
                    t: (key, ...params) => I18n.vueI18nInstance.t(key, params),
                    current: StartupUtils.siteLanguage
                },
                theme: {
                    dark: theme === 'dark'
                }
            }),
            el: '#app',
            template: '#app-template',
            async created() {
                if (this.$router.currentRoute.fullPath !== StartupUtils.route) this.$router.replace(StartupUtils.route);
            },
            mounted() {
                mqlDark.addEventListener('change', e => e.matches && this.themeDarkIfNoneSaved())
                mqlLight.addEventListener('change', e => e.matches && this.themeLightIfNoneSaved())

                this.$nextTick(function () {
                    document.head.removeChild(document.head.querySelector('#styles-temporary'))
                });
            },
            methods: {
                routeToLanguage(language) {
                    if (!this.$route.fullPath.substring(1).includes('/')) return `/${language}`;
                    return `/${language}/${this.$route.fullPath.substring(this.$i18n.locale.length + 2)}`;
                },
                async changeLanguage(newLanguage) {
                    await I18n.saveAndChangeLanguage(newLanguage);
                    this.$vuetify.lang.current = newLanguage;
                },
                showUpdateSnackbar() {
                    this.updateSnackbarVisible = true;
                },
                reloadPage() {
                    window.location.reload();
                },
                onScroll() {
                    this.scrollTopVisible = window.pageYOffset > 0;
                },
                invertTheme() {
                    const newValue = !this.$vuetify.theme.dark;
                    this.$vuetify.theme.dark = newValue;
                    window.localStorage.setItem(_savedThemeKey, newValue ? 'dark' : 'light');
                },
                themeDarkIfNoneSaved() {
                    if (window.localStorage.getItem(_savedThemeKey)) return;
                    this.$vuetify.theme.dark = true;
                },
                themeLightIfNoneSaved() {
                    if (window.localStorage.getItem(_savedThemeKey)) return;
                    this.$vuetify.theme.dark = false;
                },
                skipToContent() {
                    this.$vuetify.goTo('#start-of-content');
                    this.$el.querySelector('#start-of-content').focus();
                },
                /**
                 *
                 * @param {string} message
                 * @param {string} [color]
                 */
                showNotification(message, color) {
                    this.notificationSnackbarMessage = message;
                    this.notificationSnackbarColor = color;
                    this.notificationSnackbarVisible = true;
                }
            },
            computed: {
                siteLanguages() {
                    const languages = I18n.supportedLanguages;
                    delete languages[this.$i18n.locale]
                    return languages;
                }
            },
            data: {
                drawer: false,
                scrollTopVisible: false,
                updateSnackbarVisible: false,
                notificationSnackbarVisible: false,
                notificationSnackbarColor: undefined,
                notificationSnackbarMessage: null
            }
        });
    }
}