import { createRouter, createWebHistory, RouteRecordRaw } from "vue-router";
import HomeView from "../views/HomeView.vue";

const routes: Array<RouteRecordRaw> = [
  {
    path: "/",
    name: "home",
    component: HomeView,
  },
  {
    path: "/deposit",
    name: "deposit",
    component: () => import("../views/DepositView.vue"),
  },
  {
    path: "/payment-history",
    name: "payment-history",
    component: () => import("../views/PayHistoryView.vue"),
  },
  {
    path: "/referal",
    name: "referal",
    component: () => import("../views/ReferalsView.vue"),
  },
  {
    path: "/buyVPN",
    name: "buyVPN",
    component: () => import("../views/BuyVpnView.vue"),
  },
  {
    path: "/installVPN",
    name: "installVPN",
    component: () => import("../views/InstallView.vue"),
  },
  {
    path: "/installVPNFree",
    name: "installVPNFree",
    component: () => import("../views/InstallViewFree.vue"),
  },
  {
    path: "/faq",
    name: "faq",
    component: () => import("../views/FAQView.vue"),
  },
  {
    path: "/tasks",
    name: "tasks",
    component: () => import("../views/TasksView.vue"),
  },
];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes,
});

export default router;
