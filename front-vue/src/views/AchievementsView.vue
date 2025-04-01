<template>
  <v-container>
    <!-- Progreso general -->
    <v-row>
      <v-col cols="12">
        <v-card class="mb-4">
          <v-card-text class="text-center">
            <div class="text-h6 mb-2">Progreso Total de Logros</div>
            <v-progress-circular
              :rotate="-90"
              :size="100"
              :width="15"
              :model-value="achievementProgress"
              color="primary"
            >
              {{ achievementProgress }}%
            </v-progress-circular>
            <div class="mt-2 text-body-1">
              {{ unlockedCount }} de {{ totalAchievements }} logros desbloqueados
            </div>
          </v-card-text>
        </v-card>
      </v-col>
    </v-row>

    <!-- Categorías de logros -->
    <v-row>
      <v-col cols="12">
        <v-tabs v-model="activeTab" show-arrows>
          <v-tab value="all">
            <v-icon left>mdi-trophy</v-icon>
            Todos
          </v-tab>
          <v-tab value="combat">
            <v-icon left>mdi-sword</v-icon>
            Combate
          </v-tab>
          <v-tab value="explorer">
            <v-icon left>mdi-map-marker</v-icon>
            Explorador
          </v-tab>
          <v-tab value="collector">
            <v-icon left>mdi-star</v-icon>
            Coleccionista
          </v-tab>
          <v-tab value="seasonal">
            <v-icon left>mdi-calendar</v-icon>
            Temporada
          </v-tab>
        </v-tabs>

        <v-window v-model="activeTab">
          <v-window-item
            v-for="category in ['all', 'combat', 'explorer', 'collector', 'seasonal']"
            :key="category"
            :value="category"
          >
            <v-row>
              <v-col
                v-for="achievement in filteredAchievements(category)"
                :key="achievement.id"
                cols="12"
                md="6"
                lg="4"
              >
                <v-card
                  :class="{'achievement-locked': !achievement.unlocked}"
                  class="achievement-card"
                >
                  <v-card-title class="d-flex align-center">
                    <v-avatar
                      size="40"
                      class="mr-3"
                      :color="achievement.unlocked ? 'primary' : 'grey'"
                    >
                      <v-icon dark>{{ achievement.icon }}</v-icon>
                    </v-avatar>
                    {{ achievement.name }}
                    <v-spacer></v-spacer>
                    <v-chip
                      :color="achievement.unlocked ? 'success' : 'grey'"
                      small
                    >
                      {{ achievement.unlocked ? 'Desbloqueado' : 'Bloqueado' }}
                    </v-chip>
                  </v-card-title>

                  <v-card-text>
                    <p>{{ achievement.description }}</p>
                    <v-progress-linear
                      v-if="achievement.progress"
                      :model-value="achievement.progress"
                      height="20"
                      striped
                    >
                      <template v-slot:default="{ value }">
                        <strong>{{ Math.ceil(value) }}%</strong>
                      </template>
                    </v-progress-linear>
                  </v-card-text>

                  <v-card-actions v-if="achievement.unlocked">
                    <v-spacer></v-spacer>
                    <div class="text-caption">
                      Desbloqueado el {{ formatDate(achievement.dateUnlocked) }}
                    </div>
                  </v-card-actions>
                </v-card>
              </v-col>
            </v-row>
          </v-window-item>
        </v-window>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import { ref, computed, onMounted } from 'vue'
import axios from 'axios'

export default {
  name: 'AchievementsView',

  setup() {
    const activeTab = ref('all')
    const achievements = ref([])

    const achievementProgress = computed(() => {
      const total = achievements.value.length
      const unlocked = achievements.value.filter(a => a.unlocked).length
      return Math.round((unlocked / total) * 100) || 0
    })

    const unlockedCount = computed(() => 
      achievements.value.filter(a => a.unlocked).length
    )

    const totalAchievements = computed(() => 
      achievements.value.length
    )

    const filteredAchievements = (category) => {
      if (category === 'all') return achievements.value
      return achievements.value.filter(a => a.category === category)
    }

    const formatDate = (date) => {
      return new Date(date).toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric'
      })
    }

    const loadAchievements = async () => {
      try {
        const response = await axios.get('/api/achievements')
        achievements.value = response.data
      } catch (error) {
        console.error('Error cargando logros:', error)
      }
    }

    onMounted(() => {
      loadAchievements()
    })

    return {
      activeTab,
      achievements,
      achievementProgress,
      unlockedCount,
      totalAchievements,
      filteredAchievements,
      formatDate
    }
  }
}
</script>

<style scoped>
.achievement-card {
  transition: all 0.3s ease;
}

.achievement-card:hover {
  transform: translateY(-5px);
  box-shadow: 0 5px 15px rgba(0,0,0,0.3);
}

.achievement-locked {
  opacity: 0.7;
  filter: grayscale(1);
}

.achievement-locked:hover {
  opacity: 0.9;
  filter: grayscale(0.5);
}

.v-progress-linear {
  border-radius: 4px;
  overflow: hidden;
}
</style>
