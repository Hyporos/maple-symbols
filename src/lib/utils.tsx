import { twMerge } from "tailwind-merge";
import { clsx, ClassValue } from "clsx";

//
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// Check if the given value is valid
export function isValid(value: number) {
  return !isNaN(value) && value !== null;
}

// Get the remaining symbols needed for the next level
export function getRemainingSymbols(nextLevel: number, currentSymbol) {
  return (
    currentSymbol.symbolsRequired
      .slice(currentSymbol.level, nextLevel)
      .reduce((accumulator, experience) => accumulator + experience, 0) -
    currentSymbol.experience
  );
}

// Get the daily symbol count
export function getDailySymbols(currentSymbol) {
  return currentSymbol.daily
    ? currentSymbol.dailySymbols * (currentSymbol.extra ? 2 : 1)
    : 0;
}
