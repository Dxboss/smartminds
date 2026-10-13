"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { signOutDemo } from "@/app/login/actions";
import { Icon } from "@/components/ui/Icon";
import { SessionUser } from "@/lib/repositories/types";

interface DemoModeBannerProps {
  user?: SessionUser | null;
}

export const DemoModeBanner: React.FC<DemoModeBannerProps> = () => {
  return null;
};
