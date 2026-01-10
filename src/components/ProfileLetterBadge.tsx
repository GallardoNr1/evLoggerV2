import React from "react";
import { cn } from "@/lib/utils";

type ProfileLetterBadgeProps = {
  name?: string | null;
  email?: string | null;
  className?: string;
};

const letterColors: Record<string, string> = {
  A: "bg-red-500 text-white",
  B: "bg-orange-500 text-white",
  C: "bg-amber-500 text-black",
  D: "bg-yellow-400 text-black",
  E: "bg-lime-500 text-black",
  F: "bg-green-500 text-white",
  G: "bg-emerald-500 text-white",
  H: "bg-teal-500 text-white",
  I: "bg-cyan-500 text-white",
  J: "bg-sky-500 text-white",
  K: "bg-blue-500 text-white",
  L: "bg-indigo-500 text-white",
  M: "bg-violet-500 text-white",
  N: "bg-purple-500 text-white",
  O: "bg-fuchsia-500 text-white",
  P: "bg-pink-500 text-white",
  Q: "bg-rose-500 text-white",
  R: "bg-red-600 text-white",
  S: "bg-orange-600 text-white",
  T: "bg-amber-600 text-white",
  U: "bg-yellow-600 text-black",
  V: "bg-lime-600 text-black",
  W: "bg-green-600 text-white",
  X: "bg-teal-600 text-white",
  Y: "bg-blue-600 text-white",
  Z: "bg-indigo-600 text-white",
};

function getOneLetter(name?: string | null, email?: string | null) {
  const raw = (name?.trim() || email?.trim() || "U").toUpperCase();
  const first = raw[0] ?? "U";
  return first >= "A" && first <= "Z" ? first : "U";
}

export const ProfileLetterBadge: React.FC<ProfileLetterBadgeProps> = ({
  name,
  email,
  className,
}) => {
  const letter = getOneLetter(name, email);
  const color = letterColors[letter] ?? letterColors.U;

  return (
    <span
      className={cn(
        "inline-flex items-center justify-center rounded-full font-semibold ring-2 ring-background",
        color,
        className,
      )}
      aria-label={`Inicial ${letter}`}
      title={letter}
    >
      {letter}
    </span>
  );
};
