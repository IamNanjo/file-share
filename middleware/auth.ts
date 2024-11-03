export default defineNuxtRouteMiddleware(async (to) => {
    const auth = useAuth();

    if (import.meta.client) {
        if (auth.value.authenticated) return;
        return navigateTo("/login");
    }

    const res = await $fetch("/auth");

    if (res === null && to.path !== "/login") return await navigateTo("/login");
    if (res === null) return;

    auth.value = {
        authenticated: true,
        id: res.id,
        name: res.name,
    };
});
