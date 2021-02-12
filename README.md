# PWA Easy

This project is a MIT licensed template for creating a multi-language PWA without the complications of a packager, transpiler and whatnot.

You'll need to get updated on the following frameworks/technologies, because this template depends on them:

* [Modern JavaScript (ECMAScript 2020+)](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Language_Resources)
* [VueJS](https://vuejs.org/)
* [Vuetify](https://vuetifyjs.com/)

## Requirements

* The willpower
* A recent version of Chrome, Edge, Firefox or Safari (mid 2020+)
* A `*nix` shell

> Be aware that as of July 2020, PWAs have [various limitations](https://yourstory.com/mystory/crucial-limitations-pwa-ios) on iOS.

## Skeleton of the template

The following are folders and files that contain the main logic of the application:

```
PWA Easy\app
├───components  -> the VueJS components of the app
├───config      -> global settings
├───controllers -> VueJS controllers for the views
├───external    -> external resources and libraries
├───img         -> image resources
├───lang        -> language resources
├───utils       -> utilities used by the app
├───views       -> views written in HTML + VueJS template
└───index.html  -> entry point of the app
```

A Service Worker, `app\service-worker.js`, contains the necessary logic for serving the app offline. [Workbox](https://developers.google.com/web/tools/workbox/) is used to abstract and simplify its logic.

## Getting started

There are a couple of demonstrative pages pre-made for you to play with. The source code is generally verbose to make it easier to learn by examination and experimentation.

You'll need to serve the project from `localhost` or a `https` site, as per PWA requirements. To enable SPA navigation the user has to first visit the root directory at least once, or you can deploy a rewrite rule on the web server.

Sample server configuration files are provided:
- For Apache: `app\.htaccess`
- For NGINX: `nginx.conf`

The entire app (except for `app\service-worker.js`) makes heavy usage of JavaScript modules and a bunch of APIs that form a core part of 2020+ web browsers.

## Deploying the PWA

After personalizing the template you'll need to generate a bundle for the project, which is achieved by executing the `scripts\generate-precache-bundle.sh` script (_should_ work on any `*nix` shell, tested only on Ubuntu 20.04). This generates a series of files in the `app\bundle` directory that are required by `app\service-worker.js`.

Please note that it is **not** required to make any modification to the template if you only want to test it, just do not forget to generate a bundle first!

Of the **files** in the app directory, only `index.html` and `service-worker.js` are required. You can safely skip all the other files when uploading the app to a web server. Note that it is not the case with the **folders** in the app directory.  

## Various

* A personal web page of mine made with **PWA Easy** is running [here](https://mishamosher.com/).
* The size of the base PWA, bundled, is a bit less than 3 MiB. This includes the OpenMoji font.

## Libraries and frameworks used (kudos to 'em!)

> JavaScript ES modules

* [VueJS](https://vuejs.org/)
* [Vue I18n](https://github.com/kazupon/vue-i18n)
* [Vue Router](https://github.com/vuejs/vue-router)
* [Vuetify](https://vuetifyjs.com/)
  * Wrapped as an ES module
* [fetch-interceptor](https://github.com/itsfadnis/fetch-interceptor/)
  * Improved and rewritten as an ES module
* [Progressbar](https://github.com/shashibeit/progressbar/)
  * Modified and rewritten as an ES Module

> JavaScript globalThis modules

* [Mime](https://github.com/broofa/mime/)
  * Rewritten as single file class
* [Pako](https://github.com/nodeca/pako/)
  * Only the inflator is used
* [Workbox](https://github.com/GoogleChrome/workbox/)
* [Conflux](https://github.com/transcend-io/conflux)
  * Only a slightly modified reader is used

> Non JavaScript

* [OpenMoji font](https://github.com/hfg-gmuend/openmoji/)
* [Font Awesome](https://github.com/FortAwesome/Font-Awesome)
* [Roboto font](https://github.com/googlefonts/roboto)

## Helpful links
* [PWA](https://developer.mozilla.org/en-US/docs/Web/Progressive_web_apps)
* [SPA](https://developer.mozilla.org/en-US/docs/Glossary/SPA)
* [Service Workers](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
* [JavaScript Modules](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
* [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API)
* [ECMAScript® 2020 Language Specification](https://262.ecma-international.org/11.0/)