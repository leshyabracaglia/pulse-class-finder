
import ClassCard from "./ClassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

const ClassSchedule = () => {
  const todayClasses = [
    {
      title: "Morning Flow Yoga",
      instructor: "Sarah Johnson",
      time: "7:00 AM",
      duration: "60 min",
      difficulty: "Beginner" as const,
      spotsLeft: 5,
      type: "Yoga",
      image: ""
    },
    {
      title: "HIIT Bootcamp",
      instructor: "Mike Rodriguez",
      time: "8:30 AM",
      duration: "45 min",
      difficulty: "Advanced" as const,
      spotsLeft: 2,
      type: "HIIT",
      image: ""
    },
    {
      title: "Pilates Core",
      instructor: "Emma Thompson",
      time: "10:00 AM",
      duration: "50 min",
      difficulty: "Intermediate" as const,
      spotsLeft: 8,
      type: "Pilates",
      image: ""
    },
    {
      title: "Strength Training",
      instructor: "David Chen",
      time: "12:00 PM",
      duration: "60 min",
      difficulty: "Intermediate" as const,
      spotsLeft: 3,
      type: "Strength",
      image: ""
    },
    {
      title: "Evening Yoga",
      instructor: "Lisa Park",
      time: "6:00 PM",
      duration: "75 min",
      difficulty: "Beginner" as const,
      spotsLeft: 0,
      type: "Yoga",
      image: ""
    },
    {
      title: "Cardio Blast",
      instructor: "Tony Martinez",
      time: "7:30 PM",
      duration: "45 min",
      difficulty: "Advanced" as const,
      spotsLeft: 6,
      type: "HIIT",
      image: ""
    }
  ];

  const tomorrowClasses = [
    {
      title: "Sunrise Yoga",
      instructor: "Sarah Johnson",
      time: "6:30 AM",
      duration: "60 min",
      difficulty: "Beginner" as const,
      spotsLeft: 10,
      type: "Yoga",
      image: ""
    },
    {
      title: "CrossFit Challenge",
      instructor: "Jake Williams",
      time: "9:00 AM",
      duration: "60 min",
      difficulty: "Advanced" as const,
      spotsLeft: 4,
      type: "Strength",
      image: ""
    },
    {
      title: "Beginner Pilates",
      instructor: "Emma Thompson",
      time: "11:00 AM",
      duration: "45 min",
      difficulty: "Beginner" as const,
      spotsLeft: 12,
      type: "Pilates",
      image: ""
    }
  ];

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">Class Schedule</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Choose from our variety of fitness classes designed to challenge and inspire you
          </p>
        </div>

        <Tabs defaultValue="today" className="w-full">
          <TabsList className="grid w-full grid-cols-2 max-w-md mx-auto mb-8">
            <TabsTrigger value="today" className="text-lg">Today</TabsTrigger>
            <TabsTrigger value="tomorrow" className="text-lg">Tomorrow</TabsTrigger>
          </TabsList>
          
          <TabsContent value="today">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {todayClasses.map((classItem, index) => (
                <ClassCard key={index} {...classItem} />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="tomorrow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tomorrowClasses.map((classItem, index) => (
                <ClassCard key={index} {...classItem} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ClassSchedule;
