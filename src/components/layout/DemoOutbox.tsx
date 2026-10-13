"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { OutboxMessage } from "@/lib/repositories/seedData";

interface Props {
  messages?: OutboxMessage[];
}

export const DemoOutbox: React.FC<Props> = ({ messages = [] }) => {
  const isDemo =
    process.env.NEXT_PUBLIC_DEMO_MODE === "true" ||
    process.env.DEMO_MODE === "true";

  const [isOpen, setIsOpen] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState<OutboxMessage | null>(
    messages[0] || null
  );

  if (!isDemo) return null;

  return (
    <>
      {/* Floating Outbox Trigger Button (Visible across demo portals) */}
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="fixed bottom-5 right-5 z-40 bg-navy-900 text-white hover:bg-navy-700 px-3.5 py-2.5 rounded-md shadow-lg border border-gold-500/40 flex items-center gap-2 text-xs font-bold transition-all hover:scale-105 min-h-[44px]"
        aria-label="Open Demo Email Outbox"
      >
        <Icon name="mail" size={16} className="text-gold-300" />
        <span>Demo Outbox</span>
        <span className="px-1.5 py-0.2 bg-gold-500 text-navy-900 text-[10px] font-black rounded-full">
          {messages.length}
        </span>
      </button>

      {/* Slide-over Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-xs">
          <div className="w-full max-w-xl bg-white h-full shadow-2xl flex flex-col border-l border-line animate-in slide-in-from-right duration-200">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-line bg-navy-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-sm bg-white/10 flex items-center justify-center text-gold-300">
                  <Icon name="mail" size={18} />
                </div>
                <div>
                  <h2 className="font-heading text-lg font-bold">
                    Simulated Email Outbox
                  </h2>
                  <p className="text-[11px] text-white/70">
                    Dispatched notifications & approved template messages
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 rounded-sm hover:bg-white/10 text-white/80 flex items-center justify-center transition-colors"
                aria-label="Close Outbox"
              >
                <Icon name="close" size={18} />
              </button>
            </div>

            {/* Main Area: Message List & Detail View */}
            <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
              {messages.length === 0 ? (
                <div className="text-center py-12 text-xs text-ink-soft space-y-1">
                  <Icon name="mail" size={32} className="mx-auto text-ink-soft/40 mb-2" />
                  <p className="font-bold text-navy-900">Outbox is empty</p>
                  <p>When assignments or reminders are triggered, emails appear here.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {/* Message Selector Tabs */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-ink-soft uppercase tracking-wider block">
                      Dispatched Messages ({messages.length})
                    </span>
                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {messages.map((msg) => (
                        <button
                          key={msg.id}
                          type="button"
                          onClick={() => setSelectedMessage(msg)}
                          className={`w-full text-left p-3 rounded-sm border text-xs transition-colors flex items-center justify-between gap-2 ${
                            selectedMessage?.id === msg.id
                              ? "bg-navy-900 text-white border-navy-900"
                              : "bg-paper text-navy-900 border-line hover:bg-white"
                          }`}
                        >
                          <div className="truncate pr-2">
                            <span className="font-bold block truncate">
                              {msg.subject}
                            </span>
                            <span
                              className={`text-[11px] ${
                                selectedMessage?.id === msg.id
                                  ? "text-white/70"
                                  : "text-ink-soft"
                              }`}
                            >
                              To: {msg.recipientEmail}
                            </span>
                          </div>
                          <span
                            className={`text-[10px] font-mono flex-shrink-0 ${
                              selectedMessage?.id === msg.id
                                ? "text-gold-300"
                                : "text-ink-soft"
                            }`}
                          >
                            {new Date(msg.sentAt).toLocaleTimeString("en-GB", {
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Active Message Content Preview */}
                  {selectedMessage && (
                    <div className="bg-paper rounded-sm border border-line p-5 space-y-4 text-xs">
                      <div className="space-y-1.5 border-b border-line pb-3">
                        <div className="flex items-center justify-between text-[11px] text-ink-soft">
                          <span>Trigger: {selectedMessage.triggerEvent}</span>
                          <span className="font-mono">
                            {new Date(selectedMessage.sentAt).toLocaleString("en-GB")}
                          </span>
                        </div>
                        <h3 className="font-bold text-sm text-navy-900">
                          {selectedMessage.subject}
                        </h3>
                        <p className="text-ink-soft">
                          Recipient:{" "}
                          <strong className="text-navy-900 font-mono">
                            {selectedMessage.recipientEmail}
                          </strong>
                        </p>
                      </div>

                      {/* Rendered Email Body */}
                      <div className="bg-white p-4 rounded-sm border border-line whitespace-pre-line text-ink leading-relaxed font-sans text-xs">
                        {selectedMessage.renderedBody}
                      </div>

                      <div className="p-3 bg-blue-50 border border-blue-200 rounded-sm text-[11px] text-blue-900 flex items-center gap-2">
                        <Icon name="info" size={14} className="text-blue-700 flex-shrink-0" />
                        <span>
                          Simulated email dispatch. Outbox queue logs messages in demonstration environment.
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
};
