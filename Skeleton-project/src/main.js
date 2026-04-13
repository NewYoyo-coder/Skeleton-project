// import './assets/main.css'
import { createApp } from "vue";
import { createPinia } from "pinia";
import App from "./App.vue";
import router from "./router";
import { ask, notify } from "@/utils/overlay";

import "bootstrap-icons/font/bootstrap-icons.css";
import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";
import VueApexCharts from "vue3-apexcharts";
import "./assets/style.css";

const app = createApp(App);

// 🚀 전역 프로퍼티로 등록 (접두사 $를 붙이는 게 관례입니다)
app.config.globalProperties.$ask = ask;
app.config.globalProperties.$notify = notify;

app.use(createPinia());
app.use(VueApexCharts);
app.use(router);

app.mount("#app");
