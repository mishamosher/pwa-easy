import I18n from "./i18n.js";
import Vue from "../external/js/esm/vue/vue.esm.browser.js";
import VueRouter from "../external/js/esm/vue-router/vue-router.esm.browser.js";

let _vueRouterInstance;

const _createComponent = async (view) => {
    let {default: component} = await import(`${config.rootURL.pathname}controllers/${view}.js`);
    component.template = await (await fetch(`${config.rootURL.pathname}views/${view}.html`)).text();
    return component;
};

class Router {
    constructor() {
        throw new Error('Can not instantiate. Please use the static members.');
    }

    static get vueRouterInstance() {
        return _vueRouterInstance;
    }
}

(() => {
    Vue.use(VueRouter);

    const routes = [{
        path: '/:siteLanguage',
        component: {template: '<router-view/>'},
        children: [
            {
                path: 'site', component: {template: '<router-view/>'}, children: [
                    {path: 'demo', component: () => _createComponent('site/demo')},
                ]
            },
            {path: '*', component: () => _createComponent('404')}
        ]
    }, {
        path: '*', redirect() {
            return `/${I18n.savedOrPreferredLanguage}`;
        }
    }];

    _vueRouterInstance = new VueRouter({
        mode: 'history',
        base: config.rootURL.pathname,
        routes, // short for `routes: routes`
        scrollBehavior: (to, from, savedPosition) => {
            if (savedPosition) return savedPosition;
            else if (to.hash) return {selector: to.hash};
            else return {x: 0, y: 0};
        }
    });
})();

export default Router;