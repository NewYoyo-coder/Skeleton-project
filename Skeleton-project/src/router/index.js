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
    {
      path: "/test1",
      name: "test1",
      component: () => import("../components/json-test.vue"),
    },
    {
      path: "/test2",
      name: "test2",
      component: () => import("../components/json-test2.vue"),
    },
  ],
});

export default router;