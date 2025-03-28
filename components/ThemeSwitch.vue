<script setup lang="ts">
import type { SwitchOptionProps } from "./Switch.vue";

const theme = useColorMode();

const themeOptions: SwitchOptionProps[] = [
    {
        text: "Light",
        select() {
            theme.preference = "light";
        },
    },
    {
        text: "Dark",
        select() {
            theme.preference = "dark";
        },
    },
    {
        text: "Black",
        select() {
            theme.preference = "black";
        },
    },
];

const defaultTheme = themeOptions.findIndex(
    (o) => o.text.toLowerCase() === theme.value
);
</script>

<template>
    <Switch :default="defaultTheme" :options="themeOptions" />
</template>
