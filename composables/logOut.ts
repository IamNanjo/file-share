export default function signOut() {
    const auth = useAuth();

    $fetch("/auth/logout", { method: "post" });

    auth.value = { authenticated: false };
}
