export default defineNuxtRouteMiddleware(async (to, from) => {
    if (import.meta.server) return;
    // Paths that require authentication
    const authPaths = ["/profile", "/upload"];

    const fromLogin = from.path === "/login";
    const toLogin = to.path === "/login";

    // Fix weird UI bug by reloading the app.
    // Always include redirect query parameter when navigating to login route
    if (!fromLogin && toLogin)
        return reloadNuxtApp({ path: `/login?redirect=${from.path}` });

    const auth = useAuth();

    if (auth.value.authenticated && toLogin) {
        return navigateTo(
            from.query.redirect ? (from.query.redirect as string) : from.path
        );
    }

    const res = await $fetch("/auth");

    if (res) {
        auth.value = {
            authenticated: true,
            id: res.id,
            name: res.name,
        };
    } else if (!toLogin && authPaths.includes(to.path)) {
        return navigateTo({
            path: "/login",
            query: { redirect: from.path },
            replace: true,
        });
    }
});
