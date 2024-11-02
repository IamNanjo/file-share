export default defineNuxtConfig({
  devtools: { enabled: false },
  vite: { optimizeDeps: { include: ["cookie"] } },

  app: {
    pageTransition: { name: "page", mode: "out-in" },
  },

  modules: [
    "@nuxtjs/color-mode",
    "@nuxtjs/google-fonts",
    "@nuxtjs/plausible",
    "@hebilicious/authjs-nuxt",
    "@nuxt/icon",
  ],

  colorMode: {
    classPrefix: "",
    classSuffix: "",
    fallback: "dark",
    storageKey: "theme",
  },

  googleFonts: {
    families: {
      "Roboto": [400, 500, 700],
      "JetBrains Mono": [400, 500, 700],
    },
    display: "swap",
  },

  plausible: {
    apiHost: "https://plausible.nanjo.dev",
  },

  authJs: {
    baseUrl: process.env.FILESHARE_BASE_URL || "",
    verifyClientOnEveryRequest: true,
    authenticatedRedirectTo: "/",
    guestRedirectTo: "/",
  },

  runtimeConfig: {
    authJs: {
      secret: process.env.FILESHARE_SECRET,
    },
  },

  compatibilityDate: "2024-10-18",
});
