import GEmojiElement from "../external/js/esm/gemoji/gemoji.js";
import FetchInterceptor from "../external/js/esm/fetch-interceptor/fetch-interceptor.js";
import I18n from "../utils/i18n.js";
import Progress from "../external/js/esm/progress/progress.js";
import Router from "../utils/router.js";
import Vue from "../external/js/esm/vue/vue.esm.browser.js";
import Vuetify from "../external/js/esm/vuetify/vuetify.js";

let _initialized = false;

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
    const router = Router.vueRouterInstance;
    let siteLanguage, route;
    if (sitePath) { // If a sitePath query parameter is set, re-route there. View service-worker.js for more details.
        siteLanguage = router.match(`/${sitePath}`).params.siteLanguage;

        if (!I18n.isLanguageSupported(siteLanguage)) {
            siteLanguage = I18n.savedOrPreferredLanguage;
            sitePath = `${I18n.savedOrPreferredLanguage}/${sitePath}`;
        }

        route = `/${sitePath}${startURL.search}${startURL.hash}`;
    } else {
        siteLanguage = I18n.savedOrPreferredLanguage;
        route = `/${siteLanguage}`;
    }
    return {siteLanguage, route};
};

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

        document.getElementById('app-template').textContent = await (await fetch(`views/index.html`)).text();

        document.head.append(...[
            'external/css/fontawesome/css/all.css',
            'external/css/vuetify/vuetify.css',
            'external/css/roboto/css/css.css'
        ].map((css) => Object.assign(document.createElement('link'), {
            rel: 'stylesheet',
            type: 'text/css',
            href: css
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


        const {startURL, sitePath} = _cleanLocation();
        const {siteLanguage, route} = _processSitePath(startURL, sitePath);

        await I18n.saveAndChangeLanguage(siteLanguage);

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

        globalThis.app = new Vue({
            i18n: I18n.vueI18nInstance,
            router: Router.vueRouterInstance,
            vuetify: new Vuetify({
                icons: {
                    iconfont: 'fa',
                },
                lang: {
                    t: (key, ...params) => I18n.vueI18nInstance.t(key, params),
                    current: siteLanguage
                },
                theme: {
                    dark: theme === 'dark'
                }
            }),
            el: '#app',
            template: '#app-template',
            async created() {
                if (this.$router.currentRoute.fullPath !== route) this.$router.replace(route);
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