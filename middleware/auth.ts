export default defineNuxtRouteMiddleware(async (to) => {
    if (import.meta.client) {
        const auth = useAuth();
        if (auth.value.authenticated) return;
        return navigateTo("/login");
    }

    const res = await $fetch("/auth");

    if (res === null && to.path !== "/login") return await navigateTo("/login");
});
