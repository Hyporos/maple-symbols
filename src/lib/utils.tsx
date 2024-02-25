import { twMerge } from "tailwind-merge";
import { clsx, ClassValue } from "clsx";

// Safer twMerge function
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

// Calculate the arcane/sacred power of the character
export function getPower(symbols, swapped) {
  let tempCurrentPower = 0;

  for (const symbol of symbols) {
    if (!isValid(symbol.level)) continue;

    if (
      (!swapped && symbol.type === "arcane") ||
      (swapped && symbol.type === "sacred")
    ) {
      tempCurrentPower += !swapped ? symbol.level * 10 + 20 : symbol.level * 10;
    }
  }

  return tempCurrentPower;
}
