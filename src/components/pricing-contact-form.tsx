"use client";

import { useState } from "react";

export function PricingContactForm() {
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    email: "",
    company: "",
    properties: "",
    message: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setSubmitted(true);
      } else {
        const data = await res.json();
        setError(data.error || "Failed to send. Please try again.");
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-12">
        <div className="inline-flex h-16 w-16 items-center justify-center rounded-full bg-violet-100 mb-4">
          <svg className="h-8 w-8 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" /></svg>
        </div>
        <h3 className="text-xl font-bold text-[#2C2A26]">Thanks! We&apos;ll be in touch.</h3>
        <p className="mt-2 text-[#6B705C]">Check your inbox for a confirmation email. We typically respond within 1 business day.</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="mt-10 text-left space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[#3A3632] mb-1">First Name</label>
          <input name="firstName" value={form.firstName} onChange={handleChange} required className="w-full rounded-lg border border-[#D4C9B8] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent" />
        </div>
        <div>
          <label className="block text-sm font-medium text-[#3A3632] mb-1">Last Name</label>
          <input name="lastName" value={form.lastName} onChange={handleChange} required className="w-full rounded-lg border border-[#D4C9B8] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent" />
        </div>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#3A3632] mb-1">Work Email</label>
        <input name="email" type="email" value={form.email} onChange={handleChange} required className="w-full rounded-lg border border-[#D4C9B8] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#3A3632] mb-1">Company</label>
        <input name="company" value={form.company} onChange={handleChange} required className="w-full rounded-lg border border-[#D4C9B8] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent" />
      </div>
      <div>
        <label className="block text-sm font-medium text-[#3A3632] mb-1">Number of Properties</label>
        <select name="properties" value={form.properties} onChange={handleChange} required className="w-full rounded-lg border border-[#D4C9B8] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent">
          <option value="">Select range...</option>
          <option value="1-5">1 - 5</option>
          <option value="6-20">6 - 20</option>
          <option value="21-50">21 - 50</option>
          <option value="51-100">51 - 100</option>
          <option value="100+">100+</option>
        </select>
      </div>
      <div>
        <label className="block text-sm font-medium text-[#3A3632] mb-1">Anything else?</label>
        <textarea name="message" value={form.message} onChange={handleChange} rows={3} className="w-full rounded-lg border border-[#D4C9B8] px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-[#A0522D] focus:border-transparent" placeholder="Tell us about your current tour setup, goals, or questions..." />
      </div>
      {error && <p className="text-sm text-red-700">{error}</p>}
      <button
        type="submit"
        disabled={submitting}
        className="w-full rounded-lg py-3 text-sm font-semibold text-white transition-colors disabled:opacity-50"
        style={{ backgroundColor: "#A0522D" }}
      >
        {submitting ? "Sending..." : "Request Pricing"}
      </button>
      <p className="text-xs text-center text-[#A68A64]">We typically respond within 1 business day.</p>
    </form>
  );
}
