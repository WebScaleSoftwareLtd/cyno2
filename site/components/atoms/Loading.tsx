"use client";

import useDarkMode from "../hooks/useDarkMode";
import { MoonLoader } from "react-spinners";

export default function Loading() {
   const darkMode = useDarkMode();
   return <MoonLoader
      size={50}
      color={darkMode ? "#fff" : "#000"}
   />;
}
