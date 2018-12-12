<i18n>
{
  "en": {
    "hello": "hello world!"
  },
  "cn": {
    "hello": "你好世界！"
  }
}
</i18n>

<template>
  <div id="app">
    <label for="locale">本地化</label>
    <select v-model="locale">
      <option>en</option>
      <option>cn</option>
    </select>
    <p>message: {{ $t('hello') }}</p>
  </div>
</template>

<script>
export default {
  name: 'app',
  data () { return { locale: 'en' } },
  watch: {
    locale (val) {
      this.$i18n.locale = val
    }
  }
}
</script>