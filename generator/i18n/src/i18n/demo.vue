<template>
  <div id="app">
    <label for="locale">本地化</label>:
    <select v-model="locale">
      <option value="cn"> 中文 </option>
      <option value="en"> English </option>
    </select>
    <div>
      <p>小清: {{ $t('hello') }}</p>
      <p>小宁：{{$t('welcome')}}</p>
    </div>
    <div>
      <h1>{{$t('company')}}</h1>
    </div>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () { return { locale: 'cn' } },
  watch: {
    locale (val) {
      this.$i18n.locale = val
    }
  }
}
</script>

