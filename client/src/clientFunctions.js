export const isCorrect = (guess) => {
  return guess.join("") === "greengreengreengreengreen";
};
export const secToString = (num, short = false) => {
  if (num < 60) return `${Math.floor(10 * num) / 10} ${short ? "sec" : "seconds"}`;
  if (num < 60 * 60)
    return `${Math.floor(num / 60)} ${short ? "min" : "minutes"} ${Math.floor(num % 60)} ${
      short ? "sec" : "seconds"
    }`;
  if (num < 24 * 60 * 60)
    return `${Math.floor(num / (60 * 60))} ${short ? "hr" : "hours"} ${Math.floor(
      (num % 3600) / 60
    )} ${short ? "min" : "minutes"} ${Math.floor(num % 60)} ${short ? "sec" : "seconds"}`;
  return `${Math.floor(num / (60 * 60 * 24))} days ${Math.floor((num % (60 * 60 * 24)) / 3600)} ${
    short ? "hr" : "hours"
  } ${Math.floor((num % 3600) / 60)} ${short ? "min" : "minutes"} ${Math.floor(num % 60)} ${
    short ? "sec" : "seconds"
  }`;
};
