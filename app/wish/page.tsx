import FloatingEmojis from "@/components/FloatingEmojis";
import WishForm from "@/components/WishForm";

export default function WishPage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 sparkle-bg">
      <FloatingEmojis />
      <WishForm />
    </main>
  );
}
