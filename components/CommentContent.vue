<script setup lang="ts">
defineProps<{
    content: string;
    expanded: boolean;
    toggleExpand: () => any;
}>();

const contentRef = ref<Element | null>(null);
const overflowing = ref(false);

function checkOverflow() {
    if (contentRef.value === null) return;

    const element = contentRef.value;

    overflowing.value = element.clientHeight < element.scrollHeight;
}

onMounted(() => {
    if (contentRef === null) return;
    checkOverflow();
    window.addEventListener("resize", checkOverflow);
});
</script>

<template>
    <div
        ref="contentRef"
        :class="`video__comment-content ${expanded ? 'height-auto' : ''}`"
    >
        {{ content }}
    </div>
    <button v-if="overflowing && expanded" @click="toggleExpand">
        Show More
    </button>
    <button v-else-if="overflowing" @click="toggleExpand">Show Less</button>
</template>

<style scoped lang="scss">
.video__comment-content {
    width: 100%;
    max-height: 6.25em;
    font-size: 1.125rem;
    white-space: pre-wrap;
    word-break: break-all;
    overflow: hidden;
    text-overflow: ellipsis;

    &.height-auto {
        max-height: unset;
    }
}

button {
    color: var(--text-alt);
}
</style>
