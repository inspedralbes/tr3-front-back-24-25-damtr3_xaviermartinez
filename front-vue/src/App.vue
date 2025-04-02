<template>
  <v-app>
    <!-- Fondo animado de bombas -->
    <div class="bomb-background">
      <div v-for="i in 20" :key="i" class="floating-bomb" :style="randomBombStyle()">💣</div>
    </div>

    <!-- Barra de navegación -->
    <v-app-bar app color="primary" dark elevation="4">
      <v-app-bar-title class="text-h4 font-weight-bold">
        <v-icon large class="mr-2">mdi-bomb</v-icon>
        Bomberman Stats
      </v-app-bar-title>
      
      <v-spacer></v-spacer>
      
      <v-tabs>
        <v-tab to="/">
          <v-icon left>mdi-chart-box</v-icon>
          Estadísticas
        </v-tab>
        <v-tab to="/achievements">
          <v-icon left>mdi-trophy</v-icon>
          Logros
        </v-tab>
        <v-tab to="/leaderboard">
          <v-icon left>mdi-podium</v-icon>
          Ranking
        </v-tab>
      </v-tabs>
    </v-app-bar>

    <!-- Contenido principal -->
    <v-main>
      <v-container fluid>
        <router-view></router-view>
      </v-container>
    </v-main>

    <!-- Footer -->
    <v-footer app color="primary" dark class="text-center">
      <v-row justify="center" no-gutters>
        <v-col class="text-center">
          <span>Bomberman Stats &copy; {{ new Date().getFullYear() }}</span>
        </v-col>
      </v-row>
    </v-footer>
  </v-app>
</template>

<script>
export default {
  name: 'App',
  methods: {
    randomBombStyle() {
      const size = Math.random() * 30 + 20 // 20-50px
      const duration = Math.random() * 20 + 10 // 10-30s
      const delay = Math.random() * -20 // Random start time
      const startX = Math.random() * 100 // Random start position
      
      return {
        fontSize: `${size}px`,
        animation: `float ${duration}s ${delay}s infinite linear`,
        left: `${startX}vw`,
        opacity: '0.1'
      }
    }
  }
}
</script>

<style>
.bomb-background {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
  overflow: hidden;
}

.floating-bomb {
  position: absolute;
  animation: float 20s linear infinite;
}

@keyframes float {
  0% {
    transform: translateY(100vh) rotate(0deg);
    opacity: 0.1;
  }
  100% {
    transform: translateY(-100px) rotate(360deg);
    opacity: 0;
  }
}

.v-main {
  position: relative;
  z-index: 1;
}
</style>
