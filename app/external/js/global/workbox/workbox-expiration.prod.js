this.workbox=this.workbox||{},this.workbox.expiration=function(t,s,e,i,a,n,h){"use strict";try{self["workbox:expiration:6.1.0"]&&_()}catch(t){}const r="cache-entries",c=t=>{const s=new URL(t,location.href);return s.hash="",s.href};class o{constructor(t){this.T=t,this.i=new i.DBWrapper("workbox-expiration",1,{onupgradeneeded:t=>this.M(t)})}M(t){const s=t.target.result.createObjectStore(r,{keyPath:"id"});s.createIndex("cacheName","cacheName",{unique:!1}),s.createIndex("timestamp","timestamp",{unique:!1}),a.deleteDatabase(this.T)}async setTimestamp(t,s){const e={url:t=c(t),timestamp:s,cacheName:this.T,id:this.F(t)};await this.i.put(r,e)}async getTimestamp(t){return(await this.i.get(r,this.F(t))).timestamp}async expireEntries(t,s){const e=await this.i.transaction(r,"readwrite",((e,i)=>{const a=e.objectStore(r).index("timestamp").openCursor(null,"prev"),n=[];let h=0;a.onsuccess=()=>{const e=a.result;if(e){const i=e.value;i.cacheName===this.T&&(t&&i.timestamp<t||s&&h>=s?n.push(e.value):h++),e.continue()}else i(n)}})),i=[];for(const t of e)await this.i.delete(r,t.id),i.push(t.url);return i}F(t){return this.T+"|"+c(t)}}class u{constructor(t,s={}){this.H=!1,this.I=!1,this.G=s.maxEntries,this.J=s.maxAgeSeconds,this.V=s.matchOptions,this.T=t,this.W=new o(t)}async expireEntries(){if(this.H)return void(this.I=!0);this.H=!0;const t=this.J?Date.now()-1e3*this.J:0,e=await this.W.expireEntries(t,this.G),i=await self.caches.open(this.T);for(const t of e)await i.delete(t,this.V);this.H=!1,this.I&&(this.I=!1,s.dontWaitFor(this.expireEntries()))}async updateTimestamp(t){await this.W.setTimestamp(t,Date.now())}async isURLExpired(t){if(this.J){return await this.W.getTimestamp(t)<Date.now()-1e3*this.J}return!1}async delete(){this.I=!1,await this.W.expireEntries(1/0)}}return t.CacheExpiration=u,t.ExpirationPlugin=class{constructor(t={}){this.cachedResponseWillBeUsed=async({event:t,request:e,cacheName:i,cachedResponse:a})=>{if(!a)return null;const n=this.X(a),h=this.Y(i);s.dontWaitFor(h.expireEntries());const r=h.updateTimestamp(e.url);if(t)try{t.waitUntil(r)}catch(t){}return n?a:null},this.cacheDidUpdate=async({cacheName:t,request:s})=>{const e=this.Y(t);await e.updateTimestamp(s.url),await e.expireEntries()},this.Z=t,this.J=t.maxAgeSeconds,this.$=new Map,t.purgeOnQuotaError&&h.registerQuotaErrorCallback((()=>this.deleteCacheAndMetadata()))}Y(t){if(t===n.cacheNames.getRuntimeName())throw new e.WorkboxError("expire-custom-caches-only");let s=this.$.get(t);return s||(s=new u(t,this.Z),this.$.set(t,s)),s}X(t){if(!this.J)return!0;const s=this.tt(t);if(null===s)return!0;return s>=Date.now()-1e3*this.J}tt(t){if(!t.headers.has("date"))return null;const s=t.headers.get("date"),e=new Date(s).getTime();return isNaN(e)?null:e}async deleteCacheAndMetadata(){for(const[t,s]of this.$)await self.caches.delete(t),await s.delete();this.$=new Map}},t}({},workbox.core._private,workbox.core._private,workbox.core._private,workbox.core._private,workbox.core._private,workbox.core);
