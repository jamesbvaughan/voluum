import { create } from "zustand";

export const useSettings = create(() => ({
  maxVolume: 100,
  speakerIpAddress: null as string | null,
}));
