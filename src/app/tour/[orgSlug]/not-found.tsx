import Link from "next/link";

export default function TourNotFound() {
  return (
    <div className="min-h-screen bg-white flex flex-col items-center justify-center px-4 text-center">
      <h1 className="text-2xl font-bold text-gray-900">Page not found</h1>
      <p className="mt-2 text-gray-500 max-w-sm">
        This tour link may have expired or the organization no longer exists.
      </p>
      <Link href="/" className="mt-6 text-sm text-blue-600 hover:underline">
        Go to KeySherpa
      </Link>
    </div>
  );
}
