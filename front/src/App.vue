<template>
  <v-app>
    <!-- Fondo animado de bombas -->
    <div class="bomb-background">
      <div v-for="n in 20" :key="n" class="bomb" 
           :style="{ 
             left: `${Math.random() * 100}%`,
             animationDelay: `${Math.random() * 10}s`,
             animationDuration: `${15 + Math.random() * 10}s`
           }">
      </div>
    </div>

    <!-- Barra de navegación -->
    <v-app-bar app elevation="0">
      <v-container class="d-flex align-center">
        <v-app-bar-title class="game-title">
          <v-icon icon="mdi-bomb" class="mr-2" color="error"/>
          Bomberman Stats
        </v-app-bar-title>
        <v-spacer></v-spacer>
        <v-btn to="/" class="mx-2" variant="text">
          <v-icon icon="mdi-home" class="mr-2"/>
          Home
        </v-btn>
        <v-btn to="/ranking" class="mx-2" variant="text">
          <v-icon icon="mdi-trophy" class="mr-2"/>
          Ranking
        </v-btn>
      </v-container>
    </v-app-bar>

    <!-- Contenido principal -->
    <v-main>
      <v-container class="py-8">
        <router-view v-slot="{ Component }">
          <transition name="fade" mode="out-in">
            <component :is="Component" />
          </transition>
        </router-view>
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer app class="text-center d-flex flex-column">
      <div>
        <v-btn
          v-for="icon in icons"
          :key="icon.icon"
          :href="icon.link"
          target="_blank"
          class="mx-2"
          icon
          variant="plain"
        >
          <v-icon>{{ icon.icon }}</v-icon>
        </v-btn>
      </div>
      <div class="px-4 py-2 text-center w-100">
        {{ new Date().getFullYear() }} — <strong>Bomberman Stats</strong>
      </div>
    </v-footer>
  </v-app>
</template>

<script setup>
const icons = [
  {
    icon: 'mdi-github',
    link: 'https://github.com/orgs/inspedralbes/teams/damtr3_xaviermartinez'
  },
  {
    icon: 'mdi-linkedin',
    link: 'https://www.linkedin.com/in/xaviermateumartinez/'
  }
]
</script>

<style>
@import './assets/main.css';

/* Transiciones de página */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
