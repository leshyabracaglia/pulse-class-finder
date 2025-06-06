
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Clock, Users, Zap } from "lucide-react";

interface ClassCardProps {
  title: string;
  instructor: string;
  time: string;
  duration: string;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  spotsLeft: number;
  type: string;
  image: string;
}

const ClassCard = ({ title, instructor, time, duration, difficulty, spotsLeft, type, image }: ClassCardProps) => {
  const getDifficultyColor = (level: string) => {
    switch (level) {
      case 'Beginner': return 'bg-green-500';
      case 'Intermediate': return 'bg-yellow-500';
      case 'Advanced': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getTypeColor = (classType: string) => {
    switch (classType.toLowerCase()) {
      case 'yoga': return 'bg-purple-100 text-purple-800';
      case 'hiit': return 'bg-red-100 text-red-800';
      case 'pilates': return 'bg-pink-100 text-pink-800';
      case 'strength': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 hover:scale-105 overflow-hidden group">
      <div className="relative h-48 bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center">
        <div className="text-6xl opacity-20">🏋️</div>
        <Badge className={`absolute top-3 left-3 ${getTypeColor(type)}`}>
          {type}
        </Badge>
        <Badge className={`absolute top-3 right-3 ${getDifficultyColor(difficulty)} text-white`}>
          {difficulty}
        </Badge>
      </div>
      
      <div className="p-6">
        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-blue-600 transition-colors">
          {title}
        </h3>
        <p className="text-gray-600 mb-4">with {instructor}</p>
        
        <div className="flex items-center justify-between mb-4 text-sm text-gray-500">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            <span>{time}</span>
          </div>
          <div className="flex items-center gap-1">
            <Zap className="w-4 h-4" />
            <span>{duration}</span>
          </div>
          <div className="flex items-center gap-1">
            <Users className="w-4 h-4" />
            <span>{spotsLeft} spots left</span>
          </div>
        </div>
        
        <Button 
          className="w-full bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 transition-all duration-300"
          disabled={spotsLeft === 0}
        >
          {spotsLeft === 0 ? 'Class Full' : 'Book Now'}
        </Button>
      </div>
    </div>
  );
};

export default ClassCard;
