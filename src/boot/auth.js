import { boot } from "quasar/wrappers";
import store from "../store/auth_management";

export default boot(({ app }) => {
  store.dispatch("checkAuth");
  app.use(store);
});
