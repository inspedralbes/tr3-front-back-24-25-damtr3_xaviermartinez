<template>
  <div>
    <v-row>
      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-chart-bar</v-icon>
            Bombas Colocadas por Jugador
          </v-card-title>
          <v-card-text>
            <Bar
              :chart-options="chartOptions"
              :chart-data="bombsChartData"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12" md="6">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-chart-line</v-icon>
            Bloques Destruidos por Jugador
          </v-card-title>
          <v-card-text>
            <Bar
              :chart-options="chartOptions"
              :chart-data="blocksChartData"
            />
          </v-card-text>
        </v-card>
      </v-col>

      <v-col cols="12">
        <v-card>
          <v-card-title>
            <v-icon left>mdi-trophy</v-icon>
            Historial de Partidas
          </v-card-title>
          <v-card-text>
            <v-data-table
              :headers="headers"
              :items="gameHistory"
              :items-per-page="5"
              class="elevation-1"
            >
              <template v-slot:item.result="{ item }">
                <v-chip
                  :color="item.raw.result === 'win' ? 'success' : 'error'"
                  text-color="white"
                >
                  {{ item.raw.result === 'win' ? 'Victoria' : 'Derrota' }}
                </v-chip>
              </template>
              <template v-slot:item.duration="{ item }">
                {{ formatDuration(item.raw.duration) }}
              </template>
            </v-data-table>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>
  </div>
</template>

<script>
import { Bar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend } from 'chart.js'
import axios from 'axios'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

export default {
  name: 'Stats',
  components: { Bar },

  data() {
    return {
      stats: [],
      chartOptions: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: false
          }
        }
      },
      headers: [
        { title: 'Jugador', key: 'player' },
        { title: 'Mapa', key: 'mapName' },
        { title: 'Duración', key: 'duration' },
        { title: 'Resultado', key: 'result' }
      ]
    }
  },

  computed: {
    bombsChartData() {
      return {
        labels: this.stats.map(s => s.player),
        datasets: [{
          data: this.stats.map(s => s.bombsPlaced),
          backgroundColor: '#1976D2'
        }]
      }
    },

    blocksChartData() {
      return {
        labels: this.stats.map(s => s.player),
        datasets: [{
          data: this.stats.map(s => s.blocksDestroyed),
          backgroundColor: '#E53935'
        }]
      }
    },

    gameHistory() {
      return this.stats.map(s => ({
        player: s.player,
        mapName: s.gameDetails.mapName,
        duration: s.gameDetails.duration,
        result: s.gameDetails.result
      }))
    }
  },

  mounted() {
    this.loadStats()
  },

  methods: {
    async loadStats() {
      try {
        const response = await axios.get('/api/stats')
        this.stats = response.data
      } catch (error) {
        console.error('Error loading stats:', error)
      }
    },

    formatDuration(seconds) {
      const minutes = Math.floor(seconds / 60)
      const remainingSeconds = seconds % 60
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`
    }
  }
}
</script>
