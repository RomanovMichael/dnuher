import { createApp } from "vue";
import { createPinia } from "pinia";
import router from "./router";
import App from "./App.vue";
import "./style.css";
// убьём возможные SW/CacheStorage, если когда-то включались
if ("serviceWorker" in navigator) {
  navigator.serviceWorker
    .getRegistrations()
    .then((rs) => rs.forEach((r) => r.unregister()))
    .catch(() => {});
}
if ("caches" in window) {
  caches
    .keys()
    .then((keys) => Promise.all(keys.map((k) => caches.delete(k))))
    .catch(() => {});
}

const app = createApp(App);

app.use(createPinia());
app.use(router);

app.mount("#app");
