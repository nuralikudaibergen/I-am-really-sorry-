import Link from "next/link";
import FloatingEmojis from "@/components/FloatingEmojis";

export default function NotFound() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 sparkle-bg">
      <FloatingEmojis />
      <div className="rounded-3xl bg-white/90 p-8 shadow-card border border-white text-center max-w-sm">
        <div className="text-5xl mb-2">🥺</div>
        <h1 className="text-rose-500 text-2xl font-bold">Page not found</h1>
        <p className="text-rose-400 mt-2 text-sm">
          Maybe you meant to go{" "}
          <Link href="/" className="underline text-rose-500">
            back home
          </Link>
          ?
        </p>
      </div>
    </main>
  );
}
