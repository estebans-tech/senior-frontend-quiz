<script setup lang="ts">
import { computed } from 'vue'
import type { Question } from '~/types/question'

const props = withDefaults(defineProps<{
  question?: Question | null
  revealed?: boolean
  explanationsId?: string
  explLabelId?: string
  /** 1-based current question index shown to the user (e.g., 3) */
  current?: number
  /** total number of questions (e.g., 10) */
  total?: number
}>(), {
  revealed: false,
})
const showExplanation = computed(() => props.revealed)

</script>

<template>
    <!-- Förklaringsregion som knappen styr -->
  <section
      v-if="showExplanation"
      :id="explRegionId"
      role="region"
      :aria-labelledby="explLabelId"
      class="border border-gray-200 p-2 px-4"
      >
    <section v-if="question!.explanation" class="mb-2">
      <h3 class="font-medium">Explanation:</h3><!-- TODO: i18n -->
      <ul v-if="question!.explanation.length > 0">
          <li class="list-disc list-none" v-for="explanation in question!.explanation">{{ explanation }}</li>
      </ul>
      <p v-else-if="!question!.explanation.length" class="text-sm text-gray-700">
          {{ question!.explanation }}
      </p>
    </section>

    <section v-if="question!.explanationIncorrect" class="my-2">
      <h3 class="font-medium">Why others are incorrect:</h3><!-- TODO: i18n -->
      <ul v-if="question!.explanationIncorrect.length > 0">
          <li class="list-disc list-none" v-for="incorrect in question!.explanationIncorrect">{{ incorrect }}</li>
      </ul>
      <p v-else class="text-sm text-gray-700">
          {{ question!.explanationIncorrect }}
      </p>
    </section>

    <section v-if="question!.source" class="my-2">
      <h3 class="font-medium">Source:</h3><!-- TODO: i18n -->
      <p class="text-sm text-gray-700">
        {{ question.source }}
      </p>
    </section>
  </section>
</template>