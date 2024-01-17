<script setup lang="ts">
const theme = useColorMode();

const themeOptions: { text: string; value: "light" | "dark" | "black" }[] = [
  { text: "Light", value: "light" },
  { text: "Dark", value: "dark" },
  { text: "Black", value: "black" },
];
</script>

<template>
  <div class="theme-switch">
    <label
      v-for="option in themeOptions"
      :key="option.value"
      :for="`theme-input__${option.value}`"
      class="theme-switch__label"
      tabindex="0"
      @keydown.enter="
        () => {
          theme.preference = option.value;
        }
      "
    >
      {{ option.text }}
      <input
        :id="`theme-input__${option.value}`"
        type="radio"
        name="theme"
        :value="option.value"
        v-model="theme.preference"
        tabindex="-1"
      />
    </label>
    <div class="theme-switch__selected-indicator"></div>
  </div>
</template>

<style lang="scss">
.theme-switch {
  position: relative;
  display: flex;
  background-color: var(--bg-raise);
  height: 100%;
  border-radius: var(--radius);
  font-family: var(--ff-mono);
  user-select: none;

  --radius: 6px;
  --theme-width: 9ch;

  input {
    appearance: none;
    position: absolute;
    top: 0;
    left: 0;
    border-radius: var(--radius);
  }

  &__label {
    position: relative;
    display: block;
    width: var(--theme-width);
    padding: 0.5em 1em;
    text-align: center;
    cursor: pointer;

    &:first-child {
      border-top-left-radius: var(--radius);
      border-bottom-left-radius: var(--radius);
    }
    &:nth-last-child(2) {
      border-top-right-radius: var(--radius);
      border-bottom-right-radius: var(--radius);
    }

    &:not(:nth-last-child(2)) {
      border-right: 1px solid var(--text-alt);
    }
  }

  &__selected-indicator {
    position: absolute;
    left: var(--theme-width);
    background-color: var(--bg-raise);
    width: var(--theme-width);
    height: 100%;
    transition: left 0.4s ease;
    pointer-events: none;
  }

  &:has(&__label:nth-child(1) > input:checked) &__selected-indicator {
    left: 0;
    border-top-left-radius: var(--radius);
    border-bottom-left-radius: var(--radius);
  }
  &:has(&__label:nth-child(2) > input:checked) &__selected-indicator {
    left: var(--theme-width);
  }
  &:has(&__label:nth-child(3) > input:checked) &__selected-indicator {
    left: calc(var(--theme-width) * 2);
    border-top-right-radius: var(--radius);
    border-bottom-right-radius: var(--radius);
  }
}
</style>
