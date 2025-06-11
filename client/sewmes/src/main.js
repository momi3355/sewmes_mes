import { createApp } from "vue";
import App from "./App.vue";
import store from "./store";
import router from "./router";
import "./assets/css/nucleo-icons.css";
import "./assets/css/nucleo-svg.css";
import ArgonDashboard from "./argon-dashboard";
import VueSweetalert2 from 'vue-sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';

const appInstance = createApp(App);

// 새로고침 시 localStorage 확인해서 Vuex 복구
const userData = localStorage.getItem('user');
if (userData) {
  store.dispatch('saveUser', JSON.parse(userData));
}

appInstance.use(store);
appInstance.use(router);
appInstance.use(ArgonDashboard);
appInstance.use(VueSweetalert2);
appInstance.mount("#app");

