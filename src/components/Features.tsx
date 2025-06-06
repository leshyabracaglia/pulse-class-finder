
import { Calendar, Clock, Users, Smartphone, Award, Heart } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "Easy Scheduling",
      description: "Book classes up to 30 days in advance with our intuitive calendar system"
    },
    {
      icon: Clock,
      title: "Real-time Updates",
      description: "Get instant notifications about class changes, cancellations, and availability"
    },
    {
      icon: Users,
      title: "Community Focused",
      description: "Connect with fellow fitness enthusiasts and build lasting workout partnerships"
    },
    {
      icon: Smartphone,
      title: "Mobile Friendly",
      description: "Access your workout schedule anywhere with our responsive mobile design"
    },
    {
      icon: Award,
      title: "Expert Instructors",
      description: "Learn from certified professionals with years of experience in their specialties"
    },
    {
      icon: Heart,
      title: "Track Progress",
      description: "Monitor your fitness journey and celebrate milestones with our tracking tools"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Why Choose FitBook?</h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            We've designed every feature with your fitness journey in mind, making it easier than ever to stay consistent and motivated
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center p-6 rounded-xl hover:bg-gray-50 transition-all duration-300 hover:scale-105 group"
            >
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full mb-4 group-hover:scale-110 transition-transform duration-300">
                <feature.icon className="w-8 h-8 text-white" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
