<script setup lang="ts">
import { useI18n } from 'vue-i18n'
import { useLocaleSwitcher } from '~/composables/useI18n'

const { locale } = useI18n()
const { setLocale } = useLocaleSwitcher()

const languages = [
  { code: 'en', name: 'English' },
  { code: 'sv', name: 'Svenska' }
]
</script>
<template>
  <div class="flex items-center justify-center gap-2">
    <button
      v-for="lang in languages"
      :key="lang.code"
      @click="setLocale(lang.code as 'en' | 'sv')"
      :class="[
        'px-3 py-1 rounded text-sm transition-colors',
        locale === lang.code
          ? 'bg-blue-500 text-white'
          : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
      ]"
    >
      {{ lang.name }}
    </button>
  </div>
</template>
