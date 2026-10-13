"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { MessageTemplate, MessageLogEntry, Learner } from "@/lib/repositories/types";
import { EmailSettings } from "@/lib/emailSettings";
import { TemplateMessageComposer } from "@/components/admin/TemplateMessageComposer";
import { EmailSettingsManager } from "@/components/admin/EmailSettingsManager";

interface Props {
  templates: MessageTemplate[];
  initialLogs: MessageLogEntry[];
  learners: Learner[];
  emailSettings: EmailSettings;
  canManageSettings: boolean;
}

export const AdminCommunicationsHub: React.FC<Props> = ({
  templates,
  initialLogs,
  learners,
  emailSettings,
  canManageSettings,
}) => {
  const [activeTab, setActiveTab] = useState<"composer" | "senders">("composer");

  return (
    <div className="space-y-6">
      {/* Navigation Tabs */}
      <div className="flex border-b border-line gap-2">
        <button
          type="button"
          onClick={() => setActiveTab("composer")}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "composer"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-ink-soft hover:text-navy-900"
          }`}
        >
          <Icon name="mail" className="w-4 h-4" />
          <span>Notice Composer &amp; Broadcast</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("senders")}
          className={`pb-3 px-4 text-sm font-bold flex items-center gap-2 border-b-2 transition-colors ${
            activeTab === "senders"
              ? "border-navy-900 text-navy-900"
              : "border-transparent text-ink-soft hover:text-navy-900"
          }`}
        >
          <Icon name="edit" className="w-4 h-4" />
          <span>Departmental Senders &amp; Automations</span>
          {canManageSettings && (
            <span className="text-[10px] bg-navy-900 text-gold-400 font-bold px-1.5 py-0.5 rounded ml-1">
              Superadmin
            </span>
          )}
        </button>
      </div>

      {/* Tab Panels */}
      {activeTab === "composer" ? (
        <TemplateMessageComposer
          templates={templates}
          initialLogs={initialLogs}
          learners={learners}
        />
      ) : (
        <EmailSettingsManager
          initialSettings={emailSettings}
          canEdit={canManageSettings}
        />
      )}
    </div>
  );
};
