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
    cursor: pointer;
  }

  &__options {
    display: none;
    flex-direction: column;
    position: absolute;
    background-color: var(--bg-raise-1);
    max-width: min(75vw, 14em);
    top: -0.5em;
    right: 1em;
    transform: translate(100%, -100%);
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
      right: unset;
      bottom: -0.5em;
      left: 1em;
      transform: translate(-100%, 100%);
    }
  }
}
</style>
