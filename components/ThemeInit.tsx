"use client";
import { useEffect } from "react";

export function ThemeInit() {
  useEffect(() => {
    const ajustes = localStorage.getItem("ajustes");
    if (ajustes) {
      const { temaOscuro } = JSON.parse(ajustes);
      if (temaOscuro) {
        document.documentElement.classList.add("dark");
      } else {
        document.documentElement.classList.remove("dark");
      }
    }
  }, []);

  return null;
}
