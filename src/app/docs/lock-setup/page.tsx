import Link from "next/link";
import { KeyRound, CheckCircle2, ExternalLink, Wifi, Smartphone, AlertTriangle } from "lucide-react";

export const metadata = {
  title: "Lock Setup Guide",
  description: "How to connect your smart lock to KeySherpa",
};

const COMPATIBLE_LOCKS = [
  { brand: "Schlage", models: "Encode, Connect, Sense" },
  { brand: "SmartThings", models: "Any Z-Wave lock connected to SmartThings Hub" },
  { brand: "August", models: "Smart Lock Pro, WiFi Smart Lock" },
  { brand: "Yale", models: "Assure Lock, Access, Conexis" },
  { brand: "Kwikset", models: "Halo, SmartCode 888, 914" },
  { brand: "Igloohome", models: "Smart Deadbolt, Smart Padlock" },
];

export default function LockSetupPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-gray-100 bg-white/95 backdrop-blur-sm">
        <div className="mx-auto flex h-16 max-w-4xl items-center justify-between px-4 sm:px-6">
          <Link href="/" className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-600 text-white">
              <KeyRound className="h-4 w-4" />
            </div>
            <span className="text-lg font-bold tracking-tight">KeySherpa</span>
          </Link>
          <Link
            href="/dashboard"
            className="text-sm font-medium text-violet-600 hover:underline"
          >
            Back to Dashboard →
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-4xl px-4 py-16 sm:px-6">
        {/* Title */}
        <div className="mb-12">
          <span className="inline-block rounded-full bg-violet-50 px-3 py-1 text-xs font-semibold text-violet-600 mb-4">
            Setup Guide
          </span>
          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900">
            Connecting Your Smart Lock
          </h1>
          <p className="mt-4 text-lg text-gray-500 leading-relaxed">
            KeySherpa uses <strong>Seam</strong> to communicate with your smart lock. Seam is a universal smart device API that supports 150+ lock brands. This guide walks you through the full setup from hardware to your first automated tour.
          </p>
        </div>

        {/* What you need */}
        <section className="mb-12 rounded-2xl border border-gray-100 bg-gray-50 p-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Before you start</h2>
          <ul className="space-y-3">
            {[
              "A compatible smart lock installed on your property door",
              "The lock's hub or bridge connected to your WiFi (if required)",
              "The lock manufacturer's app installed and the lock added to your account",
              "Your KeySherpa account with at least one property created",
            ].map((item) => (
              <li key={item} className="flex items-start gap-3 text-sm text-gray-600">
                <CheckCircle2 className="h-5 w-5 text-violet-600 flex-shrink-0 mt-0.5" />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Steps */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-8">Setup Steps</h2>
          <div className="space-y-10">

            {/* Step 1 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                  01
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Create a Seam account</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                  Seam is the service that bridges KeySherpa and your physical lock. You need a free Seam account to get started.
                </p>
                <ol className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">1</span>
                    Go to <a href="https://console.seam.co" target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline inline-flex items-center gap-1">console.seam.co <ExternalLink className="h-3 w-3" /></a> and sign up for a free account
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">2</span>
                    Create a new workspace — name it after your company
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">3</span>
                    From the left menu, go to <strong>API Keys</strong> and create a new key. Copy it — you'll need it shortly.
                  </li>
                </ol>
              </div>
            </div>

            {/* Step 2 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                  02
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Connect your lock to Seam</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                  In Seam, you'll connect your lock by logging into your lock manufacturer's account (Schlage, SmartThings, August, etc.).
                </p>
                <ol className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">1</span>
                    In the Seam Console, click <strong>Devices</strong> → <strong>Connect a Device</strong>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">2</span>
                    Select your lock brand from the list (e.g. SmartThings, Schlage, August)
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">3</span>
                    Log in with your lock manufacturer account credentials
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">4</span>
                    Your lock should appear in <strong>Devices</strong> within a few seconds. Confirm it shows as <span className="text-green-600 font-medium">Online</span>.
                  </li>
                </ol>
                <div className="mt-4 rounded-xl bg-amber-50 border border-amber-100 p-4 flex gap-3">
                  <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-amber-700">
                    <strong>SmartThings users:</strong> Make sure your lock is first added to the SmartThings app and your hub is online before connecting to Seam.
                  </p>
                </div>
              </div>
            </div>

            {/* Step 3 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                  03
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Add your Seam API key to KeySherpa</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                  This is what allows KeySherpa to automatically create and delete PIN codes on your lock.
                </p>
                <ol className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">1</span>
                    In KeySherpa, go to <strong>Settings</strong> and find the <strong>Seam API Key</strong> field
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">2</span>
                    Paste your Seam API key (starts with <code className="font-mono bg-gray-100 px-1 rounded">seam_</code>) and save
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">3</span>
                    Go to <strong>Integrations</strong> — your lock should now appear in the Connected Devices list
                  </li>
                </ol>
              </div>
            </div>

            {/* Step 4 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-slate-950 text-sm font-bold text-white">
                  04
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">Assign the lock to a property</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                  Each property in KeySherpa needs to be linked to a specific lock device.
                </p>
                <ol className="mt-4 space-y-2 text-sm text-gray-600">
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">1</span>
                    Go to <strong>Properties</strong> and open the property you want to enable tours for
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">2</span>
                    Click <strong>Edit</strong> and find the <strong>Smart Lock Device</strong> dropdown
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-mono text-xs bg-gray-100 rounded px-1.5 py-0.5 mt-0.5">3</span>
                    Select your lock from the list and save
                  </li>
                </ol>
              </div>
            </div>

            {/* Step 5 */}
            <div className="flex gap-6">
              <div className="flex-shrink-0">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-violet-600 text-sm font-bold text-white shadow-lg shadow-violet-500/30">
                  ✓
                </div>
              </div>
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">You're live — test it</h3>
                <p className="mt-2 text-gray-500 text-sm leading-relaxed">
                  Book a test tour through your tour page. KeySherpa will automatically generate a PIN code 15 minutes before the tour starts and delete it when the tour ends. The visitor receives the code by SMS and on the tour access page.
                </p>
                <div className="mt-4 rounded-xl bg-violet-50 border border-violet-100 p-4 flex gap-3">
                  <Wifi className="h-4 w-4 text-violet-600 flex-shrink-0 mt-0.5" />
                  <p className="text-xs text-violet-700">
                    <strong>Pro tip:</strong> Check <strong>Integrations</strong> in your dashboard to monitor lock status, battery level, and connectivity in real time.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Compatible locks */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Compatible Lock Brands</h2>
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {COMPATIBLE_LOCKS.map((lock) => (
              <div key={lock.brand} className="flex items-start gap-3 rounded-xl border border-gray-100 p-4">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-violet-50 flex-shrink-0">
                  <Smartphone className="h-4 w-4 text-violet-600" />
                </div>
                <div>
                  <p className="font-semibold text-gray-900 text-sm">{lock.brand}</p>
                  <p className="text-xs text-gray-500 mt-0.5">{lock.models}</p>
                </div>
              </div>
            ))}
          </div>
          <p className="mt-4 text-sm text-gray-400">
            Full list of 150+ supported devices at{" "}
            <a
              href="https://docs.seam.co/latest/device-guides"
              target="_blank"
              rel="noopener noreferrer"
              className="text-violet-600 hover:underline inline-flex items-center gap-1"
            >
              docs.seam.co <ExternalLink className="h-3 w-3" />
            </a>
          </p>
        </section>

        {/* Troubleshooting */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-6">Troubleshooting</h2>
          <div className="space-y-4">
            {[
              {
                q: "My lock shows as Offline in the dashboard",
                a: "Check that your lock hub is powered on and connected to WiFi. For SmartThings, open the app and confirm the hub status is Active. Locks go offline if the hub loses internet.",
              },
              {
                q: "PIN codes aren't being created",
                a: "Confirm your Seam API key is saved in Settings and your property has a lock assigned. Also check that the tour status transitions correctly — codes are programmed 15 minutes before the tour starts via Inngest automation.",
              },
              {
                q: "The lock shows online but the keypad isn't accepting codes",
                a: "Try locking and unlocking from the Seam console to verify communication. If the keypad hardware itself isn't responding, it may need a factory reset or the keypad ribbon cable may be loose — contact the lock manufacturer.",
              },
              {
                q: "I connected my lock to Seam but it doesn't appear in KeySherpa",
                a: "Go to Integrations and refresh the page. If it still doesn't appear, verify your Seam API key in Settings is the correct one from your Seam workspace.",
              },
            ].map((item) => (
              <div key={item.q} className="rounded-xl border border-gray-100 p-5">
                <p className="font-semibold text-gray-900 text-sm">{item.q}</p>
                <p className="mt-2 text-sm text-gray-500 leading-relaxed">{item.a}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Help */}
        <div className="rounded-2xl bg-slate-950 p-8 text-center">
          <h3 className="text-xl font-bold text-white">Still need help?</h3>
          <p className="mt-2 text-slate-400 text-sm">
            Reach out and we'll get your lock connected.
          </p>
          <a
            href="mailto:support@keysherpa.io"
            className="mt-4 inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-semibold text-white
              bg-violet-600/90 border border-violet-400/40
              shadow-[0_0_20px_2px_rgba(139,92,246,0.4)]
              hover:shadow-[0_0_28px_4px_rgba(139,92,246,0.55)]
              hover:bg-violet-500/90 transition-all"
          >
            Contact Support
          </a>
        </div>
      </main>
    </div>
  );
}
