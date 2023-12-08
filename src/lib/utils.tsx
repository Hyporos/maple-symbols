// Check if the given value is valid
const isValid = (value: number) => {
  return !isNaN(value) && value !== null;
};

// Get the remaining symbols needed for the next level
const getRemainingSymbols = (nextLevel: number, currentSymbol) => {
  return (
    currentSymbol.symbolsRequired
      .slice(currentSymbol.level, nextLevel)
      .reduce((accumulator, experience) => accumulator + experience, 0) -
    currentSymbol.experience
  );
};

// Get the daily symbol count
const getDailySymbols = (currentSymbol) => {
  return currentSymbol.daily
    ? currentSymbol.dailySymbols * (currentSymbol.extra ? 2 : 1)
    : 0;
};

export { isValid, getRemainingSymbols, getDailySymbols };
