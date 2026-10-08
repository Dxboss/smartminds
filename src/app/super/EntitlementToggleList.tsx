"use client";

import React, { useState } from "react";
import { FeatureEntitlement } from "@/lib/repositories/types";
import { toggleEntitlementAction } from "./actions";

interface Props {
  initialEntitlements: FeatureEntitlement[];
}

export const EntitlementToggleList: React.FC<Props> = ({
  initialEntitlements,
}) => {
  const [entitlements, setEntitlements] = useState(initialEntitlements);
  const [loadingKey, setLoadingKey] = useState<string | null>(null);

  const handleToggle = async (item: FeatureEntitlement) => {
    setLoadingKey(item.module_key);
    const nextState = !item.enabled;
    try {
      await toggleEntitlementAction(item.module_key, nextState);
      setEntitlements((prev) =>
        prev.map((e) =>
          e.module_key === item.module_key ? { ...e, enabled: nextState } : e
        )
      );
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to toggle entitlement");
    } finally {
      setLoadingKey(null);
    }
  };

  return (
    <div className="divide-y divide-line">
      {entitlements.map((e) => {
        const isLoading = loadingKey === e.module_key;
        return (
          <div
            key={e.module_key}
            className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 hover:bg-paper/30 transition-colors"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="font-bold text-sm text-navy-900">{e.name}</span>
                <span className="font-mono text-[11px] text-ink-soft px-1.5 py-0.5 rounded-sm bg-navy-900/5">
                  {e.module_key}
                </span>
              </div>
              <p className="text-xs text-ink-soft leading-relaxed max-w-xl">
                {e.description}
              </p>
            </div>

            <div className="flex items-center gap-3 self-end sm:self-auto">
              <span
                className={`text-xs font-semibold px-2 py-0.5 rounded-sm ${
                  e.enabled
                    ? "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    : "bg-paper text-ink-soft border border-line"
                }`}
              >
                {e.enabled ? "Active" : "Locked"}
              </span>

              <button
                type="button"
                onClick={() => handleToggle(e)}
                disabled={isLoading}
                className={`px-3 py-1.5 rounded-sm text-xs font-bold transition-all min-h-[36px] ${
                  e.enabled
                    ? "bg-red-50 text-red-700 hover:bg-red-100 border border-red-200"
                    : "bg-navy-900 text-white hover:bg-navy-700"
                } disabled:opacity-50`}
              >
                {isLoading ? "Saving..." : e.enabled ? "Disable module" : "Enable module"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
