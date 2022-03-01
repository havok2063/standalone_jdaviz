<template>
  <div id="app">
    <img alt="Vue logo" src="./assets/logo.png">
    <Jdaviz/>
  </div>
</template>

<script>
//import HelloWorld from './components/HelloWorld.vue'
import Jdaviz from './components/Jdaviz.vue'

export default {
  name: 'App',
  components: {
    Jdaviz
  }
}
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
