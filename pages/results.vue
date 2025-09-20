<script setup lang="ts">
import { useRouter } from 'nuxt/app'
import { ref, computed } from 'vue'
import { useQuizStore } from '~/stores/quiz'
import type { Question } from '~/types/question'
import { useAppConfig } from 'nuxt/app'
import { useI18n } from 'vue-i18n'
const { t } = useI18n() 
const app = useAppConfig()
type Filter = 'all' | 'correct' | 'incorrect'
const filter = ref<Filter>('all')

const store = useQuizStore()
const router = useRouter()

const questions = computed(() => store.questions as Question[])
const selections = computed<Record<string, string[]>>(
  () => (store.selections ?? {}) as Record<string, string[]>
)

// 🔁 Repeat-länk byggd från lastConfig (döljs om saknas)
const repeatTo = computed(() => {
  const cfg = store.lastConfig
  if (!cfg) return null
  const q: Record<string, any> = { lang: cfg.lang, filter: cfg.filter, max: cfg.max }
  if (cfg.seed !== undefined && String(cfg.seed).trim() !== '') q.seed = String(cfg.seed)
  return { path: '/quiz', query: q }
})

// Binär korrekthet (obesvarade räknas som fel här)
function isQuestionCorrect(q: Question, selected: string[]): boolean {
  const chosen = new Set(selected ?? [])
  const correct = new Set(q.correct ?? [])
  if (chosen.size !== correct.size) return false
  for (const id of chosen) if (!correct.has(id)) return false
  return true
}

const totalCount = computed(() => questions.value.length)
const correctCount = computed(() =>
  questions.value.reduce((acc, q) => {
    const sel = selections.value[q.id] ?? []
    return acc + (isQuestionCorrect(q, sel) ? 1 : 0)
  }, 0)
)
const incorrectCount = computed(() => totalCount.value - correctCount.value)

function backToStart() {
  store.$reset()
  router.push('/')
}
</script>

<template>
  <main class="min-h-screen bg-gray-50">
    <header class="bg-white border-b">
      <div class="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
        <h1 class="text-lg font-semibold">{{ t('result.title') }}</h1>
        <div class="flex items-center gap-3">
          <!-- 🔁 Repeat med samma setup (döljs om ingen lastConfig) -->
          <NuxtLink
            v-if="repeatTo"
            :to="repeatTo"
            class="text-sm underline hover:no-underline"
          >
          {{ t('result.repeat') }}
          </NuxtLink>

          <!-- 🔙 Back to start med reset -->
          <button class="text-sm underline hover:no-underline" @click="backToStart">
            {{ t('result.backToStart') }}
          </button>
        </div>
      </div>
    </header>

    <section class="mx-auto max-w-5xl px-4 py-6">
      <!-- Guard: ingen session -->
      <div v-if="!store.questions.length" class="text-sm text-gray-600">
        {{ t('result.noSession') }}
        <NuxtLink to="/" class="underline ml-1">{{ t('result.backToStart') }}</NuxtLink>
      </div>

      <template v-else>
        <section aria-label="Summary" data-testid="kpi-summary">
          <div class="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">
            <div class="rounded-2xl bg-white shadow p-4">
              <div data-testid="kpi-correct" class="text-2xl font-semibold text-emerald-600">{{ correctCount }}</div>
              <div class="text-sm text-gray-500">{{ t('result.correct') }}</div>
            </div>
            <div class="rounded-2xl bg-white shadow p-4">
              <div data-testid="kpi-incorrect" class="text-2xl font-semibold text-rose-600">{{ incorrectCount }}</div>
              <div class="text-sm text-gray-500">{{ t('result.incorrect') }}</div>
            </div>
            <div class="rounded-2xl bg-white shadow p-4">
              <div data-testid="kpi-total" class="text-2xl font-semibold">{{ totalCount }}</div>
              <div class="text-sm text-gray-500">{{ t('result.total') }}</div>
            </div>
          </div>
        </section>

        <div class="mt-6 flex items-center gap-2">
          <button
            class="px-4 py-2 rounded-xl border"
            :class="filter === 'all' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'"
            @click="filter = 'all'">
            All
          </button>
          <button
            class="px-4 py-2 rounded-xl border"
            :class="filter === 'correct' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'"
            @click="filter = 'correct'">
            Correct
          </button>
          <button
            class="px-4 py-2 rounded-xl border"
            :class="filter === 'incorrect' ? 'bg-black text-white border-black' : 'bg-white text-black border-gray-300'"
            @click="filter = 'incorrect'">
            Incorrect
          </button>
        </div>

        <div class="mt-6">
          <ResultsList :questions="questions" :selections="selections" :filter="filter" />
        </div>

      </template>
    </section>
  </main>
    <footer class="bg-white border-t">
    <div class="mx-auto max-w-5xl px-4 py-4 flex items-center justify-between">
      <BuyMeCoffeeButton :slug="app.bmcSlug" variant="subtle" label="Buy me a coffee" />

      <button class="text-sm underline hover:no-underline" @click="backToStart">
        Back to start
      </button>
    </div>
  </footer>
</template>