"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { Send, Mic } from "lucide-react";

interface AgentActionUIProps {
  question: string;
  onSubmit: (answer: string) => void;
}

export function AgentActionUI({ question, onSubmit }: AgentActionUIProps) {
  const [value, setValue] = useState("");

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (value.trim()) {
      onSubmit(value);
      setValue("");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="mt-4 rounded-[2rem] border border-[rgba(192,133,82,0.2)] bg-[rgba(192,133,82,0.05)] p-6 backdrop-blur-md"
    >
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-[#000000]">
        Pregunta Dinámica (AG-UI)
      </p>
      <h3 className="mt-3 text-lg font-medium text-[#000000]">
        {question}
      </h3>
      
      <form onSubmit={handleSubmit} className="mt-6 flex gap-3">
        <div className="relative flex-1">
          <input
            type="text"
            value={value}
            onChange={(e) => setValue(e.target.value)}
            placeholder="Escribe tu respuesta aquí..."
            className="w-full rounded-2xl border border-black/10 bg-black/5 py-4 pl-5 pr-12 text-sm text-[#000000] outline-none transition focus:border-black/50 focus:bg-black/10"
          />
          <button
            type="button"
            className="absolute right-3 top-1/2 -translate-y-1/2 text-[#8b9b96] hover:text-[#c08552]"
          >
            <Mic size={18} />
          </button>
        </div>
        <button
          type="submit"
          disabled={!value.trim()}
          className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#c08552] text-[#0a1a19] shadow-lg transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100"
        >
          <Send size={20} />
        </button>
      </form>
    </motion.div>
  );
}
