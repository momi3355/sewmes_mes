import { createApp } from "vue";
import { createPinia } from "pinia";

// Vuetify
import "vuetify/styles";
import { createVuetify } from "vuetify";
import * as components from "vuetify/components";
import * as directives from "vuetify/directives";

// vue-sidebar
import VueSidebarMenu from "vue-sidebar-menu";
import "vue-sidebar-menu/dist/vue-sidebar-menu.css";

import App from "./App.vue";
import router from "./router";

const app = createApp(App);

const vuetify = createVuetify({
  components,
  directives,
});

app.use(createPinia());
app.use(router);
app.use(vuetify);
app.use(VueSidebarMenu);

app.mount("#app");
