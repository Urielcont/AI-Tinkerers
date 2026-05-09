"use client";

import { useState } from "react";
import { Send } from "lucide-react";
import { motion } from "framer-motion";

interface FollowUpInputProps {
  onAnswer: (answer: string) => void;
  placeholder?: string;
}

export function FollowUpInput({ onAnswer, placeholder = "Responde aquí para continuar el análisis..." }: FollowUpInputProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onAnswer(value);
      setValue("");
    }
  };

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="mt-4"
    >
      <form onSubmit={handleSubmit} className="flex gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder={placeholder}
          className="flex-1 rounded-xl border border-black/10 bg-black/5 px-4 py-3 text-sm text-black placeholder:text-black/40 outline-none transition focus:border-black/30 focus:bg-white"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="flex h-11 w-11 items-center justify-center rounded-xl bg-black text-white transition hover:scale-105 active:scale-95 disabled:opacity-30"
        >
          <Send size={18} />
        </button>
      </form>
    </motion.div>
  );
}
