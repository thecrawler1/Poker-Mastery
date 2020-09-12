<template>
  <div class="row justify-center q-col-gutter-sm hand-place">
    <template v-if="back">
      <div class="col-auto">
        <card back />
      </div>
      <div class="col-auto">
        <card back />
      </div>
    </template>
    <template v-else>
      <div
        class="col-auto"
        v-for="card in cards"
        :key="card.value + card.suit"
      >
        <card :value="card.value" :suit="card.suit" />
      </div>
    </template>
  </div>
</template>

<script>
import Card from 'components/Card'

export default {
  components: {
    Card
  },
  props: {
    cards: Array,
    back: Boolean
  }
}
</script>

<style>
.hand-place {
  position: absolute;
  width: 150px;
  margin-left: -4px !important;
  top: -58px;
}
</style>
