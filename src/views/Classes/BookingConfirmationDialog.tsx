"use client";

import {
  Dialog,
  DialogContent,
} from "@/components/ui/legacy/dialog";
import { Button } from "@/components/ui/legacy/button";
import { formatDate, formatTime } from "@/lib/utils";
import { IClassData } from "@/lib/IClassData";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/lib/routes";
import { Check } from "lucide-react";

export default function BookingConfirmationDialog({
  classItem,
  open,
  onClose,
}: {
  classItem: IClassData | null;
  open: boolean;
  onClose: () => void;
}) {
  const router = useRouter();

  if (!classItem) return null;

  return (
    <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border border-zinc-800 bg-black">
        <div className="p-8 flex flex-col items-center text-center">
          <div className="w-14 h-14 rounded-full bg-accent flex items-center justify-center mb-6">
            <Check className="w-7 h-7 text-white" strokeWidth={3} />
          </div>

          <p className="text-xs tracking-[0.35em] text-zinc-500 uppercase font-mono mb-2">Booking Confirmed</p>
          <h2 className="text-2xl font-black uppercase tracking-tight text-white mb-1">
            {classItem.title}
          </h2>
          {classItem.organization_name && (
            <p className="text-sm text-zinc-500 font-mono mb-6">{classItem.organization_name}</p>
          )}

          <div className="w-full border border-zinc-800 divide-y divide-zinc-800 mb-6 text-left">
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
          </div>

          <p className="text-xs text-zinc-600 font-mono mb-8">
            Complete this class to earn{" "}
            <span className="text-accent">$SLST</span> tokens
          </p>

          <div className="flex gap-3 w-full">
            <Button
              variant="outline"
              className="flex-1 border-zinc-800 text-zinc-400 hover:text-white bg-transparent rounded-none font-mono text-xs tracking-widest uppercase"
              onClick={onClose}
            >
              Close
            </Button>
            <Button
              className="flex-1 bg-accent hover:bg-accent/90 text-white rounded-none font-mono text-xs tracking-widest uppercase"
              onClick={() => { onClose(); router.push(ROUTES.DASHBOARD); }}
            >
              View Dashboard
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
