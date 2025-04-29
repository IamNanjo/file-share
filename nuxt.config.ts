export default defineNuxtConfig({
    devtools: { enabled: true },
    devServer: { port: Number(process.env.FILESHARE_PORT) || 11443 },

    app: { pageTransition: { name: "page", mode: "out-in" } },

    nitro: {
        experimental: {
            openAPI: true,
        },
    },

    modules: ["@nuxtjs/color-mode", "@nuxt/icon"],

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

    compatibilityDate: "2024-10-18",
});
