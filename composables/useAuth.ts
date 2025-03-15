interface User {
    authenticated: boolean;
}

export interface UnAuthenticatedUser extends User {
    authenticated: false;
}

export interface AuthenticatedUser extends User {
    authenticated: true;
    id: string;
    name: string;
}

export default () =>
    useState<AuthenticatedUser | UnAuthenticatedUser>("auth", () => ({
        authenticated: false,
    }));
