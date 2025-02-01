<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          aria-label="Menu"
          @click="toggleLeftDrawer"
        />
        <q-toolbar-title style="margin-left: 10px">
          {{ title }}
          <!-- Display the page title here -->
        </q-toolbar-title>
        <q-space />
      </q-toolbar>
    </q-header>

    <q-drawer show-if-above v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-toolbar-title class="title-style" style="margin: 20px 0 0 20px"
          >Scorpio Carwash</q-toolbar-title
        >
        <q-item-label header>Menu</q-item-label>
        <q-item
          style="font-size: 16px; color: cadetblue; font-weight: bold"
          to="/"
        >
          Dashboard
        </q-item>
        <q-separator />
        <q-item
          style="font-size: 16px; color: cadetblue; font-weight: bold"
          to="/bookings"
        >
          Bookings
        </q-item>
        <q-separator />
        <q-item
          style="font-size: 16px; color: cadetblue; font-weight: bold"
          to="/services"
        >
          Services
        </q-item>
        <q-separator />
        <q-item
          style="font-size: 16px; color: cadetblue; font-weight: bold"
          to="/expenses"
        >
          Expenses
        </q-item>
        <q-separator />
        <q-item
          style="font-size: 16px; color: cadetblue; font-weight: bold"
          to="/users"
        >
          Users
        </q-item>
        <q-separator />
        <q-item
          style="font-size: 16px; color: cadetblue; font-weight: bold"
          to="/payments"
        >
          Payments
        </q-item>

        <q-separator />
        <q-item
          style="font-size: 16px; color: cadetblue; font-weight: bold"
          @click="logoutUser"
          to="/login"
        >
          Logout
        </q-item>
      </q-list>
    </q-drawer>

    <q-page-container>
      <router-view :key="$route.fullPath" :title="title" />
      <!-- Pass title to child -->
    </q-page-container>
  </q-layout>
</template>

<script setup>
import { ref, watch } from "vue";
import { useRoute } from "vue-router";
import { useStore } from "vuex"; // Import useStore to access Vuex store

defineOptions({
  name: "AdminLayout",
});

const leftDrawerOpen = ref(false);
const route = useRoute();
const title = ref(route.meta.title || "");
const store = useStore(); // Use the store

watch(
  () => route.meta.title,
  (newTitle) => {
    title.value = newTitle;
  }
);

function toggleLeftDrawer() {
  leftDrawerOpen.value = !leftDrawerOpen.value;
}

// Logout function
async function logoutUser() {
  await store.dispatch("logout");
}
</script>

<style scoped>
.title-style {
  font-weight: bold;
}
</style>
