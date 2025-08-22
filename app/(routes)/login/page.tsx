"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";

export default function LoginPage() {
	const router = useRouter();
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [isSubmitting, setIsSubmitting] = useState(false);
	const [error, setError] = useState<string | null>(null);

	async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
		e.preventDefault();
		setError(null);
		setIsSubmitting(true);
		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (result?.error) {
				setError("Invalid email or password");
				setIsSubmitting(false);
				return;
			}

			router.replace("/dashboard");
			router.refresh();
		} catch (err) {
			setError("Something went wrong. Please try again.");
			setIsSubmitting(false);
		}
	}

	return (
		<div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
			<div className="w-full max-w-md rounded-2xl bg-white shadow-lg border border-amber-100 p-8">
				<div className="mb-6 text-center">
					<h1 className="text-3xl font-semibold text-amber-900">Welcome back</h1>
					<p className="mt-1 text-sm text-amber-700/70">Sign in to your account</p>
				</div>

				<form onSubmit={handleSubmit} className="space-y-4">
					<div>
						<label htmlFor="email" className="block text-sm font-medium text-amber-900">
							Email address
						</label>
						<input
							id="email"
							type="email"
							required
							value={email}
							onChange={(e) => setEmail(e.target.value)}
							className="mt-2 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-amber-900 placeholder-amber-900/40 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
							placeholder="you@example.com"
						/>
					</div>

					<div>
						<label htmlFor="password" className="block text-sm font-medium text-amber-900">
							Password
						</label>
						<input
							id="password"
							type="password"
							required
							value={password}
							onChange={(e) => setPassword(e.target.value)}
							className="mt-2 w-full rounded-lg border border-amber-200 bg-white px-3 py-2 text-amber-900 placeholder-amber-900/40 outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200"
							placeholder="••••••••"
						/>
					</div>

					{error ? (
						<p className="text-sm text-red-600" role="alert">
							{error}
						</p>
					) : null}

					<button
						type="submit"
						disabled={isSubmitting}
						className="cursor-pointer mt-2 w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-white font-medium hover:bg-emerald-700 disabled:opacity-60 disabled:cursor-not-allowed"
					>
						{isSubmitting ? "Signing in..." : "Sign in"}
					</button>
				</form>
			</div>
		</div>
	);
}