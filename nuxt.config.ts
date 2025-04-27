export default defineNuxtConfig({
    devtools: { enabled: true },
    devServer: { port: Number(process.env.FILESHARE_PORT) || 11443 },

    app: { pageTransition: { name: "page", mode: "out-in" } },

    nitro: {
        experimental: {
            openAPI: true,
        },
    },

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

    plausible: {
        apiHost: "https://data.nanjo.dev",
        ignoredHostnames: ["localhost", "local.test"],
        logIgnoredEvents: true,
        autoOutboundTracking: false,
        autoPageviews: false,
    },

    compatibilityDate: "2024-10-18",
});
