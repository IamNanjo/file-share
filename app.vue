<script setup lang="ts">
const title = useTitle();
const menuIsOpen = useMenuIsOpen();

useHead({
  title,
  meta: [
    { name: "description", content: "FileShare" },
    { name: "keywords", content: "FileShare, File Share" },
    { name: "author", content: "IamNanjo" },
  ],
});

onMounted(() => {
  const mainElement = document.querySelector("main");

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") menuIsOpen.value = !menuIsOpen.value;
  });

  mainElement?.addEventListener("click", (e) => {
    e.stopPropagation();
    menuIsOpen.value = false;
  });
  mainElement?.addEventListener("touchstart", (e) => {
    e.stopPropagation();
    menuIsOpen.value = false;
  });
});
</script>

<template>
  <NuxtLoadingIndicator color="#FF6961" :height="3" />
  <NavBar />
  <NuxtPage />
</template>

<style lang="scss">
/* Page transition */
.page-enter-active,
.page-leave-active {
  transition: all 0.2s;
}
.page-enter-from,
.page-leave-to {
  opacity: 0;
  filter: blur(1rem);
}
/* =============== */

/* Transition groups */
.list-move,
.list-enter-active,
.list-leave-active {
  transition: all 0.3s ease;
}
.list-enter-from,
.list-leave-to {
  opacity: 0;
  scale: 0;
}
/* ================= */

/* Toast styles */
@import "node_modules/vue-toast-notification/dist/theme-bootstrap.css";
/* ============ */

*,
*::before,
*::after {
  box-sizing: border-box;
  min-width: 0;
  margin: 0;
  padding: 0;
  font: inherit;
  border: 0;
  outline: 0;
  outline-offset: 2px;
  transition-property: background-color;
  transition-duration: 0.3s;
  transition-timing-function: ease;
}

::-webkit-scrollbar {
  $size: 6px;
  width: $size;
  height: $size;

  &-track {
    background-color: transparent;
  }

  &-thumb {
    background-color: var(--text-alt);
    border-radius: $size * 2;
  }
}

:focus-visible {
  outline: 2px solid var(--text-primary);
}

:root {
  color-scheme: dark;
  --bg-primary: #121212;
  --bg-raise: rgba(255, 255, 255, 0.07);
  --bg-raise-1: #232323;
  --fg-primary: 255, 105, 97;
  --text-primary: white;
  --text-alt: #666666;
  --ff-primary: "Roboto", sans-serif;
  --ff-mono: "JetBrains Mono", "JetBrains Mono NL", monospace;
  --shadow-color: black;
}

:root.black {
  --bg-primary: black;
  --bg-raise-1: #121212;
}

:root.light {
  color-scheme: light;
  --bg-primary: #ffffff;
  --bg-raise: rgba(0, 0, 0, 0.07);
  --bg-raise-1: #ffffff;
  --text-primary: black;
  --text-alt: #aaaaaa;
  --shadow-color: #7f7f7f;
}

#__nuxt {
  display: contents;
}

html {
  font-family: var(--ff-primary);
  scroll-behavior: smooth;
}

html,
body,
main {
  min-height: 100%;
}

body {
  background-color: var(--bg-primary);
  color: var(--text-primary);
  padding-block: 3em;
  font-family: var(--ff-primary);
  overflow-x: hidden;
  z-index: 0;
}

body,
main {
  position: relative;
}

main {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
}

nav {
  z-index: 10;
}

button {
  /* Reset button styling */
  background: none repeat scroll 0 0 transparent;
  border: medium none;
  border-spacing: 0;
  color: inherit;
  font-family: inherit;
  font-size: inherit;
  font-weight: inherit;
  line-height: inherit;
  margin: 0;
  padding: 0;
  text-align: left;
  text-decoration: none;
  text-indent: 0;
  cursor: pointer;
}

pre,
code,
kbd {
  font-family: var(--ff-mono);
}

a,
kbd,
img,
button {
  user-select: none;
}

a {
  color: var(--text-primary);
  text-decoration: none;
}
</style>
