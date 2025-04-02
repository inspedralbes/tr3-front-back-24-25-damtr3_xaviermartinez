<template>
  <v-container>
    <!-- Tarjetas de resumen -->
    <v-row>
      <v-col cols="12" md="3">
        <v-card class="mx-auto" color="primary">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold white--text">
              {{ stats.totalGames }}
            </div>
            <div class="text-subtitle-1 white--text">
              Partidas Jugadas
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="mx-auto" color="success">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold white--text">
              {{ stats.winRate }}%
            </div>
            <div class="text-subtitle-1 white--text">
              Ratio de Victorias
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="mx-auto" color="warning">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold white--text">
              {{ stats.totalKills }}
            </div>
            <div class="text-subtitle-1 white--text">
              Enemigos Eliminados
            </div>
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="3">
        <v-card class="mx-auto" color="error">
          <v-card-text class="text-center">
            <div class="text-h4 font-weight-bold white--text">
              {{ stats.totalBombs }}
            </div>
            <div class="text-subtitle-1 white--text">
              Bombas Colocadas
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Gráficos -->
    <v-row class="mt-4">
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon left color="primary">mdi-chart-line</v-icon>
            Progreso por Temporada
          </v-card-title>
          <v-card-text>
            <Line :data="seasonProgressData" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon left color="primary">mdi-chart-arc</v-icon>
            Distribución de Powerups
          </v-card-title>
          <v-card-text>
            <Doughnut :data="powerupsData" :options="chartOptions" />
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Historial de partidas -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left color="primary">mdi-history</v-icon>
            Últimas Partidas
            <v-spacer></v-spacer>
            <v-text-field
              v-model="search"
              append-icon="mdi-magnify"
              label="Buscar"
              single-line
              hide-details
            ></v-text-field>
          </v-card-title>

          <v-data-table
            :headers="headers"
            :items="gameHistory"
            :search="search"
            :items-per-page="5"
          >
            <!-- Columna de Resultado -->
            <template v-slot:item.result="{ item }">
              <v-chip
                :color="getResultColor(item.raw.result)"
                dark
              >
                {{ item.raw.result }}
              </v-chip>
            </template>

            <!-- Columna de Duración -->
            <template v-slot:item.duration="{ item }">
              {{ formatDuration(item.raw.duration) }}
            </template>

            <!-- Columna de Fecha -->
            <template v-slot:item.date="{ item }">
              {{ formatDate(item.raw.date) }}
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>

    <!-- Logros recientes -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left color="primary">mdi-trophy</v-icon>
            Últimos Logros Desbloqueados
          </v-card-title>
          
          <v-timeline density="compact" align="start">
            <v-timeline-item
              v-for="achievement in recentAchievements"
              :key="achievement.name"
              :dot-color="achievement.color"
              size="small"
            >
              <template v-slot:opposite>
                {{ formatDate(achievement.dateUnlocked) }}
              </template>
              
              <v-card class="elevation-1">
                <v-card-title class="text-subtitle-1">
                  {{ achievement.name }}
                </v-card-title>
                <v-card-text>
                  {{ achievement.description }}
                </v-card-text>
              </v-card>
            </v-timeline-item>
          </v-timeline>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import { Line, Doughnut } from 'vue-chartjs'
import axios from 'axios'

export default {
  name: 'StatsView',
  components: { Line, Doughnut },

  setup() {
    const stats = ref({
      totalGames: 0,
      winRate: 0,
      totalKills: 0,
      totalBombs: 0
    })

    const search = ref('')
    const gameHistory = ref([])
    const recentAchievements = ref([])

    const headers = [
      { title: 'Fecha', key: 'date', align: 'start' },
      { title: 'Mapa', key: 'mapName' },
      { title: 'Resultado', key: 'result' },
      { title: 'Duración', key: 'duration' },
      { title: 'Kills', key: 'kills' },
      { title: 'Bombas', key: 'bombsPlaced' },
      { title: 'Bloques', key: 'blocksDestroyed' }
    ]

    const chartOptions = {
      responsive: true,
      maintainAspectRatio: false
    }

    const seasonProgressData = {
      labels: ['T1', 'T2', 'T3', 'T4', 'T5'],
      datasets: [{
        label: 'Puntos por Temporada',
        data: [1200, 1400, 1800, 1600, 2000],
        borderColor: '#1976D2',
        tension: 0.4
      }]
    }

    const powerupsData = {
      labels: ['Más Bombas', 'Velocidad', 'Poder', 'Escudo'],
      datasets: [{
        data: [30, 25, 20, 15],
        backgroundColor: ['#1976D2', '#43A047', '#FB8C00', '#E53935']
      }]
    }

    const getResultColor = (result) => {
      const colors = {
        'Victoria': 'success',
        'Derrota': 'error',
        'Empate': 'warning'
      }
      return colors[result] || 'grey'
    }

    const formatDuration = (seconds) => {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        hour: '2-digit',
        minute: '2-digit'
      })
    }

    const loadStats = async () => {
      try {
        const response = await axios.get('/api/stats')
        const data = response.data

        // Actualizar estadísticas generales
        stats.value = {
          totalGames: data.gamesPlayed,
          winRate: Math.round((data.seasonStats.wins / data.gamesPlayed) * 100),
          totalKills: data.kills,
          totalBombs: data.bombsPlaced
        }

        // Actualizar historial de partidas
        gameHistory.value = data.gameHistory

        // Actualizar logros recientes
        recentAchievements.value = data.achievements
          .sort((a, b) => new Date(b.dateUnlocked) - new Date(a.dateUnlocked))
          .slice(0, 5)
      } catch (error) {
        console.error('Error cargando estadísticas:', error)
      }
    }

    onMounted(() => {
      loadStats()
    })

    return {
      stats,
      search,
      headers,
      gameHistory,
      recentAchievements,
      chartOptions,
      seasonProgressData,
      powerupsData,
      getResultColor,
      formatDuration,
      formatDate
    }
  }
}
</script>

<style scoped>
.v-card {
  transition: transform 0.2s;
}

.v-card:hover {
  transform: translateY(-5px);
}
</style>
