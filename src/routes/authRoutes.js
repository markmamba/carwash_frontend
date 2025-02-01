import LoginPage from "../pages/LoginPage.vue";
import ServicePage from "src/pages/ServicePage.vue";
import AdminLayout from "../layouts/AdminLayout.vue";
import UserManagementPage from "src/pages/UserManagementPage.vue";
import ExpensePage from "src/pages/ExpensePage.vue";
import BookingPage from "src/pages/BookingPage.vue";
import PaymentPage from "src/pages/PaymentPage.vue";
import DashboardPage from "src/pages/DashboardPage.vue";

const authRoutes = [
  {
    path: "/login",
    name: "LoginPage",
    component: LoginPage,
    meta: { title: "Login", requiresAuth: false },
  },
  {
    path: "/",
    component: AdminLayout,
    meta: { requiresAuth: true },
    children: [
      {
        path: "",
        name: "DashboardPage",
        component: DashboardPage,
        meta: { title: "Dashboard", requiresAuth: true },
      },
      {
        path: "services",
        name: "ServiceTable",
        component: ServicePage,
        meta: { title: "Services", requiresAuth: true },
      },
      {
        path: "users",
        name: "UserManagementPage",
        component: UserManagementPage,
        meta: { title: "Users", requiresAuth: true },
      },
      {
        path: "expenses",
        name: "ExpensePage",
        component: ExpensePage,
        meta: { title: "Expenses", requiresAuth: true },
      },
      {
        path: "bookings",
        name: "BookingPage",
        component: BookingPage,
        meta: { title: "Bookings", requiresAuth: true },
      },
      {
        path: "payments",
        name: "PaymentPage",
        component: PaymentPage,
        meta: { title: "Payments", requiresAuth: true },
      },
    ],
  },
];

export default authRoutes;
