// See https://svelte.dev/docs/kit/types#app.d.ts
// for information about these interfaces


declare global {
  namespace App {
    // interface Error {}
    interface Locals {
      user?: {
        role: {
            permissions: {
                id: number;
                name: string;
                code: string;
                description: string | null;
            }[];
        } & {
            id: number;
            name: string;
            role_group_id: number;
        };
    } & {
        id: number;
        name: string;
        email: string;
        password: string;
        role_id: number;
    }
    }
    // interface PageData {}
    // interface PageState {}
    // interface Platform {}
  }
}

export {};
