// 예약 선택 상태 Store

import { create } from "zustand";
import { persist } from "zustand/middleware";
import { Port, DEFAULT_PORT } from "@/lib/ports";
import { CabinType } from "@/types";

interface BookingState {
  // 예약 선택 상태 (페이지 이동해도 유지)
  bookingDeparturePort: Port | null;
  bookingDestinationPort: Port | null;
  bookingCabinType: CabinType;
  bookingCustomMinutes: number;
  bookingCustomRestMinutes: number;
  bookingIsCustomTime: boolean;

  // 액션
  setBookingDeparturePort: (port: Port | null) => void;
  setBookingDestinationPort: (port: Port | null) => void;
  setBookingCabinType: (cabin: CabinType) => void;
  setBookingCustomMinutes: (minutes: number) => void;
  setBookingCustomRestMinutes: (minutes: number) => void;
  setBookingIsCustomTime: (isCustom: boolean) => void;
  resetBooking: () => void;
}

export const useBookingStore = create<BookingState>()(
  persist(
    (set) => ({
      // 초기 상태
      bookingDeparturePort: DEFAULT_PORT,
      bookingDestinationPort: null,
      bookingCabinType: "standard",
      bookingCustomMinutes: 25,
      bookingCustomRestMinutes: 5,
      bookingIsCustomTime: false,

      // 액션
      setBookingDeparturePort: (port: Port | null) => {
        set({ bookingDeparturePort: port });
      },

      setBookingDestinationPort: (port: Port | null) => {
        set({ bookingDestinationPort: port });
      },

      setBookingCabinType: (cabin: CabinType) => {
        set({ bookingCabinType: cabin });
      },

      setBookingCustomMinutes: (minutes: number) => {
        set({ bookingCustomMinutes: minutes });
      },

      setBookingCustomRestMinutes: (minutes: number) => {
        set({ bookingCustomRestMinutes: minutes });
      },

      setBookingIsCustomTime: (isCustom: boolean) => {
        set({ bookingIsCustomTime: isCustom });
      },

      resetBooking: () => {
        set({
          bookingDeparturePort: DEFAULT_PORT,
          bookingDestinationPort: null,
          bookingCabinType: "standard",
          bookingCustomMinutes: 25,
          bookingCustomRestMinutes: 5,
          bookingIsCustomTime: false,
        });
      },
    }),
    {
      name: "booking-storage",
      partialize: (state) => ({
        bookingDeparturePort: state.bookingDeparturePort,
        bookingDestinationPort: state.bookingDestinationPort,
        bookingCabinType: state.bookingCabinType,
        bookingCustomMinutes: state.bookingCustomMinutes,
        bookingCustomRestMinutes: state.bookingCustomRestMinutes,
        bookingIsCustomTime: state.bookingIsCustomTime,
      }),
    }
  )
);
