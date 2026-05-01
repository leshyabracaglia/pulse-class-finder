"use client";

import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/legacy/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Button } from "@/components/ui/legacy/button";
import { formatDate, formatTime, formatPrice, priceCentsToWei, priceWeiToEth } from "@/lib/utils";
import { IClassData } from "@/lib/IClassData";
import { Wallet } from "lucide-react";

export default function BookingConfirmDialog({
  classItem,
  open,
  loading,
  onConfirm,
  onClose,
}: {
  classItem: IClassData | null;
  open: boolean;
  loading: boolean;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!classItem) return null;

  const priceWei = priceCentsToWei(classItem.price_cents || 0);
  const priceEth = priceWeiToEth(priceWei);
  const hasPrice = classItem.price_cents > 0;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o && !loading) onClose(); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-zinc-800 bg-black">
        <VisuallyHidden><DialogTitle>Confirm Booking</DialogTitle></VisuallyHidden>
        <div className="p-8">
          <p className="text-xs tracking-[0.35em] text-zinc-500 uppercase font-mono mb-2">Confirm Booking</p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1">
            {classItem.title}
          </h2>
          {classItem.organization_name && (
            <p className="text-sm text-zinc-500 font-mono mb-6">{classItem.organization_name}</p>
          )}

          <div className="w-full border border-zinc-800 divide-y divide-zinc-800 mb-6">
            <div className="flex justify-between px-4 py-3">
              <span className="text-xs text-zinc-500 uppercase font-mono tracking-wider">Date</span>
              <span className="text-sm text-white font-numeric">{formatDate(classItem.class_date)}</span>
            </div>
            <div className="flex justify-between px-4 py-3">
              <span className="text-xs text-zinc-500 uppercase font-mono tracking-wider">Time</span>
              <span className="text-sm text-white font-numeric">{formatTime(classItem.class_time)}</span>
            </div>
            {classItem.instructor_name && (
              <div className="flex justify-between px-4 py-3">
                <span className="text-xs text-zinc-500 uppercase font-mono tracking-wider">Instructor</span>
                <span className="text-sm text-white">{classItem.instructor_name}</span>
              </div>
            )}
            <div className="flex justify-between items-center px-4 py-3">
              <span className="text-xs text-zinc-500 uppercase font-mono tracking-wider">Price</span>
              {hasPrice ? (
                <div className="text-right">
                  <span className="text-sm text-white font-numeric">${formatPrice(classItem.price_cents)}</span>
                  <span className="text-xs text-zinc-500 font-mono ml-2">≈ {priceEth} ETH</span>
                </div>
              ) : (
                <span className="text-sm text-accent font-mono">Free</span>
              )}
            </div>
          </div>

          {hasPrice && (
            <div className="flex items-start gap-3 bg-zinc-900/60 border border-zinc-800 rounded-md px-4 py-3 mb-6">
              <Wallet className="w-4 h-4 text-accent mt-0.5 shrink-0" />
              <p className="text-xs text-zinc-400 font-display leading-relaxed">
                Payment of <span className="text-white font-mono">{priceEth} ETH</span> will be sent
                directly to the studio wallet upon confirmation.
              </p>
            </div>
          )}

          <div className="flex gap-3">
            <Button
              variant="outline"
              className="flex-1 border-zinc-800 text-zinc-400 hover:text-white bg-transparent rounded-none font-mono text-xs tracking-widest uppercase"
              onClick={onClose}
              disabled={loading}
            >
              Cancel
            </Button>
            <Button
              className="flex-1 rounded-none font-mono text-xs tracking-widest uppercase"
              onClick={onConfirm}
              disabled={loading}
            >
              {loading ? "Processing..." : hasPrice ? "Confirm & Pay" : "Confirm Booking"}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
