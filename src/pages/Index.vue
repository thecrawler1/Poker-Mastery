<template>
  <q-page padding class="bg-grey-1">
    <strategy-table />
    <transition
      enter-active-class="animated rotateIn"
      leave-active-class="animated rotateOut"
      appear
      mode="out-in"
      :duration="400"
    >
      <q-page-sticky
        v-if="selectable && selectedSolutionsIds.length > 0"
        position="bottom-right"
        :offset="[18, 18]"
      >
        <q-btn fab icon="mdi-dumbbell" color="primary" to="/trainer" />
      </q-page-sticky>
    </transition>
  </q-page>
</template>

<script>
import StrategyTable from 'components/StrategyTable'

export default {
  name: 'PageIndex',
  components: {
    StrategyTable
  },
  computed: {
    selectable () {
      return this.$store.getters['global/getSelectableStrategyTree']
    },
    selectedSolutionsIds () {
      return this.$store.getters['global/getSelectedSolutionsIds']
    }
  }
}
</script>
