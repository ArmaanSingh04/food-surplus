"use client";

import { useMemo, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import Link from "next/link";
import { registerUser } from "@/app/actions";
import { Suspense } from "react";


type AccountType = "recipient" | "donor";

export default function RegisterDetailsPage() {
	const params = useSearchParams();
	const router = useRouter();
	const typeParam = (params.get("type") || "recipient") as AccountType;
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);

	const heading = useMemo(() => {
		return typeParam === "donor" ? "Create your provider account" : "Create your recipient account";
	}, [typeParam]);

	function handleSubmit() {
		setIsSubmitting(true);
	}

	return (
		<Suspense fallback={<div>Loading...</div>}>
		<div className="min-h-screen flex items-start sm:items-center justify-center bg-amber-50 px-4 py-10">
			<div className="w-full max-w-2xl rounded-2xl bg-white shadow-lg border border-amber-100 p-6 sm:p-8">
				<button
					onClick={() => router.back()}
					className="text-sm text-amber-700 hover:underline"
				>
					Back to account type
				</button>
				<h1 className="mt-3 text-3xl font-semibold text-amber-900">{heading}</h1>

				<form action={registerUser} onSubmit={handleSubmit} className="mt-6 space-y-4">
					<input type="hidden" name="accountType" defaultValue={typeParam} />
					<label className="block">
						<span className="block text-sm font-medium text-amber-900">Email Address</span>
						<input
							name="email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-2 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-amber-900 placeholder-amber-900/40 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
							placeholder="you@example.com"
						/>
					</label>
					<label className="block">
						<span className="block text-sm font-medium text-amber-900">Password</span>
						<input
							name="password"
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="mt-2 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-amber-900 placeholder-amber-900/40 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
							placeholder="••••••••"
						/>
					</label>

					<button
						type="submit"
						disabled={isSubmitting}
						className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
					>
						{isSubmitting ? "Signing up..." : "Sign up"}
					</button>
					<p className="text-center text-sm text-amber-700/80">
						Already have an account? <Link href="/login" className="text-emerald-700 hover:underline">Login</Link>
					</p>
				</form>
			</div>
		</div>
		</Suspense>
	);
}


