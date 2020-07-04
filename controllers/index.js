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
        Progress.start();
        if (requests > 0) Progress.increment();
        requests++;
    });
    FetchInterceptor.addOnRequestFinally(() => {
        requests--;
        if (requests === 0) Progress.complete();
    });
}

export default class ControllerIndex {
    constructor() {
        throw new Error('Can not instantiate. Please use the static members.');
    }

    static async initialize() {
        if (_initialized) throw new Error('Already initialized!')
        _initialized = true;

        window.customElements.define('g-emoji', GEmojiElement);

        FetchInterceptor.register();
        Progress.configure({color: ['#23d160', '#7957d5']});
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

        const {startURL, sitePath} = _cleanLocation();
        const {siteLanguage, route} = _processSitePath(startURL, sitePath);

        await I18n.saveAndChangeLanguage(siteLanguage);

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
                }
            }),
            el: '#app',
            template: '#app-template',
            async created() {
                if (this.$router.currentRoute.fullPath !== route) this.$router.replace(route);
            },
            mounted() {
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
                showUpdateToast() {
                    this.updateToast = this.$buefy.snackbar.open({
                        message: this.$t('Site updated!'),
                        indefinite: true,
                        type: 'is-warning',
                        actionText: this.$t('More Info'),
                        onAction: () => this.$buefy.dialog.confirm({
                            title: this.$t('Site update'),
                            message: this.$t('The site has been updated and reloading it is recommended. Reload?'),
                            confirmText: this.$t('Yes'),
                            type: 'is-warning',
                            hasIcon: true,
                            onConfirm: () => window.location.reload()
                        })
                    });
                },
                onScroll() {
                    this.scrollTopVisible = window.pageYOffset > 0;
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
                scrollTopVisible: false
            }
        });
    }
}