declare module "@auth/core/types" {
  interface Session {
    user?: User;
  }
  interface User {
    id: string;
    name: string;
  }
}

export {};
