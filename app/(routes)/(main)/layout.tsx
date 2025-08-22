"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";
import { signOut } from "next-auth/react";

export default function ProtectedRoutes({ children }: { children: React.ReactNode }) {
    const session = useSession();

    if(session.status == "unauthenticated"){
        redirect("/");
    }

    return (
        <div>
            {children}
        </div>
    );
}