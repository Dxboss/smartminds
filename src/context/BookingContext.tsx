"use client";

import React, { createContext, useContext, useState } from "react";

export interface BookingContextType {
  isOpen: boolean;
  courseInterest?: string;
  openBooking: (courseTitle?: string) => void;
  closeBooking: () => void;
}

const BookingContext = createContext<BookingContextType | undefined>(undefined);

export const BookingProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [courseInterest, setCourseInterest] = useState<string | undefined>(
    undefined
  );

  const openBooking = (courseTitle?: string) => {
    setCourseInterest(courseTitle);
    setIsOpen(true);
  };

  const closeBooking = () => {
    setIsOpen(false);
    setCourseInterest(undefined);
  };

  return (
    <BookingContext.Provider
      value={{
        isOpen,
        courseInterest,
        openBooking,
        closeBooking,
      }}
    >
      {children}
    </BookingContext.Provider>
  );
};

export const useBooking = (): BookingContextType => {
  const context = useContext(BookingContext);
  if (!context) {
    throw new Error("useBooking must be used within a BookingProvider");
  }
  return context;
};
