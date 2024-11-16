<template>
  <BackButton />
  <div class="container">
    <h1>В разработке :)</h1>
    <p>
      скоро мы добавим возможность выводить до 30% от купленных подписок вашими
      рефералами
    </p>
  </div>
</template>
<style scoped lang="scss">
.container {
  display: flex;
  flex-direction: column;
  margin: 20px;
}
</style>
<script>
import BackButton from "@/components/BackButton.vue";

export default {
  name: "WithdrawView",
  components: { BackButton },
};
</script>
