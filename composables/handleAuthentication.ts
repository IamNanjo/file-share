export default async function handleAuthentication({
    id,
    name,
}: {
    id: AuthenticatedUser["id"];
    name: AuthenticatedUser["name"];
}) {
    const auth = useAuth();
    const route = useRoute();

    auth.value = { ...auth.value, authenticated: true, id, name };

    return navigateTo(route.redirectedFrom);
}
