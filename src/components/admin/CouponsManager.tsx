"use client";

import React, { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { Coupon } from "@/lib/repositories/types";
import { saveCouponAction, deleteCouponAction } from "@/app/admin/actions";

interface Props {
  initialCoupons: Coupon[];
  onSelectCouponForMessage?: (coupon: Coupon) => void;
}

export const CouponsManager: React.FC<Props> = ({
  initialCoupons,
  onSelectCouponForMessage,
}) => {
  const [coupons, setCoupons] = useState<Coupon[]>(initialCoupons);
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null);
  const [feedback, setFeedback] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Form State
  const [code, setCode] = useState("");
  const [description, setDescription] = useState("");
  const [discountType, setDiscountType] = useState<"percent" | "fixed_amount">("percent");
  const [discountValue, setDiscountValue] = useState("15");
  const [targetAudience, setTargetAudience] = useState<"existing_learners_only" | "all" | "graduates_only">("existing_learners_only");
  const [appliesTo, setAppliesTo] = useState<"all" | "qualifications" | "tutoring">("all");
  const [validUntil, setValidUntil] = useState("2027-12-31");
  const [isActive, setIsActive] = useState(true);

  const openCreateModal = () => {
    setEditingCoupon(null);
    setCode("");
    setDescription("");
    setDiscountType("percent");
    setDiscountValue("15");
    setTargetAudience("existing_learners_only");
    setAppliesTo("all");
    setValidUntil("2027-12-31");
    setIsActive(true);
    setIsModalOpen(true);
  };

  const openEditModal = (c: Coupon) => {
    setEditingCoupon(c);
    setCode(c.code);
    setDescription(c.description);
    setDiscountType(c.discountType);
    setDiscountValue(c.discountValue.toString());
    setTargetAudience(c.targetAudience || "existing_learners_only");
    setAppliesTo(c.appliesTo || "all");
    setValidUntil(c.validUntil || "2027-12-31");
    setIsActive(c.isActive);
    setIsModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code.trim()) {
      alert("Please provide a voucher code.");
      return;
    }
    const val = parseFloat(discountValue);
    if (isNaN(val) || val <= 0) {
      alert("Please provide a valid discount value.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await saveCouponAction({
        id: editingCoupon?.id,
        code: code.trim().toUpperCase(),
        description: description.trim() || `${val}${discountType === "percent" ? "%" : "£"} Off`,
        discountType,
        discountValue: val,
        targetAudience,
        appliesTo,
        validUntil: validUntil || undefined,
        isActive,
      });

      if (res.success && res.coupons) {
        setCoupons(res.coupons);
        setIsModalOpen(false);
        setFeedback(`Voucher "${code.toUpperCase()}" saved successfully.`);
        setTimeout(() => setFeedback(null), 5000);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to save coupon.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: string, couponCode: string) => {
    if (!confirm(`Are you sure you want to deactivate and remove voucher "${couponCode}"?`)) {
      return;
    }
    try {
      const res = await deleteCouponAction(id);
      if (res.success && res.coupons) {
        setCoupons(res.coupons);
        setFeedback(`Voucher "${couponCode}" removed.`);
        setTimeout(() => setFeedback(null), 5000);
      }
    } catch (err) {
      alert(err instanceof Error ? err.message : "Failed to remove coupon.");
    }
  };

  const filteredCoupons = coupons.filter(
    (c) =>
      c.code.toLowerCase().includes(search.toLowerCase()) ||
      c.description.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-6">
      {/* Top Controls */}
      <div className="bg-white rounded-md border border-line p-5 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 shadow-xs">
        <div>
          <h2 className="font-heading text-lg font-bold text-navy-900 flex items-center gap-2">
            <Icon name="tag" size={18} className="text-gold-700" />
            <span>Alumni Loyalty &amp; Progression Vouchers</span>
          </h2>
          <p className="text-xs text-ink-soft mt-0.5">
            Configure discount codes for existing learners, progression promotions, and family 1-on-1 tutoring.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <input
            type="text"
            placeholder="Search vouchers..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="px-3 py-1.5 rounded-sm border border-line bg-paper text-xs text-ink focus:outline-none focus:border-navy-900"
          />
          <button
            type="button"
            onClick={openCreateModal}
            className="px-3.5 py-1.5 bg-navy-900 text-white rounded-sm text-xs font-bold hover:bg-navy-800 transition-colors flex items-center gap-1.5 shrink-0"
          >
            <span>+ Create Voucher</span>
          </button>
        </div>
      </div>

      {feedback && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-sm text-xs font-semibold flex items-center gap-2">
          <Icon name="check-circle" size={14} className="text-emerald-700" />
          <span>{feedback}</span>
        </div>
      )}

      {/* Vouchers Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredCoupons.map((c) => {
          const isExpired = c.validUntil && new Date(c.validUntil) < new Date();
          return (
            <div
              key={c.id}
              className={`bg-white rounded-md border p-5 flex flex-col justify-between gap-4 transition-shadow hover:shadow-sm ${
                !c.isActive || isExpired
                  ? "border-line/70 bg-paper/40 opacity-75"
                  : "border-line border-t-4 border-t-navy-900"
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono text-base font-bold text-navy-900 px-2.5 py-1 bg-navy-900/5 rounded-xs border border-navy-900/15 tracking-wider">
                      {c.code}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-xs bg-gold-300 text-navy-900 font-mono">
                      {c.discountType === "percent" ? `${c.discountValue}% OFF` : `£${c.discountValue} OFF`}
                    </span>
                  </div>

                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-xs ${
                      !c.isActive
                        ? "bg-rose-50 text-rose-800 border border-rose-200"
                        : isExpired
                          ? "bg-amber-50 text-amber-800 border border-amber-200"
                          : "bg-emerald-50 text-emerald-800 border border-emerald-200"
                    }`}
                  >
                    {!c.isActive ? "Inactive" : isExpired ? "Expired" : "Active"}
                  </span>
                </div>

                <p className="text-xs text-navy-900 font-medium leading-relaxed">
                  {c.description}
                </p>

                <div className="space-y-1.5 pt-2 border-t border-line/60 text-[11px] text-ink-soft">
                  <div className="flex items-center justify-between">
                    <span>Audience:</span>
                    <strong className="text-navy-900">
                      {c.targetAudience === "existing_learners_only"
                        ? "Exclusive to Returning Learners"
                        : c.targetAudience === "graduates_only"
                          ? "Graduates Only"
                          : "All Learners"}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between">
                    <span>Applicable to:</span>
                    <strong className="text-navy-900">
                      {c.appliesTo === "qualifications"
                        ? "Diplomas & Qualifications"
                        : c.appliesTo === "tutoring"
                          ? "1-on-1 Private Tutoring"
                          : "All Courses & Tutoring"}
                    </strong>
                  </div>

                  {c.validUntil && (
                    <div className="flex items-center justify-between">
                      <span>Valid until:</span>
                      <strong className="text-navy-900">
                        {new Date(c.validUntil).toLocaleDateString("en-GB", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </strong>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    <span>Times Redeemed:</span>
                    <span className="font-mono font-bold text-navy-900">{c.timesUsed || 0}</span>
                  </div>
                </div>
              </div>

              {/* Actions */}
              <div className="pt-3 border-t border-line flex items-center justify-between gap-2">
                <button
                  type="button"
                  onClick={() => onSelectCouponForMessage?.(c)}
                  className="px-2.5 py-1 rounded-sm bg-navy-900 text-gold-300 text-[11px] font-bold hover:bg-navy-800 transition-colors flex items-center gap-1 cursor-pointer"
                  title="Compose and send this voucher directly to learners"
                >
                  <Icon name="mail" size={12} />
                  <span>Send to Learners</span>
                </button>

                <div className="flex items-center gap-1.5">
                  <button
                    type="button"
                    onClick={() => openEditModal(c)}
                    className="p-1 rounded text-ink-soft hover:text-navy-900 hover:bg-paper transition-colors"
                    title="Edit voucher settings"
                  >
                    <Icon name="edit" size={14} />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDelete(c.id, c.code)}
                    className="p-1 rounded text-ink-soft hover:text-rose-700 hover:bg-rose-50 transition-colors"
                    title="Delete voucher"
                  >
                    <Icon name="trash" size={14} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredCoupons.length === 0 && (
        <div className="bg-white rounded-md border border-line p-8 text-center space-y-2">
          <Icon name="tag" size={24} className="text-ink-soft mx-auto" />
          <h3 className="font-bold text-navy-900 text-sm">No vouchers found</h3>
          <p className="text-xs text-ink-soft">
            Create your first loyalty voucher to reward existing students progressing to higher levels.
          </p>
        </div>
      )}

      {/* Create / Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white rounded-md border border-line shadow-xl max-w-md w-full p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-line pb-3">
              <h3 className="font-heading text-lg font-bold text-navy-900 flex items-center gap-2">
                <Icon name="tag" size={16} className="text-gold-700" />
                <span>{editingCoupon ? "Edit Voucher" : "Create Alumni / Loyalty Voucher"}</span>
              </h3>
              <button
                type="button"
                onClick={() => setIsModalOpen(false)}
                className="text-ink-soft hover:text-navy-900"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSave} className="space-y-4 text-xs">
              <div>
                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                  Voucher Code * (Letters &amp; Numbers)
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. ALUMNI15"
                  value={code}
                  onChange={(e) => setCode(e.target.value.toUpperCase().replace(/[^A-Z0-9_-]/g, ""))}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-paper text-sm font-mono font-bold text-navy-900 uppercase focus:outline-none focus:border-navy-900"
                />
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                  Description / Promotion Purpose *
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 15% progression reward for continuing students"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3 py-2 rounded-sm border border-line bg-white text-xs focus:outline-none focus:border-navy-900"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-navy-900 mb-1">Discount Type</label>
                  <select
                    value={discountType}
                    onChange={(e) => setDiscountType(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-semibold"
                  >
                    <option value="percent">Percentage (% off)</option>
                    <option value="fixed_amount">Fixed Amount (£ off)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy-900 mb-1">
                    Value ({discountType === "percent" ? "%" : "£"})
                  </label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={discountValue}
                    onChange={(e) => setDiscountValue(e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-semibold text-navy-900 mb-1">Target Audience</label>
                  <select
                    value={targetAudience}
                    onChange={(e) => setTargetAudience(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                  >
                    <option value="existing_learners_only">Returning Learners Only</option>
                    <option value="all">All Enrollees</option>
                    <option value="graduates_only">Graduates Only</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-semibold text-navy-900 mb-1">Applies To</label>
                  <select
                    value={appliesTo}
                    onChange={(e) => setAppliesTo(e.target.value as any)}
                    className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs"
                  >
                    <option value="all">All Courses &amp; Tutoring</option>
                    <option value="qualifications">Qualifications Only</option>
                    <option value="tutoring">1-on-1 Tutoring Only</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-navy-900 mb-1">Valid Until Date</label>
                <input
                  type="date"
                  value={validUntil}
                  onChange={(e) => setValidUntil(e.target.value)}
                  className="w-full px-2.5 py-1.5 rounded-sm border border-line bg-white text-xs font-mono"
                />
              </div>

              <div className="flex items-center gap-2 pt-1">
                <input
                  type="checkbox"
                  id="voucherActive"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="rounded text-navy-900 focus:ring-navy-900"
                />
                <label htmlFor="voucherActive" className="text-xs font-semibold text-navy-900 cursor-pointer">
                  Voucher is active and redeemable immediately
                </label>
              </div>

              <div className="pt-3 border-t border-line flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 rounded-sm border border-line text-xs font-semibold hover:bg-paper"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-1.5 rounded-sm bg-navy-900 text-white text-xs font-bold hover:bg-navy-800 disabled:opacity-50"
                >
                  {isSubmitting ? "Saving..." : editingCoupon ? "Update Voucher" : "Create Voucher"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
