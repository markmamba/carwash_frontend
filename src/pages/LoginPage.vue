<template>
  <q-page class="flex flex-center" style="background-color: aliceblue">
    <q-card class="q-pa-md" style="width: 400px; height: auto">
      <q-card-section>
        <div class="text-h6" style="text-align: center">Scorpio Carwash</div>
      </q-card-section>

      <q-card-section class="q-mt-md">
        <form @keyup.enter="loginUser">
          <q-input filled v-model="username" label="Username" class="q-mb-md" />
          <q-input
            filled
            v-model="password"
            type="password"
            label="Password"
            class="q-mb-md"
          />
        </form>
      </q-card-section>

      <q-card-actions class="q-mb-md">
        <q-btn @click="loginUser" label="Login" color="primary" />
      </q-card-actions>

      <q-card-section v-if="errorMessage" class="text-negative">
        {{ errorMessage }}
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script>
import { mapActions } from "vuex";

export default {
  name: "LoginPage",
  data() {
    return {
      username: "",
      password: "",
      errorMessage: "",
    };
  },
  methods: {
    ...mapActions(["login"]),

    async loginUser() {
      try {
        const data = await this.login({
          username: this.username,
          password: this.password,
        });

        localStorage.setItem("authToken", data.access);
        localStorage.setItem("user", JSON.stringify(data.user));

        this.$store.dispatch("checkAuth");

        this.$router.push("/services");
      } catch (error) {
        console.error(error);
        this.errorMessage = error.non_field_errors?.[0] || "Login failed";
      }
    },
  },
};
</script>
