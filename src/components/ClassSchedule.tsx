import ClassCard from "./ClassCard";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

interface ClassData {
  id: string;
  title: string;
  instructor: string;
  class_time: string;
  class_date: string;
  duration_minutes: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced' | null;
  class_type: string;
  max_capacity: number;
  current_bookings: number;
}

const ClassSchedule = () => {
  const [todayClasses, setTodayClasses] = useState<ClassData[]>([]);
  const [tomorrowClasses, setTomorrowClasses] = useState<ClassData[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchClasses();
  }, []);

  const fetchClasses = async () => {
    try {
      const today = new Date().toISOString().split('T')[0];
      const tomorrow = new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString().split('T')[0];

      // Fetch today's classes
      const { data: todayData, error: todayError } = await supabase
        .from('classes')
        .select('*')
        .eq('class_date', today)
        .order('class_time');

      if (todayError) throw todayError;

      // Fetch tomorrow's classes
      const { data: tomorrowData, error: tomorrowError } = await supabase
        .from('classes')
        .select('*')
        .eq('class_date', tomorrow)
        .order('class_time');

      if (tomorrowError) throw tomorrowError;

      setTodayClasses((todayData || []) as ClassData[]);
      setTomorrowClasses((tomorrowData || []) as ClassData[]);
    } catch (error) {
      console.error('Error fetching classes:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4 text-center">
          <div className="text-lg">Loading classes...</div>
        </div>
      </section>
    );
  }

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
              {todayClasses.map((classItem) => (
                <ClassCard 
                  key={classItem.id} 
                  id={classItem.id}
                  title={classItem.title}
                  instructor={classItem.instructor}
                  time={classItem.class_time}
                  date={classItem.class_date}
                  duration={classItem.duration_minutes}
                  difficulty={classItem.difficulty || 'Beginner'}
                  spotsLeft={classItem.max_capacity - classItem.current_bookings}
                  type={classItem.class_type}
                  maxCapacity={classItem.max_capacity}
                  currentBookings={classItem.current_bookings}
                />
              ))}
            </div>
          </TabsContent>
          
          <TabsContent value="tomorrow">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tomorrowClasses.map((classItem) => (
                <ClassCard 
                  key={classItem.id} 
                  id={classItem.id}
                  title={classItem.title}
                  instructor={classItem.instructor}
                  time={classItem.class_time}
                  date={classItem.class_date}
                  duration={classItem.duration_minutes}
                  difficulty={classItem.difficulty || 'Beginner'}
                  spotsLeft={classItem.max_capacity - classItem.current_bookings}
                  type={classItem.class_type}
                  maxCapacity={classItem.max_capacity}
                  currentBookings={classItem.current_bookings}
                />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};

export default ClassSchedule;
