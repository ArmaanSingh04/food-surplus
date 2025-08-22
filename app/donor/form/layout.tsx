"use client";

import { useSession } from "next-auth/react";
import { redirect } from "next/navigation";

export default function DonorProtectedRoutes({ children }: { children: React.ReactNode }) {
    const session = useSession();

    if(session.status == "unauthenticated" ){
        redirect("/");
    }
    if(session.data?.user?.role !== "DONOR") {
        redirect("/dashboard");
    }

    return (
        <div>
            {children}
        </div>
    );
}