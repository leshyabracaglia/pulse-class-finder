
import { Button } from "@/components/ui/button";
import { Calendar, Clock, Users } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="bg-slate-50 border-b border-gray-200 py-16">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-4xl md:text-5xl font-bold text-gray-900 mb-4">
            Class Booking System
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Manage your workout schedule efficiently. View available classes, check capacity, and book your sessions.
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8 max-w-2xl mx-auto">
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Calendar className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Schedule Management</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Clock className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Real-time Updates</span>
            </div>
            <div className="flex items-center justify-center gap-2 text-gray-700">
              <Users className="w-5 h-5 text-blue-600" />
              <span className="text-sm font-medium">Capacity Tracking</span>
            </div>
          </div>
          
          <div className="flex gap-4 justify-center">
            <Button 
              size="lg" 
              className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3"
              onClick={() => document.getElementById('classes')?.scrollIntoView({ behavior: 'smooth' })}
            >
              View Available Classes
            </Button>
            {user ? (
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-3"
                onClick={() => window.location.href = '/dashboard'}
              >
                My Dashboard
              </Button>
            ) : (
              <Button 
                size="lg" 
                variant="outline"
                className="px-8 py-3"
                onClick={() => window.location.href = '/auth'}
              >
                Sign In
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
