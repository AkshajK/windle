import * as React from "react";
import { styled } from "@mui/material/styles";
import Badge from "@mui/material/Badge";

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

export const StyledBadge = styled(Badge)(({ theme }) => ({
  "& .MuiBadge-badge": {
    backgroundColor: "#44b700",
    color: "#44b700",
    boxShadow: `0 0 0 2px ${theme.palette.background.paper}`,
    /*"&::after": {
      position: "absolute",
      top: 0,
      left: 0,
      width: "6px",
      height: "6px",
      borderRadius: "50%",
      animation: "ripple 1.2s infinite ease-in-out",
      border: "1px solid currentColor",
      content: '""',
    },*/
  },
  /*"@keyframes ripple": {
    "0%": {
      transform: "scale(.8)",
      opacity: 1,
    },
    "100%": {
      transform: "scale(2.4)",
      opacity: 0,
    },
  },*/
}));
