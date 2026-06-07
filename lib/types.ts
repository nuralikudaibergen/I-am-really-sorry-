export type Wish = {
  id: string;
  name: string | null;   // optional sender name from the form
  choice: string;        // emoji + label, e.g. "🍫 A delicious chocolate bar..."
  custom: string | null; // free-text wish if "Something else" was chosen
  message: string;       // the saved full string we display in admin
  createdAt: string;     // ISO date string
  userAgent?: string | null;
};

export const WISH_OPTIONS: { key: string; label: string; emoji: string }[] = [
  { key: "chocolate", emoji: "🍫", label: "A delicious chocolate bar / sweets" },
  { key: "movie",     emoji: "🍿", label: "Movie night (any movie you want!)" },
  { key: "coffee",    emoji: "☕", label: "A nice coffee and a long walk" },
  { key: "dinner",    emoji: "🍕", label: "Romantic dinner (pizza or sushi date)" },
  { key: "other",     emoji: "📝", label: "Something else..." },
];

export function getWishOptionByKey(key: string) {
  return WISH_OPTIONS.find((o) => o.key === key);
}
