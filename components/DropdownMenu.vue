<template>
    <div class="profile-menu">
        <slot />
    </div>
</template>

<style lang="scss">
.profile-menu {
    position: relative;
    z-index: 10;

    &:focus > &__options,
    &:focus-within > &__options,
    &__options:hover {
        display: flex;
    }

    &__toggle {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.5em;
        height: max-content;
        padding-inline: 0.5em;
        padding-block: 0.2em;
        border: 1px solid #7f7f7f;
        border-radius: 6px;
        cursor: pointer;

        &:hover,
        &:focus-visible {
            background-color: var(--bg-raise);
        }

        > * {
            display: flex;
            justify-content: center;
            align-items: center;
        }

        * {
            max-height: 100%;
        }
    }

    &__options {
        display: none;
        flex-direction: column;
        position: absolute;
        background-color: var(--bg-raise-1);
        max-width: min(75vw, 14em);
        top: -0.5em;
        right: 0;
        transform: translateY(-100%);
        border-radius: 6px;
        box-shadow: 1px 1px 4px 2px var(--shadow-color);

        > * {
            display: flex;
            align-items: center;
            gap: 1em;
            width: 100%;
            height: 3em;
            padding-inline: 1em;

            &:not(:last-child) {
                border-bottom: 1px solid var(--bg-raise);
            }
        }

        > a:hover,
        > button:hover {
            background-color: var(--bg-raise);
        }

        * {
            text-wrap: nowrap;
            text-overflow: ellipsis;
            overflow: hidden;
        }

        @media screen and (min-width: 30em) {
            top: unset;
            bottom: -0.5em;
            transform: translateY(100%);
        }
    }
}
</style>
