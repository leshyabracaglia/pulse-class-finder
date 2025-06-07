
import { Calendar, Clock, Users, Smartphone, BarChart3, Settings } from "lucide-react";

const Features = () => {
  const features = [
    {
      icon: Calendar,
      title: "Schedule Management",
      description: "View and manage class schedules with an intuitive calendar interface"
    },
    {
      icon: Clock,
      title: "Real-time Availability",
      description: "See current class capacity and availability status instantly"
    },
    {
      icon: Users,
      title: "Member Management",
      description: "Track member bookings and manage class rosters efficiently"
    },
    {
      icon: Smartphone,
      title: "Mobile Access",
      description: "Access the system from any device with responsive design"
    },
    {
      icon: BarChart3,
      title: "Analytics Dashboard",
      description: "Monitor class popularity and booking patterns with detailed reports"
    },
    {
      icon: Settings,
      title: "Administrative Tools",
      description: "Configure classes, manage instructors, and customize booking rules"
    }
  ];

  return (
    <section className="py-16 bg-white">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">System Features</h2>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Comprehensive tools for managing fitness class bookings and operations
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div 
              key={index} 
              className="text-center p-6 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-sm transition-all duration-300"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg mb-4">
                <feature.icon className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
