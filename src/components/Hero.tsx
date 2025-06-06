
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";

const Hero = () => {
  const { user } = useAuth();

  return (
    <section className="bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-800 text-white min-h-screen flex items-center">
      <div className="container mx-auto px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className="text-5xl md:text-6xl font-bold mb-6 leading-tight">
            Transform Your
            <span className="text-yellow-300"> Fitness Journey</span>
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Discover amazing fitness classes from top wellness companies. From yoga to HIIT, 
            find the perfect workout that fits your schedule and goals.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg" 
              className="bg-yellow-400 hover:bg-yellow-500 text-gray-900 font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105"
              onClick={() => {
                const classesSection = document.getElementById('classes');
                if (classesSection) {
                  classesSection.scrollIntoView({ behavior: 'smooth' });
                }
              }}
            >
              Browse Classes
            </Button>
            {!user && (
              <>
                <Button 
                  size="lg" 
                  variant="outline" 
                  className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300"
                  onClick={() => window.location.href = '/auth'}
                >
                  Sign Up Today
                </Button>
              </>
            )}
            {user && (
              <Button 
                size="lg" 
                variant="outline" 
                className="border-white text-white hover:bg-white hover:text-blue-600 font-semibold px-8 py-4 rounded-full text-lg transition-all duration-300"
                onClick={() => window.location.href = '/dashboard'}
              >
                My Dashboard
              </Button>
            )}
          </div>
          
          {/* Call to action for companies */}
          <div className="bg-white/10 backdrop-blur-sm rounded-2xl p-6 max-w-2xl mx-auto">
            <h3 className="text-xl font-semibold mb-3">Are you a wellness company?</h3>
            <p className="text-blue-100 mb-4">
              Join our platform to showcase your fitness classes and connect with health-conscious customers.
            </p>
            <Button 
              variant="secondary"
              className="bg-white text-blue-600 hover:bg-blue-50"
              onClick={() => window.location.href = '/auth'}
            >
              List Your Classes
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
