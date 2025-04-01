import { createRouter, createWebHistory } from 'vue-router'
import StatsView from '../views/StatsView.vue'
import AchievementsView from '../views/AchievementsView.vue'
import LeaderboardView from '../views/LeaderboardView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'stats',
      component: StatsView
    },
    {
      path: '/achievements',
      name: 'achievements',
      component: AchievementsView
    },
    {
      path: '/leaderboard',
      name: 'leaderboard',
      component: LeaderboardView
    }
  ]
})

export default router
