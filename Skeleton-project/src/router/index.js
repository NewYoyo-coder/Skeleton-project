import { createRouter, createWebHistory } from "vue-router";
import JsonTest from "../components/json-test.vue";

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: "/",
      name: "home",
      component: JsonTest,
    },
  ],
});

export default router;
