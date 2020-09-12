<template>
  <div v-if="small">
    <q-card class="card-small bg-grey-3 text-weight-bolder shadow-1" :class="'text-' + suitColor">
      {{ value }}
    </q-card>
  </div>
  <div v-else>
    <q-card v-if="back" class="card back" />
    <q-card v-else class="card text-weight-bold" :class="'text-' + suitColor">
      <div style="line-height: 35px;">{{ value }}</div>
      <q-icon class="suitIcon" :name="suitIcon" :color="suitColor" />
    </q-card>
  </div>
</template>

<script>
export default {
  name: 'p-card',
  props: {
    value: String,
    suit: String,
    back: Boolean,
    small: Boolean
  },
  data: () => ({

  }),
  computed: {
    suitColor () {
      switch (this.suit) {
        case 'h': return 'red-8'
        case 'd': return 'blue-8'
        case 'c': return 'green-8'
      }
      return 'blue-grey-9'
    },
    suitIcon () {
      switch (this.suit) {
        case 'h': return 'mdi-cards-heart'
        case 'd': return 'mdi-cards-diamond'
        case 'c': return 'mdi-cards-club'
      }
      return 'mdi-cards-spade'
    }
  }
}
</script>

<style>
.card {
  width: 40px;
  height: 60px;
  text-align: center;
  font-size: 30px;
}
.card-small {
  width: 22px;
  height: 33px;
  text-align: center;
  font-size: 22px;
  line-height: 33px;
}
.suitIcon {
  position: relative;
  transform: translateY(-55%);
}
.back {
  border: 2px solid white;
  background: repeating-linear-gradient(
    -45deg,
    #ef9a9a,
    #ef9a9a 4px,
    #e57373 4px,
    #e57373 8px
  );
}
</style>
