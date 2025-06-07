import Hero from "@/pages/Classes/Hero";
import ClassSchedule from "@/pages/Classes/ClassSchedule";
import Features from "@/pages/Classes/Features";
import Footer from "@/pages/Classes/Footer";

export default function Index() {
  return (
    <div className="min-h-screen">
      <Hero />
      <div id="classes">
        <ClassSchedule />
      </div>
      <Features />
      <Footer />
    </div>
  );
}
