import { atom } from "recoil";

export const modalState = atom({
  key: "modalState",
  default: false,
});

export const eventNameState = atom({
  key: "eventNameState",
  default: "",
});

export const eventPage = atom({
  key: "eventPage",
  default: false,
});
