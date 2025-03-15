export default async function signOut() {
    const auth = useAuth();
    const route = useRoute();

    auth.value = { authenticated: false };
    await $fetch("/auth/logout", { method: "post" });

    // Paths that require authentication
    const authPaths = ["/profile", "/upload"];

    if (authPaths.includes(route.path)) {
        return navigateTo("/");
    }
}
