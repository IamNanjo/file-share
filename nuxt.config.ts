export default defineNuxtConfig({
    devtools: { enabled: false },
    app: { pageTransition: { name: "page", mode: "out-in" } },

    modules: [
        "@nuxtjs/color-mode",
        "@nuxtjs/google-fonts",
        "@nuxtjs/plausible",
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

    plausible: { apiHost: "https://plausible.nanjo.dev" },

    compatibilityDate: "2024-10-18",
});
