"use client";

import React, { createContext, useCallback, useContext, useState } from "react";
import { toast } from "@/hooks/useToast";
import { writeContract, waitForTransactionReceipt, getAccount } from "@wagmi/core";
import { IClassData } from "@/lib/IClassData";
import { useAuthContext } from "./AuthProvider";
import { wagmiConfig } from "@/lib/wagmi";
import {
  BOOKING_CONTRACT_ADDRESS,
  PULSE_BOOKING_ABI,
  classIdToBytes32,
} from "@/lib/contracts";

interface ICreateClassData {
  title: string;
  class_time: string;
  class_date: string;
  max_capacity: number;
  instructor_uid: string;
  organization_uid: string;
  image_url?: string | null;
}

interface IClassesContext {
  classes: IClassData[] | null;
  fetchClasses: () => void;
  createClass: (data: ICreateClassData) => Promise<boolean>;
  updateClass: (data: IClassData) => Promise<boolean>;
  bookClass: (classId: string) => Promise<boolean>;
  deleteClass: (classId: string) => Promise<boolean>;
}

const ClassesContext = createContext<IClassesContext | undefined>(undefined);

export default function ClassesProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuthContext();
  const [classes, setClasses] = useState<IClassData[] | null>(null);

  const fetchClasses = useCallback(async () => {
    try {
      const res = await fetch("/api/classes");
      if (!res.ok) throw new Error("Failed to fetch classes");
      const data = await res.json();
      setClasses(data);
    } catch (error) {
      console.error("Error fetching classes:", error);
      toast({
        title: "Error",
        description: "Failed to load classes.",
        variant: "destructive",
      });
    }
  }, []);

  async function createClass({
    title,
    class_time,
    class_date,
    max_capacity,
    instructor_uid,
    organization_uid,
    image_url,
  }: ICreateClassData) {
    if (!organization_uid) {
      toast({
        title: "Error",
        description: "Organization not found.",
        variant: "destructive",
      });
      return false;
    }

    try {
      const res = await fetch("/api/classes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ title, class_time, class_date, max_capacity, instructor_uid, organization_uid, image_url: image_url || null }),
      });

      if (!res.ok) throw new Error("Failed to create class");

      const created = await res.json();

      // Register the class on-chain (best-effort — doesn't block if wallet not connected)
      if (BOOKING_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        const { address, chain } = getAccount(wagmiConfig);
        if (address && chain) {
          try {
            const hash = await writeContract(wagmiConfig, {
              address: BOOKING_CONTRACT_ADDRESS,
              abi: PULSE_BOOKING_ABI,
              functionName: "registerClass",
              args: [classIdToBytes32(created.id), BigInt(max_capacity)],
              account: address,
              chain,
            });
            await waitForTransactionReceipt(wagmiConfig, { hash });
          } catch (e) {
            console.warn("On-chain registerClass failed:", e);
          }
        }
      }

      setClasses((prev) => [
        ...(prev || []),
        { ...created, current_bookings: 0 },
      ]);
      return true;
    } catch {
      toast({
        title: "Error",
        description: "Failed to create class.",
        variant: "destructive",
      });
      return false;
    }
  }

  async function updateClass(data: IClassData): Promise<boolean> {
    try {
      const res = await fetch(`/api/classes/${data.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!res.ok) throw new Error("Failed to update class");

      setClasses((prev) =>
        prev?.map((c) => (c.id === data.id ? { ...c, ...data } : c)) || null
      );
      return true;
    } catch {
      toast({
        title: "Error",
        description: "Failed to update class.",
        variant: "destructive",
      });
      return false;
    }
  }

  async function bookClass(classId: string): Promise<boolean> {
    if (!user) {
      toast({
        title: "Please sign in",
        description: "You must be signed in to book a class.",
        variant: "destructive",
      });
      return false;
    }

    const classItem = classes?.find((c) => c.id === classId);
    if (!classItem) return false;

    if (classItem.current_bookings >= classItem.max_capacity) {
      toast({
        title: "Class full",
        description: "This class is already at capacity.",
        variant: "destructive",
      });
      return false;
    }

    try {
      // If the booking contract is deployed, record the booking on-chain first
      if (BOOKING_CONTRACT_ADDRESS !== "0x0000000000000000000000000000000000000000") {
        const { address, chain } = getAccount(wagmiConfig);
        if (address && chain) {
          const hash = await writeContract(wagmiConfig, {
            address: BOOKING_CONTRACT_ADDRESS,
            abi: PULSE_BOOKING_ABI,
            functionName: "bookClass",
            args: [classIdToBytes32(classId)],
            account: address,
            chain,
          });
          await waitForTransactionReceipt(wagmiConfig, { hash });
        }
      }

      // Also record in Postgres so attendance views keep working
      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ class_id: classId }),
      });

      if (res.status === 409) {
        toast({ title: "Already booked", description: "You've already booked this class." });
        return false;
      }

      if (!res.ok) throw new Error("Failed to book class");

      setClasses(
        (prev) =>
          prev?.map((c) =>
            c.id === classId
              ? { ...c, current_bookings: c.current_bookings + 1 }
              : c
          ) || null
      );

      toast({
        title: "Booked!",
        description: `You've successfully booked ${classItem.title}.`,
      });
      return true;
    } catch {
      toast({
        title: "Error",
        description: "Failed to book class.",
        variant: "destructive",
      });
      return false;
    }
  }

  async function deleteClass(classId: string): Promise<boolean> {
    try {
      const res = await fetch(`/api/classes/${classId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete class");

      setClasses((prev) => prev?.filter((c) => c.id !== classId) || null);
      return true;
    } catch {
      toast({
        title: "Error",
        description: "Failed to delete class.",
        variant: "destructive",
      });
      return false;
    }
  }

  return (
    <ClassesContext.Provider
      value={{
        classes,
        fetchClasses,
        createClass,
        updateClass,
        bookClass,
        deleteClass,
      }}
    >
      {children}
    </ClassesContext.Provider>
  );
}

export function useClassesContext() {
  const context = useContext(ClassesContext);
  if (context === undefined) {
    throw new Error("useClassesContext must be used within a ClassesProvider");
  }
  return context;
}
