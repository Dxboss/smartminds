"use client";

import React from "react";
import { useBooking } from "@/context/BookingContext";
import { Button, ButtonProps } from "@/components/ui/Button";

export interface BookingCTAButtonProps extends Omit<ButtonProps, "onClick"> {
  courseTitle?: string;
}

/**
 * BookingCTAButton: A ready-to-use button that automatically opens
 * the global consultation booking modal when clicked.
 */
export const BookingCTAButton: React.FC<BookingCTAButtonProps> = ({
  courseTitle,
  children = "Get free advice",
  ...props
}) => {
  const { openBooking } = useBooking();

  return (
    <Button type="button" onClick={() => openBooking(courseTitle)} {...props}>
      {children}
    </Button>
  );
};
