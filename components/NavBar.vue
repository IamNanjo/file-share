<script setup lang="ts">
const menuIsOpen = useMenuIsOpen();
const auth = useAuth();
const route = useRoute();

const toggleMenu = () => {
    menuIsOpen.value = !menuIsOpen.value;
};
</script>

<template>
    <nav>
        <div class="menu">
            <Transition name="back-button">
                <NuxtLink
                    v-if="$route.path !== '/'"
                    to="/"
                    class="menu__back-button"
                    tabindex="0"
                    title="Back to file list"
                    ><Icon
                        name="material-symbols:arrow-back-rounded"
                        size="1.5em"
                /></NuxtLink>
            </Transition>
            <button
                :class="`menu__toggle${menuIsOpen ? ' open' : ''}`"
                @pointerdown="toggleMenu"
            >
                <span></span>
                <span></span>
                <span></span>
                <span></span>
                <kbd class="menu__toggle__shortcut">Esc</kbd>
            </button>
            <Transition name="menu-content">
                <div v-if="menuIsOpen" class="menu__content">
                    <div class="settings">
                        <div><span>Theme:</span><ThemeSwitch /></div>
                    </div>
                </div>
            </Transition>
        </div>
        <NuxtLink
            v-if="!auth.authenticated && route.path !== '/login'"
            :href="`/login?redirect=${route.path}`"
            class="button button-primary"
            >Sign in</NuxtLink
        >
        <DropdownMenu v-else-if="auth.authenticated">
            <button class="profile-menu__toggle" tabindex="0" title="Account">
                <span
                    ><Icon
                        name="material-symbols:account-circle"
                        size="1.5em"
                    />
                </span>
                <span>{{ auth.name }}</span>
            </button>
            <div class="profile-menu__options">
                <NuxtLink to="/upload"
                    ><Icon
                        name="material-symbols:upload-file-rounded"
                        size="1.5em"
                    />
                    <div>Upload</div></NuxtLink
                >
                <NuxtLink to="/profile">
                    <Icon
                        name="material-symbols:manage-accounts-rounded"
                        size="1.5em"
                    />
                    <div>Profile</div>
                </NuxtLink>
                <button class="clickable" @click="logOut()" tabindex="0">
                    <Icon name="material-symbols:logout-rounded" size="1.5em" />
                    <div>Log out</div>
                </button>
            </div>
        </DropdownMenu>
    </nav>
</template>

<style lang="scss">
/* Vue Transitions */
.menu-content {
    &-enter-active,
    &-leave-active {
        transition: opacity 0.2s ease;
    }
    &-enter-from,
    &-leave-to {
        opacity: 0;
    }
}

.back-button {
    &-enter-active,
    &-leave-active {
        transition: scale 0.3s ease;
    }
    &-enter-from,
    &-leave-to {
        scale: 0;
    }
}
/* ============== */

nav {
    position: fixed;
    bottom: 0;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: var(--bg-primary);
    width: 100%;
    height: 3em;
    padding-inline: 1em;
    border-top: 1px solid var(--text-alt);
    z-index: 100;

    * {
        user-select: none;
    }

    > * {
        display: flex;
        justify-content: space-between;
        align-items: center;
        gap: 1em;
    }

    .menu > * {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    @media screen and (min-width: 30em) {
        flex-direction: row;
        top: 0;
        border-top: none;
        border-bottom: 1px solid var(--text-alt);
    }
}

/* --- Menu content */
.menu__content {
    position: absolute;
    top: 0;
    left: 0;
    display: flex;
    flex-direction: column;
    background-color: var(--bg-primary);
    width: 100%;
    height: fit-content;
    border-block: 1px solid var(--text-alt);
    transform: translateY(-100%);

    > .settings {
        display: flex;
        flex-wrap: wrap;
        justify-content: space-around;
        gap: 1em;
        padding: 1em;

        > * {
            display: flex;
            justify-content: center;
            align-items: center;
            gap: 0.5em;
            padding: 0.5em 1em;
            border: 1px solid var(--text-alt);
            border-radius: 6px;
        }
    }

    > .link-list {
        display: flex;
        flex-direction: column;
        width: calc(100% - 2em);
        max-height: 10em;
        margin-inline: 1em;
        border-radius: var(--radius);
        list-style-type: none;
        overflow-y: auto;
        scroll-snap-type: y mandatory;

        --radius: 6px;

        > * {
            background-color: var(--bg-raise);
            padding: 1em 1.5em;
            scroll-snap-align: center;

            &:first-child {
                border-top-left-radius: var(--radius);
                border-top-right-radius: var(--radius);
            }
            &:last-child {
                border-bottom-left-radius: var(--radius);
                border-bottom-right-radius: var(--radius);
            }
        }
    }

    @media screen and (min-width: 30em) {
        top: 3em;
        transform: translateY(0);
    }
}

.menu__toggle.open + .menu__content,
.menu-content-enter-active,
.menu-content-leave-active {
    > .link-list * {
        &:not(:last-child) {
            border-bottom: 1px solid var(--text-alt);
        }
    }
}

/* --- Toggle button */
.menu__toggle {
    --width: 1.5em;
    --height: 1.2em;
    --bar-size: calc(var(--width) / 8);
    position: relative;
    width: var(--width);
    height: var(--height);

    span {
        display: block;
        position: absolute;
        height: var(--bar-size);
        width: 100%;
        background-color: var(--text-primary);
        border-radius: var(--bar-size);
        opacity: 1;
        left: 0;
        transform: rotate(0deg);
        transition-property: all;
    }

    span:nth-child(1) {
        top: 0px;
    }
    span:nth-child(2),
    span:nth-child(3) {
        top: calc(var(--height) / 2 - var(--bar-size) / 2);
    }
    span:nth-child(4) {
        top: calc(var(--height) - var(--bar-size));
    }

    &.open span:nth-child(1) {
        top: 5px;
        width: 0%;
        left: 50%;
    }
    &.open span:nth-child(2) {
        transform: rotate(45deg);
    }
    &.open span:nth-child(3) {
        transform: rotate(-45deg);
    }
    &.open span:nth-child(4) {
        top: 5px;
        width: 0%;
        left: 50%;
    }

    kbd {
        position: absolute;
        top: 50%;
        left: calc(1.75 * var(--width));
        display: none;
        justify-content: center;
        align-items: center;
        background-color: var(--bg-raise);
        padding: 0.25em;
        border-radius: 4px;
        transform: translate(-50%, -50%);
    }

    @media screen and (min-width: 30em) {
        kbd {
            display: flex;
        }
    }
}
</style>
