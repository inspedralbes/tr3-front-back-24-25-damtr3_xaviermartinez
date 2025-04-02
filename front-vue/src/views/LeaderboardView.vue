<template>
  <v-container>
    <!-- Filtros y temporada actual -->
    <v-row>
      <v-col cols="12" md="8">
        <v-card>
          <v-card-title class="text-h5">
            <v-icon large color="warning" class="mr-2">mdi-crown</v-icon>
            Clasificación - Temporada {{ currentSeason }}
          </v-card-title>
          <v-card-subtitle>
            Tiempo restante: {{ seasonTimeRemaining }}
          </v-card-subtitle>
        </v-card>
      </v-col>
      
      <v-col cols="12" md="4">
        <v-card>
          <v-card-text>
            <v-select
              v-model="selectedFilter"
              :items="filterOptions"
              label="Ordenar por"
              dense
              outlined
            ></v-select>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Top 3 jugadores -->
    <v-row class="mt-4">
      <!-- Segundo lugar -->
      <v-col cols="12" md="4" class="d-flex align-self-end">
        <v-card
          width="100%"
          height="200"
          class="second-place"
        >
          <v-card-text class="text-center">
            <v-avatar size="80" color="primary">
              <v-icon size="40" color="white">mdi-account</v-icon>
            </v-avatar>
            <div class="text-h5 mt-2">{{ topPlayers[1]?.name || 'N/A' }}</div>
            <div class="text-h6">{{ topPlayers[1]?.points || 0 }} pts</div>
            <v-icon large color="grey">mdi-medal</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Primer lugar -->
      <v-col cols="12" md="4">
        <v-card
          width="100%"
          height="250"
          class="first-place"
          color="amber lighten-3"
        >
          <v-card-text class="text-center">
            <v-avatar size="100" color="warning">
              <v-icon size="50" color="white">mdi-account</v-icon>
            </v-avatar>
            <div class="text-h4 mt-2">{{ topPlayers[0]?.name || 'N/A' }}</div>
            <div class="text-h5">{{ topPlayers[0]?.points || 0 }} pts</div>
            <v-icon large color="amber darken-2">mdi-crown</v-icon>
          </v-card-text>
        </v-card>
      </v-col>

      <!-- Tercer lugar -->
      <v-col cols="12" md="4" class="d-flex align-self-end">
        <v-card
          width="100%"
          height="180"
          class="third-place"
        >
          <v-card-text class="text-center">
            <v-avatar size="70" color="primary">
              <v-icon size="35" color="white">mdi-account</v-icon>
            </v-avatar>
            <div class="text-h5 mt-2">{{ topPlayers[2]?.name || 'N/A' }}</div>
            <div class="text-h6">{{ topPlayers[2]?.points || 0 }} pts</div>
            <v-icon large color="brown">mdi-medal</v-icon>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Tabla de clasificación -->
    <v-row class="mt-4">
      <v-col cols="12">
        <v-card>
          <v-data-table
            :headers="headers"
            :items="leaderboardData"
            :items-per-page="10"
            class="elevation-1"
          >
            <!-- Columna de Posición -->
            <template v-slot:item.position="{ item }">
              <v-chip
                :color="getRankColor(item.raw.position)"
                dark
                small
              >
                #{{ item.raw.position }}
              </v-chip>
            </template>

            <!-- Columna de Jugador -->
            <template v-slot:item.name="{ item }">
              <div class="d-flex align-center">
                <v-avatar size="32" color="primary" class="mr-2">
                  <v-icon dark>mdi-account</v-icon>
                </v-avatar>
                {{ item.raw.name }}
                <v-icon
                  v-if="item.raw.streak > 2"
                  color="red"
                  small
                  class="ml-2"
                >
                  mdi-fire
                </v-icon>
              </div>
            </template>

            <!-- Columna de Tendencia -->
            <template v-slot:item.trend="{ item }">
              <v-icon
                :color="getTrendColor(item.raw.trend)"
              >
                {{ getTrendIcon(item.raw.trend) }}
              </v-icon>
            </template>
          </v-data-table>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'LeaderboardView',

  setup() {
    const currentSeason = ref(1)
    const seasonTimeRemaining = ref('30d 12h 45m')
    const selectedFilter = ref('points')
    const topPlayers = ref([])
    const leaderboardData = ref([])

    const filterOptions = [
      { text: 'Puntos', value: 'points' },
      { text: 'Victorias', value: 'wins' },
      { text: 'K/D Ratio', value: 'kd' },
      { text: 'Tiempo Jugado', value: 'playtime' }
    ]

    const headers = [
      { title: 'Pos', key: 'position', width: '80px' },
      { title: 'Jugador', key: 'name' },
      { title: 'Puntos', key: 'points' },
      { title: 'Victorias', key: 'wins' },
      { title: 'Derrotas', key: 'losses' },
      { title: 'Ratio V/D', key: 'winRate' },
      { title: 'Racha', key: 'streak' },
      { title: 'Tendencia', key: 'trend', width: '100px' }
    ]

    const getRankColor = (position) => {
      if (position === 1) return 'amber darken-2'
      if (position === 2) return 'grey lighten-1'
      if (position === 3) return 'brown'
      return 'primary'
    }

    const getTrendColor = (trend) => {
      if (trend > 0) return 'success'
      if (trend < 0) return 'error'
      return 'grey'
    }

    const getTrendIcon = (trend) => {
      if (trend > 0) return 'mdi-arrow-up'
      if (trend < 0) return 'mdi-arrow-down'
      return 'mdi-minus'
    }

    const loadLeaderboard = async () => {
      try {
        const response = await axios.get('/api/leaderboard')
        const data = response.data

        // Actualizar top 3
        topPlayers.value = data.slice(0, 3)

        // Actualizar tabla completa
        leaderboardData.value = data.map((player, index) => ({
          position: index + 1,
          ...player
        }))
      } catch (error) {
        console.error('Error cargando leaderboard:', error)
      }
    }

    onMounted(() => {
      loadLeaderboard()
    })

    return {
      currentSeason,
      seasonTimeRemaining,
      selectedFilter,
      filterOptions,
      headers,
      topPlayers,
      leaderboardData,
      getRankColor,
      getTrendColor,
      getTrendIcon
    }
  }
}
</script>

<style scoped>
.first-place,
.second-place,
.third-place {
  transition: transform 0.3s ease;
}

.first-place:hover {
  transform: translateY(-10px);
}

.second-place:hover,
.third-place:hover {
  transform: translateY(-5px);
}

.v-data-table {
  border-radius: 8px;
}
</style>
