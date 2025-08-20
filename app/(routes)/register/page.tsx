"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

type AccountType = "recipient" | "donor";

export default function RegisterPage() {
	const router = useRouter();
	const [accountType, setAccountType] = useState<AccountType>("recipient");

	function handleSelect(type: AccountType) {
		setAccountType(type);
	}

	function handleContinue() {
		router.push(`/register/details?type=${accountType}`);
	}

	return (
		<div className="min-h-screen flex items-start sm:items-center justify-center bg-amber-50 px-4 py-10">
			<div className="w-full max-w-4xl rounded-2xl bg-white shadow-lg border border-amber-100 p-6 sm:p-8">
				<h1 className="text-3xl font-semibold text-amber-900 text-center">Choose Your Account Type</h1>
				<p className="mt-1 text-sm text-amber-700/70 text-center">Select the option that best describes you</p>

				<div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-6">
					<button
						type="button"
						onClick={() => handleSelect("recipient")}
						className={`text-left rounded-xl border p-5 transition shadow-sm focus:outline-none ${
							accountType === "recipient"
								? "border-emerald-500 ring-2 ring-emerald-200"
								: "border-amber-200 hover:border-amber-300"
						}`}
					>
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-xl font-semibold text-amber-900">Food Recipient</h2>
								<p className="text-sm text-emerald-700 mt-0.5">Student / Individuals / NGOs</p>
							</div>
							{accountType === "recipient" ? (
								<span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">Selected</span>
							) : null}
						</div>
						<p className="mt-3 text-sm text-amber-800/80">
							I want to find and receive surplus food from nearby locations.
						</p>
					</button>

					<button
						type="button"
						onClick={() => handleSelect("donor")}
						className={`text-left rounded-xl border p-5 transition shadow-sm focus:outline-none ${
							accountType === "donor"
								? "border-emerald-500 ring-2 ring-emerald-200"
								: "border-amber-200 hover:border-amber-300"
						}`}
					>
						<div className="flex items-center justify-between">
							<div>
								<h2 className="text-xl font-semibold text-amber-900">Food Provider</h2>
								<p className="text-sm text-emerald-700 mt-0.5">Canteen / Restaurant / Hotel</p>
							</div>
							{accountType === "donor" ? (
								<span className="text-xs bg-emerald-100 text-emerald-800 px-3 py-1 rounded-full">Selected</span>
							) : null}
						</div>
						<p className="mt-3 text-sm text-amber-800/80">
							I want to donate surplus food and track my impact.
						</p>
					</button>
				</div>

				<div className="mt-8 max-w-xl mx-auto flex items-center justify-between gap-4">
					<p className="text-sm text-amber-700/80">
						Already have an account? <Link href="/login" className="text-emerald-700 hover:underline">Login</Link>
					</p>
					<button
						onClick={handleContinue}
						className="rounded-lg bg-emerald-600 px-5 py-2.5 text-white font-medium hover:bg-emerald-700"
					>
						Continue
					</button>
				</div>
			</div>
		</div>
	);
}


