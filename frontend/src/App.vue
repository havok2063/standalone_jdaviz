<template>
  <v-app>
    <v-main>
      <Jdaviz/>
    </v-main>
  </v-app>
</template>

<script>
import Jdaviz from './components/Jdaviz';

export default {
  name: 'App',

  components: {
    Jdaviz,
  },

  data: () => ({
    //
  }),
};
</script>
