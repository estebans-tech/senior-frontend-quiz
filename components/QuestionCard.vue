<script setup lang="ts">
import { computed, ref, watch } from 'vue'
import MarkdownIt from 'markdown-it'
import type { Question } from '~/types/question'
import OptionItem from '~/components/OptionItem.vue'
import AnswerCard from '~/components/AnswerCard.vue'
import { isExactMatch } from '~/utils/scoring'

const props = withDefaults(defineProps<{
  question?: Question | null
  selectedIds?: string[]
  checked?: boolean
  revealed?: boolean
  explanationsId?: string
  /** 1-based current question index shown to the user (e.g., 3) */
  current?: number
  /** total number of questions (e.g., 10) */
  total?: number
}>(), {
  question: null,
  selectedIds: () => [],
  checked: false,
  revealed: false,
  explanationsId: undefined,
  current: 1,
  total: 1,
})

defineEmits<{ (e: 'select', optionId: string): void }>()
const correctSet = computed(() => new Set(props.question?.correct ?? []))

const hasSelection = computed(() => (props.selectedIds?.length ?? 0) > 0)
const isCurrentCorrect = computed(() =>
  props.question ? isExactMatch(props.selectedIds ?? [], props.question.correct) : false
)

const safeTotal = computed(() => Math.max(1, props.total!))
const safeCurrent = computed(() => Math.max(1, Math.min(props.current!, safeTotal.value)))

// ARIA + visuell bredd: POSITION (3 av 10)
const ariaNow = safeCurrent
const ariaValueText = computed(() => `Question ${safeCurrent.value} of ${safeTotal.value}`)
const progressPct = computed(() => Math.round((ariaNow.value / safeTotal.value) * 100))

// Hämta alla js-kodblock
const md = new MarkdownIt({ html: false, breaks: true })
type CodeBlock = {
  lang: 'js' | 'javascript'
  meta: string
  code: string
}

const codeBlocks = computed(() => {
  const s = props.question?.prompt ?? ''
  const tokens = md.parse(s, {}) // tokeniserar markdown till en AST-lik lista
  const blocks: CodeBlock[] = []

  for (const t of tokens) {
    if (t.type !== 'fence') continue
    const info = (t.info || '').trim()
    const [langRaw, ...rest] = info.split(/\s+/)
    const lang = (langRaw || '').toLowerCase()
    if (lang === 'js' || lang === 'javascript') {
      blocks.push({
        lang,
        meta: rest.join(' '),                      // t.ex. title=foo
        code: t.content.replace(/\r\n/g, '\n'),    // normalisera CRLF → LF, behåll \n
      })
    }
  }
  return blocks
})

// Frågetext utan js-kodblock
const questionWithoutCodeBlock = computed(() => {
  const s = props.question?.prompt ?? ''
  const tokens = md.parse(s, {})
  const out: string[] = []
  for (const t of tokens) {
    if (t.type === 'inline') out.push(t.content.replace(/\r\n/g, '\n'))
    // Vi ignorerar fence-tokens och struktur-tokens
  }

  return out.join('\n').trim()
})

// SR-only live announcements (oförändrat i sak)
const liveMsg = ref('')
watch(
  () => [props.checked, props.revealed, isCurrentCorrect.value],
  ([checked, revealed], [prevChecked, prevRevealed]) => {
    if (checked && checked !== prevChecked) {
      liveMsg.value = `Checked: ${isCurrentCorrect.value ? 'Correct' : 'Incorrect'}.`
      return
    }
    if (revealed !== prevRevealed) {
      liveMsg.value = revealed ? 'Explanation shown.' : 'Explanation hidden.'
    }
  }
)

// ids för a11y-kopplingar
const hintId = computed(() => props.question ? `hint-${props.question.id}` : undefined)
const explLabelId = computed(() => props.question ? `expl-label-${props.question.id}` : undefined)
const explRegionId = computed(() => props.explanationsId ?? (props.question ? `explanations-${props.question.id}` : undefined))
</script>

<template>
  <div class="rounded-2xl bg-white shadow p-6">
    <!-- Card header -->
    <div class="mb-3 flex items-center justify-between">
      <span class="text-xs font-medium uppercase tracking-wide">Question</span>
      <div class="flex items-center gap-3">
        <!-- Visuellt vill vi oftast visa position (3/10) oavsett ariaMode -->
        <span class="text-xs font-medium tabular-nums" aria-hidden="true">
          {{ safeCurrent }}<span class="mx-0.5 text-gray-400">/</span>{{ safeTotal }}</span>

          <div
class="relative h-1.5 w-28 rounded-full bg-gray-300"
            role="progressbar"
            aria-label="Progress"
            :aria-valuemin="1"
            :aria-valuemax="safeTotal"
            :aria-valuenow="ariaNow"
            :aria-valuetext="ariaValueText">
          <div
class="absolute inset-y-0 left-0 rounded-full bg-green-600 transition-[width] duration-300"
              :style="{ width: progressPct + '%' }"></div>
        </div>
      </div>
    </div>

    <fieldset
      class="space-y-3"
      :aria-describedby="question?.type === 'multi' ? hintId : undefined">
      <legend class="text-base md:text-md font-light text-slate-700">
        {{ questionWithoutCodeBlock || 'Question prompt goes here…' }}

        <!-- Visa varje JS-kodblock, radbrytningar bevaras -->
        <div v-for="(b, i) in codeBlocks" :key="i" class="mt-2">
          <pre class="whitespace-pre overflow-x-auto rounded-md border border-slate-200
                    bg-slate-50 p-3 px-4 font-mono text-sm leading-6 text-slate-800
                    dark:border-slate-700 dark:bg-slate-800 dark:text-slate-100"><code class="language-js scroll">{{ b.code }}</code></pre>
          <!-- Om du vill kan du visa b.meta (t.ex. titel) här -->
        </div>
      </legend>

      <!-- 🔊 Status för skärmläsare -->
      <div class="sr-only" aria-live="polite" role="status">{{ liveMsg }}</div>

      <!-- Alternativ -->
      <ul v-if="question" class="mt-3 space-y-1">
        <li v-for="opt in question.options" :key="opt.id">
          <OptionItem
            :option="opt"
            :name="`q-${question.id}`"
            :input-type="question.type === 'single' ? 'radio' : 'checkbox'"
            :selected="selectedIds?.includes(opt.id) || false"
            :is-correct="correctSet.has(opt.id)"
            :show-solution="false"
            @toggle="() => $emit('select', opt.id)"
            @choose="() => $emit('select', opt.id)"
          />
        </li>
      </ul>


      <!-- Kategorirad -->
      <div class="pb-2" v-if="question.category">
        <p>{{ question.category }}</p>
      </div>

      <!-- Statusrad (Correct/Incorrect/No selection) -->
      <div class="my-2 py-2" role="status" aria-live="polite">
        <p v-if="checked" class="text-sm">
          <span v-if="hasSelection"
                class="inline-flex items-center rounded-full px-2 py-0.5"
                :class="isCurrentCorrect ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'">
            {{ isCurrentCorrect ? 'Correct' : 'Incorrect' }}
          </span>
          <span v-else class="inline-flex items-center rounded-full px-2 py-0.5 bg-gray-100 text-gray-800">
            No selection
          </span><!-- TODO: i18n -->
        </p>
        </div>
    </fieldset>
    <!-- Förklaringsregion som knappen styr -->
    <AnswerCard :revealed="revealed" :explRegionId="explRegionId" :explLabelId="explLabelId" :question="question" />

  </div>
</template>
