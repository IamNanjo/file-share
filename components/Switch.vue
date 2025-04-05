<script setup lang="ts">
import type { StyleValue } from "vue";

export interface SwitchOptionProps {
    text: string;
    select: () => any;
}

interface Option extends SwitchOptionProps {
    textWidth?: string;
    offset?: string;
}

const props = defineProps<{ options: SwitchOptionProps[]; default: number }>();
const optionCount = props.options.length;

const options = ref<Option[]>(props.options);
const loading = ref(true);
const selectedOption = ref(props.default);
watch(selectedOption, (newOption) => options.value[newOption].select());

const optionRefs = useTemplateRef<HTMLDivElement[]>("switch-options");

const indicatorStyle = computed<StyleValue>(() => {
    const index = selectedOption.value;
    const first = index === 0;
    const last = index === optionCount - 1;
    return {
        "left": options.value[index].offset,
        "width": options.value[index].textWidth,
        "border-top-left-radius": first ? "var(--radius)" : 0,
        "border-bottom-left-radius": first ? `var(--radius)` : 0,
        "border-top-right-radius": last ? "var(--radius)" : 0,
        "border-bottom-right-radius": last ? "var(--radius)" : 0,
    };
});

onMounted(() => {
    calculateOptionWidths();
    window.addEventListener("resize", calculateOptionWidths);
    loading.value = false;
});

function calculateOptionWidths() {
    for (let i = 0, offset = 0, maxI = optionCount; i < maxI; i++) {
        if (!optionRefs.value) return;
        const optionRef = optionRefs.value[i];

        if (!optionRef) return;

        const width = optionRef.scrollWidth;

        options.value[i].textWidth = `${width}px`;
        options.value[i].offset = `${offset}px`;

        // Account for border width
        offset += width + 1;
    }
}
</script>

<template>
    <div class="switch" :style="{ visibility: loading ? 'hidden' : 'visible' }">
        <label
            ref="switch-options"
            v-for="(option, index) in options"
            :key="option.text"
            class="switch__label"
            tabindex="0"
            @keydown.enter="() => (selectedOption = index)"
        >
            {{ option.text }}
            <input
                type="radio"
                name="theme"
                :value="index"
                v-model="selectedOption"
                tabindex="-1"
            />
        </label>
        <div class="switch__selected-indicator" :style="indicatorStyle"></div>
    </div>
</template>

<style lang="scss">
.switch {
    position: relative;
    display: flex;
    background-color: var(--bg-raise);
    height: 100%;
    border-radius: var(--radius);

    --radius: 0.5em;

    &,
    * {
        user-select: none;
    }

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
        width: max-content;
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
        background-color: var(--bg-raise);
        width: max-content;
        height: 100%;
        transition: all 0.4s ease;
        pointer-events: none;
    }
}
</style>
