import "next-auth";

declare module "next-auth" {
  interface User {
    role?: "admin" | "student";
    id?: string;
  }

  interface Session {
    user: {
      id?: string;
      name?: string | null;
      email?: string | null;
      role?: "admin" | "student";
    };
  }
}

declare module "next-auth/jwt" {
  interface JWT {
    role?: "admin" | "student";
    id?: string;
  }
}