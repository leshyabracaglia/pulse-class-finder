import ClassSchedule from "@/pages/Classes/ClassSchedule";
import Features from "@/pages/Classes/Features";
import Footer from "@/pages/Classes/Footer";

export default function Index() {
  return (
    <div className="min-h-screen">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Find your perfect fitness class
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our premium fitness classes led by certified instructors. Find
            your perfect workout and achieve your goals.
          </p>
        </div>
      </div>
      <div id="classes">
        <ClassSchedule />
      </div>
      <Features />
      <Footer />
    </div>
  );
}
