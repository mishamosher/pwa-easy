//* The next line is generated by generate-precache-bundle.sh. Please don't modify/delete it, modify the generator script instead
importScripts('./bundle/precacheBundle-HASH.js', './bundle/precacheList-HASH.js');

const rootURL = new URL('./', self.location.href);

importScripts(
    './external/js/global/workbox/workbox-sw.js',
    './external/js/global/pako/pako_inflate.js',
    './external/js/global/zip-stream/read.js',
    './external/js/global/mime/index.js'
);

workbox.setConfig({
    modulePathPrefix: `${rootURL.pathname}external/js/global/workbox/`
});

workbox.loadModule('workbox-precaching');
workbox.loadModule('workbox-routing');
workbox.loadModule('workbox-core');
workbox.loadModule('workbox-strategies');
workbox.loadModule('workbox-expiration');

const precacheController = new workbox.precaching.PrecacheController();
precacheController.addToCacheList(precacheList);

class SWHelper {
    static async install() {
        await SWHelper.updateCacheFromZipBundle();
        await precacheController.install();
        self.skipWaiting();
    }

    static async activate() {
        await precacheController.activate();
        await self.clients.claim();
    }

    static fetch(event) {
        const precachedURL = SWHelper.precacheKey(event.request.url);
        if (!precachedURL) return;
        event.respondWith(SWHelper.cachedResponse(precachedURL));
    }

    static precacheKey(url) {
        for (const urlVariation of SWHelper.urlVariations(url)) {
            const possibleCacheKey = precacheController.getCacheKeyForURL(urlVariation);
            if (possibleCacheKey) return possibleCacheKey;
        }
    }

    static* urlVariations(url) {
        url = new URL(url, location.href);
        url.hash = ''; // never sent to server, so let's always remove it
        yield url.href;

        if ('localhost' !== self.location.hostname) { // if running from production, try to retrieve minified resources
            let extension = url.pathname.split('.').pop();
            if (['js', 'mjs', 'css'].includes(extension)) {
                const minUrl = new URL(url.href);
                minUrl.pathname = `${url.pathname.slice(0, -extension.length)}min.${extension}`;
                yield minUrl.href;
            }
        }
    }

    static async cachedResponse(cacheKey) {
        const cache = await self.caches.open(workbox.core.cacheNames.precache);
        return cache.match(cacheKey);
    }

    static async updateCacheFromZipBundle() {
        const cache = await self.caches.open(workbox.core.cacheNames.precache);
        const alreadyCachedRequests = await cache.keys();
        const existingCacheKeys = new Set(alreadyCachedRequests.map(request => request.url));

        const toBePrecached = new Map();
        for (const [url, cacheKey] of precacheController.getURLsToCacheKeys()) {
            if (!existingCacheKeys.has(cacheKey)) toBePrecached.set(url, cacheKey);
        }

        if (toBePrecached.size > 0) {
            await SWHelper.unpackZippedBundle(new Map(toBePrecached), cache);
        }
    }

    static arrayBufferToHex(buffer) {
        return [...new Uint8Array(buffer)]
            .map(b => b.toString(16).padStart(2, "0"))
            .join("");
    }

    static async unpackZippedBundle(toBePrecached, cache) {
        let zipBlob;
        let trusted;
        try {
            const response = await fetch(`${rootURL.href}${precacheBundle.url}`);
            zipBlob = await response.blob();

            const digest = await crypto.subtle.digest('SHA-384', await zipBlob.arrayBuffer())
            const hash = SWHelper.arrayBufferToHex(digest);

            if (hash !== precacheBundle.revision) {
                console.warn(`The zipped bundle hash ${hash} doesn't match with the revision ${precacheBundle.revision}. Unzipping with extra checks.`);
                trusted = false;
            } else trusted = true;
        } catch (e) {
            console.warn(`Something went wrong while retrieving the zipped bundle. ${e}`);
            return;
        }

        const promises = [];

        const cacheData = entry => {
            if (entry.directory) return null;

            const entryName = entry.name;
            const entryUrl = `${rootURL.href}${entryName === 'index.html' ? '' : entryName}`;
            if (!toBePrecached.has(entryUrl)) return null;

            const entryKey = toBePrecached.get(entryUrl);
            toBePrecached.delete(entryUrl);

            return {entryUrl, entryKey};
        }

        if (trusted) {
            for await (const entry of ZipBlobReader(zipBlob)) {
                const cd = cacheData(entry);
                if (cd === null) continue;

                promises.push(cache.put(cd.entryKey, SWHelper.zipResponse(entry.stream(), cd.entryUrl, entry)));
            }
        } else {
            try {
                for await (const entry of ZipBlobReader(zipBlob)) {
                    const cd = cacheData(entry);
                    if (cd === null) continue;

                    promises.push(SWHelper.putToCache(cache, entry, cd.entryUrl, cd.entryKey));
                }
            } catch (e) {
                console.warn(`The zipped bundle could not be unzipped without errors. ${e}`)
            }
        }

        await Promise.all(promises);
    }

    static async putToCache(cache, entry, entryUrl, entryKey) {
        const entryRevision = (new URL(entryKey)).searchParams.get('__WB_REVISION__');

        if (entryRevision === entry.comment) {
            const ab = await entry.arrayBuffer();

            const digest = await crypto.subtle.digest('SHA-384', ab);
            const hash = SWHelper.arrayBufferToHex(digest);

            if (hash === entryRevision) {
                try {
                    await cache.put(entryKey, SWHelper.zipResponse(entry.stream(), entryUrl, entry));
                } catch (e) {
                    console.warn(`Couldn't cache ${entry.name} from the zip bundle. ${e}`);
                }
            } else {
                console.warn(`The entry ${entry.name} has been tampered. Skipping.`);
            }
        } else {
            console.warn(`The entry ${entry.name} from the zip bundle has a revision ${entry.comment} that doesn't match with the expected revision ${entryRevision}. Skipping entry.`);
        }
    }

    static zipResponse(resource, entryUrl, entry) {
        return new Response(resource, {
            headers: {
                'Content-Type': entryUrl === rootURL.href ? mime.getType('html') : mime.getType(entryUrl) || 'application/octet-stream',
                'Content-Length': entry.size,
                'Last-Modified': entry.lastModifiedDate.toUTCString()
            }
        });
    }

    static registerWorkbox() {
        /**
         * Handle all the browser navigation requests and redirect to the rootURL with routing information if not there already.
         * This allows to have "pretty URLs".
         *
         * Example:
         *  - Website is served from https://example.com/app/
         *  - User requests https://example.com/app/user/about?id=1#avatar
         *  - ServiceWorker responds with a temporary redirection to https://example.com/app/?sitePath=user/about&id=1#avatar
         *  - The redirected URL now points to a precached resource, https://example.com/app/index.html, which is served
         *  - Now controller/index.js can perform a window.history.(pushState|replaceState) with the help of sitePath
         */
        const handler = precacheController.createHandlerBoundToURL(rootURL.pathname);
        const navigationRoute = new workbox.routing.NavigationRoute(async context => {
            if (context.url.pathname === `${rootURL.pathname}index.html`) return Response.redirect(rootURL.pathname);
            if (context.url.pathname !== rootURL.pathname) {
                const redirectURL = new URL(context.url.href);
                redirectURL.hash = ''; // web servers never receive the URL hash
                redirectURL.pathname = rootURL.pathname;
                redirectURL.searchParams.set('sitePath', context.url.pathname.substring(rootURL.pathname.length))
                return Response.redirect(redirectURL.href);
            }
            return await handler(context);
        });
        workbox.routing.registerRoute(navigationRoute);

        // use a StaleWhileRevalidate strategy for external resources that are not precached
        workbox.routing.registerRoute(({url}) => url.href.startsWith(`${rootURL.href}external/`), new workbox.strategies.StaleWhileRevalidate());

        // use a StaleWhileRevalidate strategy with expiration for all the requests not matched by any other rule
        workbox.routing.setDefaultHandler(new workbox.strategies.StaleWhileRevalidate({
            cacheName: `${workbox.core.cacheNames.prefix}-runtime-default-${workbox.core.cacheNames.suffix}`,
            plugins: [
                new workbox.expiration.ExpirationPlugin({
                    maxEntries: 100,
                    maxAgeSeconds: 7 * 24 * 60 * 60 // one week
                })
            ]
        }));
    }
}

self.addEventListener('install', event => {
    event.waitUntil(SWHelper.install());
});

self.addEventListener('activate', event => {
    event.waitUntil(SWHelper.activate());
});

self.addEventListener('fetch', event => {
    SWHelper.fetch(event);
});

SWHelper.registerWorkbox();