import FloatingEmojis from "@/components/FloatingEmojis";
import ForgivenessCard from "@/components/ForgivenessCard";

export default function HomePage() {
  return (
    <main className="relative min-h-screen flex items-center justify-center px-4 py-10 sparkle-bg">
      <FloatingEmojis />
      <ForgivenessCard />
    </main>
  );
}
