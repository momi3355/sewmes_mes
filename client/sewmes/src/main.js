import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";
import ArgonDashboard from "./argon-dashboard";

const appInstance = createApp(App);

// 새로고침 시 localStorage 확인해서 Vuex 복구
const userData = sessionStorage.getItem('user');
if (userData) {
  store.dispatch('saveUser', JSON.parse(userData));
}

appInstance.use(store);
appInstance.use(router);
appInstance.use(ArgonDashboard);
appInstance.mount("#app");

