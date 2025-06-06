
import Hero from "@/components/Hero";
import ClassSchedule from "@/components/ClassSchedule";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

const Index = () => {
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
};

export default Index;
