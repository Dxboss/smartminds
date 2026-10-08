"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useAuth } from "@/context/AuthContext";
import { PortalShell, PortalMenuItem } from "@/components/portal/PortalShell";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";

interface LeadItem {
  id: string;
  type: string;
  name: string;
  email: string;
  phone?: string | null;
  course_interest?: string | null;
  message?: string | null;
  extra_data?: Record<string, unknown>;
  utm_source?: string | null;
  created_at: string;
  status: string;
}

export default function AdminPortalPage() {
  const { user, isAuthenticated, loginAs } = useAuth();
  const [activeSection, setActiveSection] = useState("leads");
  const [leads, setLeads] = useState<LeadItem[]>([]);
  const [loadingLeads, setLoadingLeads] = useState(true);
  const [typeFilter, setTypeFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedLead, setSelectedLead] = useState<LeadItem | null>(null);

  // Fetch real leads from API
  useEffect(() => {
    async function fetchLeads() {
      try {
        setLoadingLeads(true);
        const res = await fetch("/api/leads");
        const data = await res.json();
        if (data.success && Array.isArray(data.leads)) {
          setLeads(data.leads);
        }
      } catch (err) {
        console.error("Failed to fetch leads:", err);
      } finally {
        setLoadingLeads(false);
      }
    }
    fetchLeads();
  }, []);

  // Update lead status locally
  const handleUpdateStatus = (leadId: string, newStatus: string) => {
    setLeads((prev) =>
      prev.map((l) => (l.id === leadId ? { ...l, status: newStatus } : l))
    );
    if (selectedLead?.id === leadId) {
      setSelectedLead((prev) => (prev ? { ...prev, status: newStatus } : null));
    }
  };

  // If user is not logged in or in another role, give quick switcher banner
  if (!isAuthenticated || user?.role !== "owner_admin") {
    return (
      <div className="min-h-screen bg-paper flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white p-8 rounded-md border border-line text-center space-y-4 shadow-card">
          <div className="w-12 h-12 rounded-full bg-navy-900 text-gold-300 mx-auto flex items-center justify-center">
            <Icon name="shield-check" size={24} />
          </div>
          <h1 className="font-heading text-2xl font-bold uppercase text-navy-900">
            College Owner & Admin Access
          </h1>
          <p className="text-sm text-ink-soft">
            You are currently not signed in with administrative permissions.
          </p>
          <div className="pt-2 space-y-2">
            <Button
              variant="primary"
              fullWidth
              size="md"
              onClick={() => loginAs("owner_admin")}
            >
              1-Click Sign In as College Administration (Owner)
            </Button>
            <Link
              href="/login"
              className="block text-xs font-semibold text-ink-soft hover:text-navy-900 underline pt-2"
            >
              Go to standard login screen
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Filter leads
  const filteredLeads = leads.filter((lead) => {
    const matchesType = typeFilter === "all" || lead.type === typeFilter;
    const matchesSearch =
      searchQuery === "" ||
      lead.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      lead.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (lead.course_interest &&
        lead.course_interest.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesType && matchesSearch;
  });

  const menuItems: PortalMenuItem[] = [
    {
      id: "leads",
      label: "Live Inquiries & Leads",
      icon: "mail",
      badge: leads.length,
    },
    {
      id: "enrolments",
      label: "Cohorts & Enrolments",
      icon: "users",
      badge: 42,
    },
    {
      id: "ledger",
      label: "Tuition & Payment Ledger",
      icon: "credit-card",
    },
    {
      id: "system",
      label: "Staging Diagnostics",
      icon: "shield-check",
    },
  ];

  return (
    <PortalShell
      role="owner_admin"
      portalTitle="Owner & Admin Hub"
      portalSubtitle="Smartminds College Leadership"
      menuItems={menuItems}
      activeSection={activeSection}
      onSectionChange={setActiveSection}
    >
      <div className="space-y-8 max-w-7xl mx-auto">
        {/* Executive KPI Summary Cards */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-md border border-line shadow-subtle">
            <div className="flex items-center justify-between text-ink-soft">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Inquiries</span>
              <Icon name="mail" size={18} className="text-gold-500" />
            </div>
            <p className="font-heading text-3xl font-bold text-navy-900 mt-2">
              {leads.length}
            </p>
            <p className="text-xs text-ink-soft mt-1">Website forms & WhatsApp</p>
          </div>

          <div className="bg-white p-5 rounded-md border border-line shadow-subtle">
            <div className="flex items-center justify-between text-ink-soft">
              <span className="text-xs font-semibold uppercase tracking-wider">Enrolled Learners</span>
              <Icon name="users" size={18} className="text-navy-900" />
            </div>
            <p className="font-heading text-3xl font-bold text-navy-900 mt-2">42</p>
            <p className="text-xs text-emerald-700 font-semibold mt-1">Across 4 qualifications</p>
          </div>

          <div className="bg-white p-5 rounded-md border border-line shadow-subtle">
            <div className="flex items-center justify-between text-ink-soft">
              <span className="text-xs font-semibold uppercase tracking-wider">Monthly Run-rate</span>
              <Icon name="credit-card" size={18} className="text-gold-500" />
            </div>
            <p className="font-heading text-3xl font-bold text-navy-900 mt-2">£8,400</p>
            <p className="text-xs text-ink-soft mt-1">Active instalment plans</p>
          </div>

          <div className="bg-white p-5 rounded-md border border-line shadow-subtle">
            <div className="flex items-center justify-between text-ink-soft">
              <span className="text-xs font-semibold uppercase tracking-wider">Assessor SLA</span>
              <Icon name="shield-check" size={18} className="text-emerald-600" />
            </div>
            <p className="font-heading text-3xl font-bold text-navy-900 mt-2">98.4%</p>
            <p className="text-xs text-emerald-700 font-semibold mt-1">&lt; 5 working day turnaround</p>
          </div>
        </div>

        {/* SECTION 1: Live Inquiries & Leads Inbox */}
        {activeSection === "leads" && (
          <div className="space-y-5">
            {/* Control Bar: Filters & Search & Export */}
            <div className="bg-white rounded-md border border-line p-4 shadow-subtle flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-semibold text-ink-soft mr-1">Filter:</span>
                {[
                  { id: "all", label: "All Leads" },
                  { id: "free_advice", label: "Free Advice" },
                  { id: "funded_eligibility", label: "Funded" },
                  { id: "private_tutoring", label: "Tutoring" },
                  { id: "general_contact", label: "Contact" },
                ].map((filter) => (
                  <button
                    key={filter.id}
                    type="button"
                    onClick={() => setTypeFilter(filter.id)}
                    className={`px-3 py-1.5 text-xs font-semibold rounded-sm border transition-colors ${
                      typeFilter === filter.id
                        ? "bg-navy-900 text-white border-navy-900"
                        : "bg-paper text-navy-900 border-line hover:bg-white"
                    }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <div className="relative flex-1 md:w-64">
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search name, email, course..."
                    className="w-full pl-9 pr-3.5 py-1.5 text-xs bg-paper border border-line rounded-sm focus:outline-none focus:ring-1 focus:ring-navy-900"
                  />
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-ink-soft">
                    <Icon name="search" size={14} />
                  </div>
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    const blob = new Blob([JSON.stringify(leads, null, 2)], {
                      type: "application/json",
                    });
                    const url = URL.createObjectURL(blob);
                    const a = document.createElement("a");
                    a.href = url;
                    a.download = `smartminds-leads-${new Date().toISOString().slice(0, 10)}.json`;
                    a.click();
                  }}
                  className="text-xs flex items-center gap-1.5 whitespace-nowrap"
                >
                  <Icon name="download" size={13} />
                  <span>Export JSON</span>
                </Button>
              </div>
            </div>

            {/* Leads Table */}
            <div className="bg-white rounded-md border border-line shadow-card overflow-hidden">
              {loadingLeads ? (
                <div className="p-12 text-center text-ink-soft">
                  <span className="w-6 h-6 border-2 border-navy-900 border-t-transparent rounded-full animate-spin inline-block mb-2" />
                  <p className="text-sm">Loading college admissions inbox...</p>
                </div>
              ) : filteredLeads.length === 0 ? (
                <div className="p-12 text-center text-ink-soft">
                  <Icon name="mail" size={32} className="mx-auto mb-2 text-navy-900/40" />
                  <p className="font-bold text-navy-900">No Inquiries Found</p>
                  <p className="text-sm">No submissions match the selected criteria.</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead>
                      <tr className="border-b border-line text-xs font-bold uppercase text-navy-900 bg-paper/50">
                        <th className="py-3 px-4">Applicant</th>
                        <th className="py-3 px-4">Type</th>
                        <th className="py-3 px-4">Course of Interest</th>
                        <th className="py-3 px-4">Contact</th>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4 text-right">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-line">
                      {filteredLeads.map((lead) => (
                        <tr key={lead.id} className="hover:bg-paper/40 transition-colors">
                          <td className="py-3.5 px-4">
                            <p className="font-bold text-navy-900">{lead.name}</p>
                            <p className="text-xs text-ink-soft truncate max-w-[170px]">
                              {lead.email}
                            </p>
                          </td>
                          <td className="py-3.5 px-4">
                            <span className="text-[10px] uppercase font-bold text-navy-900 bg-paper px-2 py-0.5 rounded border border-line">
                              {lead.type.replace(/_/g, " ")}
                            </span>
                          </td>
                          <td className="py-3.5 px-4 text-xs font-semibold text-navy-900 max-w-[190px] truncate">
                            {lead.course_interest || "General Consultation"}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-ink-soft">
                            {lead.phone ? (
                              <a href={`tel:${lead.phone}`} className="underline hover:text-navy-900">
                                {lead.phone}
                              </a>
                            ) : (
                              <span className="text-ink-soft/60">Email only</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-xs text-ink-soft whitespace-nowrap">
                            {new Date(lead.created_at).toLocaleDateString("en-GB", {
                              day: "2-digit",
                              month: "short",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </td>
                          <td className="py-3.5 px-4">
                            <select
                              value={lead.status || "new"}
                              onChange={(e) => handleUpdateStatus(lead.id, e.target.value)}
                              className={`text-[11px] font-bold uppercase py-1 px-2 rounded border focus:outline-none ${
                                lead.status === "enrolled"
                                  ? "bg-emerald-50 text-emerald-900 border-emerald-300"
                                  : lead.status === "contacted"
                                  ? "bg-blue-50 text-blue-900 border-blue-300"
                                  : lead.status === "call_booked"
                                  ? "bg-gold-300/40 text-navy-900 border-gold-500/40"
                                  : "bg-paper text-navy-900 border-line"
                              }`}
                            >
                              <option value="new">New</option>
                              <option value="contacted">Contacted</option>
                              <option value="call_booked">Call Booked</option>
                              <option value="enrolled">Enrolled</option>
                              <option value="archived">Archived</option>
                            </select>
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => setSelectedLead(lead)}
                              className="text-xs font-bold text-navy-900 hover:text-gold-700 underline"
                            >
                              View Details
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* SECTION 2: Cohorts & Enrolments */}
        {activeSection === "enrolments" && (
          <div className="bg-white rounded-md border border-line p-6 sm:p-8 shadow-card space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold uppercase text-navy-900">
                  Regulated Qualification Cohorts
                </h2>
                <p className="text-xs text-ink-soft">
                  Teaching capacities, awarding bodies, and student enrolment records
                </p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => alert("Simulation: Open Manual Student Enrolment Wizard")}
              >
                + Enrol New Student
              </Button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-5 bg-paper rounded-sm border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-navy-900 bg-white px-2 py-0.5 rounded border border-line">
                    TQUK Regulated
                  </span>
                  <span className="text-xs font-bold text-emerald-700">16 / 20 Enrolled</span>
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-navy-900">
                  Level 3 Diploma in Adult Care (RQF)
                </h3>
                <p className="text-xs text-ink-soft">
                  Lead Tutor: Dr. Marcus Vance • Next cohort intake: 03 November 2026
                </p>
                <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-navy-900 rounded-full" style={{ width: "80%" }} />
                </div>
              </div>

              <div className="p-5 bg-paper rounded-sm border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-navy-900 bg-white px-2 py-0.5 rounded border border-line">
                    TQUK Regulated
                  </span>
                  <span className="text-xs font-bold text-emerald-700">12 / 18 Enrolled</span>
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-navy-900">
                  Level 3 Diploma for the Early Years Educator (EYE)
                </h3>
                <p className="text-xs text-ink-soft">
                  Lead Tutor: Sarah Jenkins (Assessor) • Next intake: 10 November 2026
                </p>
                <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-navy-900 rounded-full" style={{ width: "66%" }} />
                </div>
              </div>

              <div className="p-5 bg-paper rounded-sm border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-navy-900 bg-white px-2 py-0.5 rounded border border-line">
                    TQUK Regulated
                  </span>
                  <span className="text-xs font-bold text-emerald-700">8 / 12 Enrolled</span>
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-navy-900">
                  Level 3 Award in Education and Training (AET)
                </h3>
                <p className="text-xs text-ink-soft">
                  Lead Tutor: Dr. Marcus Vance • Accelerated 6-week cohort
                </p>
                <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-navy-900 rounded-full" style={{ width: "66%" }} />
                </div>
              </div>

              <div className="p-5 bg-paper rounded-sm border border-line space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold uppercase text-navy-900 bg-white px-2 py-0.5 rounded border border-line">
                    Private Tutoring
                  </span>
                  <span className="text-xs font-bold text-emerald-700">6 Active Tutees</span>
                </div>
                <h3 className="font-heading text-xl font-bold uppercase text-navy-900">
                  GCSE & Functional Skills Mathematics / English
                </h3>
                <p className="text-xs text-ink-soft">
                  Lead Tutors: Faculty Specialists • 1-on-1 private tuition packages
                </p>
                <div className="w-full h-1.5 bg-line rounded-full overflow-hidden">
                  <div className="h-full bg-navy-900 rounded-full" style={{ width: "50%" }} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SECTION 3: Tuition & Payment Ledger */}
        {activeSection === "ledger" && (
          <div className="bg-white rounded-md border border-line p-6 sm:p-8 shadow-card space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="font-heading text-2xl font-bold uppercase text-navy-900">
                  Tuition & Payment Plan Ledger
                </h2>
                <p className="text-xs text-ink-soft">
                  Accounting records for flexible instalments and reconciliations
                </p>
              </div>
              <span className="text-xs font-bold text-navy-900 bg-paper px-3 py-1.5 rounded border border-line">
                Direct Debit & Bank Transfer Reconciliations Active
              </span>
            </div>

            <div className="overflow-x-auto pt-2">
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b border-line text-xs font-bold uppercase text-navy-900 bg-paper/50">
                    <th className="py-3 px-4">Student</th>
                    <th className="py-3 px-4">Course</th>
                    <th className="py-3 px-4">Plan Selected</th>
                    <th className="py-3 px-4">Paid to Date</th>
                    <th className="py-3 px-4">Next Due</th>
                    <th className="py-3 px-4">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-line">
                  <tr className="hover:bg-paper/30">
                    <td className="py-3.5 px-4 font-bold text-navy-900">Sarah Jenkins</td>
                    <td className="py-3.5 px-4 text-xs text-ink-soft">Adult Care Level 3</td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-navy-900">
                      6 Months (£200/mo)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-navy-900">£750.00</td>
                    <td className="py-3.5 px-4 text-xs text-ink-soft">01 May 2026</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded border uppercase bg-emerald-50 text-emerald-800 border-emerald-200">
                        Up to date
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-paper/30">
                    <td className="py-3.5 px-4 font-bold text-navy-900">Michael Davies</td>
                    <td className="py-3.5 px-4 text-xs text-ink-soft">Adult Care Level 3</td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-navy-900">
                      10 Months (£120/mo)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-navy-900">£510.00</td>
                    <td className="py-3.5 px-4 text-xs text-ink-soft">01 May 2026</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded border uppercase bg-emerald-50 text-emerald-800 border-emerald-200">
                        Up to date
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-paper/30">
                    <td className="py-3.5 px-4 font-bold text-navy-900">Priya Sharma</td>
                    <td className="py-3.5 px-4 text-xs text-ink-soft">Adult Care Level 3</td>
                    <td className="py-3.5 px-4 text-xs font-semibold text-navy-900">
                      Full Payment (10% Disc)
                    </td>
                    <td className="py-3.5 px-4 font-bold text-navy-900">£1,215.00</td>
                    <td className="py-3.5 px-4 text-xs text-ink-soft">Settled</td>
                    <td className="py-3.5 px-4">
                      <span className="text-[11px] font-bold px-2 py-0.5 rounded border uppercase bg-emerald-50 text-emerald-800 border-emerald-200">
                        Paid in Full
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* SECTION 4: Staging Diagnostics */}
        {activeSection === "system" && (
          <div className="bg-white rounded-md border border-line p-6 sm:p-8 shadow-card space-y-6">
            <div>
              <h2 className="font-heading text-2xl font-bold uppercase text-navy-900">
                Staging & Integration Diagnostics
              </h2>
              <p className="text-sm text-ink-soft">
                Operational status of form storage, email outboxes, and rate-limiting barriers
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-4 bg-paper rounded-sm border border-line space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-navy-900">Local Dev Leads Storage</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-xs text-ink-soft">
                  Path: <code>data/dev_leads.json</code> ({leads.length} records recorded).
                </p>
              </div>

              <div className="p-4 bg-paper rounded-sm border border-line space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-navy-900">Dev Email Outbox</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-xs text-ink-soft">
                  Path: <code>data/dev_emails.json</code>. Dispatched emails written locally for verification.
                </p>
              </div>

              <div className="p-4 bg-paper rounded-sm border border-line space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-navy-900">Cookie Consent Guard</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-xs text-ink-soft">
                  Strict WCAG 2.2 AA & GDPR blocking: Scripts load only after explicit consent.
                </p>
              </div>

              <div className="p-4 bg-paper rounded-sm border border-line space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-navy-900">API Rate Limiter</span>
                  <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Active
                  </span>
                </div>
                <p className="text-xs text-ink-soft">
                  Passive in-memory store enforcing 5 submissions per 15 minutes per IP.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Selected Lead Details Modal */}
      {selectedLead && (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-navy-900/80 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in"
        >
          <div className="bg-white rounded-md border border-line shadow-2xl max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-gold-700 bg-gold-300/30 px-2 py-0.5 rounded border border-gold-500/30">
                  {selectedLead.type.replace(/_/g, " ")}
                </span>
                <h3 className="font-heading font-bold text-xl uppercase text-navy-900 mt-1">
                  {selectedLead.name}
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setSelectedLead(null)}
                className="p-1 text-ink-soft hover:text-navy-900"
                aria-label="Close inquiry window"
              >
                <Icon name="close" size={20} />
              </button>
            </div>

            <div className="space-y-3 text-sm">
              <div>
                <p className="text-xs font-semibold text-ink-soft">Email</p>
                <a
                  href={`mailto:${selectedLead.email}`}
                  className="font-semibold text-navy-900 underline"
                >
                  {selectedLead.email}
                </a>
              </div>

              {selectedLead.phone && (
                <div>
                  <p className="text-xs font-semibold text-ink-soft">Phone / Mobile</p>
                  <a
                    href={`tel:${selectedLead.phone}`}
                    className="font-semibold text-navy-900 underline"
                  >
                    {selectedLead.phone}
                  </a>
                </div>
              )}

              {selectedLead.course_interest && (
                <div>
                  <p className="text-xs font-semibold text-ink-soft">Course of Interest</p>
                  <p className="font-semibold text-navy-900">{selectedLead.course_interest}</p>
                </div>
              )}

              {selectedLead.message && (
                <div>
                  <p className="text-xs font-semibold text-ink-soft">Applicant Message</p>
                  <p className="p-3 bg-paper rounded border border-line text-xs text-ink mt-1">
                    {selectedLead.message}
                  </p>
                </div>
              )}

              {selectedLead.utm_source && (
                <div>
                  <p className="text-xs font-semibold text-ink-soft">Attribution</p>
                  <p className="text-xs text-ink-soft">
                    Source: <strong className="text-navy-900">{selectedLead.utm_source}</strong>
                  </p>
                </div>
              )}

              <div>
                <p className="text-xs font-semibold text-ink-soft">Date Received</p>
                <p className="text-xs text-ink-soft">
                  {new Date(selectedLead.created_at).toLocaleString("en-GB")}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-line flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-navy-900">Update Status:</span>
                <select
                  value={selectedLead.status || "new"}
                  onChange={(e) => handleUpdateStatus(selectedLead.id, e.target.value)}
                  className="text-xs py-1 px-2 rounded border border-line bg-paper"
                >
                  <option value="new">New</option>
                  <option value="contacted">Contacted</option>
                  <option value="call_booked">Call Booked</option>
                  <option value="enrolled">Enrolled</option>
                  <option value="archived">Archived</option>
                </select>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => setSelectedLead(null)}
              >
                Close
              </Button>
            </div>
          </div>
        </div>
      )}
    </PortalShell>
  );
}
