import { createRouter, createWebHistory } from 'vue-router'
import CharacterList from '../views/CharacterList.vue'
import Stats from '../views/Stats.vue'

const routes = [
  {
    path: '/',
    name: 'Characters',
    component: CharacterList
  },
  {
    path: '/stats',
    name: 'Stats',
    component: Stats
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
