"use client";

import ClassSchedule from "@/views/Classes/ClassSchedule";
import Footer from "@/views/Classes/Footer";

export default function Index() {
  return (
    <div className="min-h-screen bg-black">
      <div className="border-b border-zinc-900 py-16 px-6">
        <div className="container mx-auto">
          <p className="text-xs tracking-[0.35em] text-zinc-500 uppercase font-mono mb-4">Classes</p>
          <h2 className="text-4xl font-black uppercase tracking-tight text-white">Browse Sessions</h2>
        </div>
      </div>
      <div id="classes">
        <ClassSchedule />
      </div>
      <Footer />
    </div>
  );
}
