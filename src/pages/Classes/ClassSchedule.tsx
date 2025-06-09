
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Clock, Users, MapPin, Locate } from "lucide-react";
import { formatDate, formatTime } from "@/lib/utils";
import useUserClasses, { ClassData } from "./useUserClasses";
import { useToast } from "@/hooks/useToast";

interface LocationState {
  latitude: number | null;
  longitude: number | null;
  loading: boolean;
  error: string | null;
}

function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959; // Earth's radius in miles
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

function ClassCard({ classItem, userLocation }: { classItem: ClassData; userLocation: LocationState }) {
  const { bookClass } = useUserClasses();
  
  // Mock coordinates for demonstration - in a real app, you'd geocode the address
  const getDistance = () => {
    if (!userLocation.latitude || !userLocation.longitude || !classItem.companies?.address) {
      return null;
    }
    
    // Mock coordinates for different addresses (in a real app, you'd use geocoding)
    const mockCoordinates: { [key: string]: { lat: number; lng: number } } = {
      "123 Main St": { lat: 40.7128, lng: -74.0060 },
      "456 Oak Ave": { lat: 40.7589, lng: -73.9851 },
      "789 Pine Rd": { lat: 40.6892, lng: -74.0445 },
    };
    
    const addressKey = Object.keys(mockCoordinates).find(addr => 
      classItem.companies?.address?.includes(addr.split(' ')[1])
    );
    
    if (addressKey) {
      const coords = mockCoordinates[addressKey];
      return calculateDistance(
        userLocation.latitude,
        userLocation.longitude,
        coords.lat,
        coords.lng
      );
    }
    
    return null;
  };

  const distance = getDistance();

  return (
    <Card key={classItem.id} className="hover:shadow-lg transition-shadow">
      <CardHeader>
        <div className="flex justify-between items-start">
          <div>
            <CardTitle className="text-xl">{classItem.title}</CardTitle>
            <CardDescription>with {classItem.instructor}</CardDescription>
          </div>
          <div className="flex gap-1 flex-col">
            <Badge variant="outline">{classItem.class_type}</Badge>
            <Badge variant="secondary">{classItem.difficulty}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 mb-4">
          <div className="flex items-center gap-2 text-gray-600">
            <Calendar className="w-4 h-4" />
            <span className="text-sm">{formatDate(classItem.class_date)}</span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Clock className="w-4 h-4" />
            <span className="text-sm">
              {formatTime(classItem.class_time)} ({classItem.duration_minutes}{" "}
              min)
            </span>
          </div>
          <div className="flex items-center gap-2 text-gray-600">
            <Users className="w-4 h-4" />
            <span className="text-sm">
              {classItem.current_bookings}/{classItem.max_capacity} spots filled
            </span>
          </div>
          {classItem.companies?.address && (
            <div className="flex items-center gap-2 text-gray-600">
              <MapPin className="w-4 h-4" />
              <div className="flex flex-col">
                <span className="text-sm">{classItem.companies.address}</span>
                {distance && (
                  <span className="text-xs text-blue-600 font-medium">
                    {distance.toFixed(1)} miles away
                  </span>
                )}
              </div>
            </div>
          )}
        </div>

        {classItem.companies?.company_name && (
          <p className="text-sm text-gray-500 mb-4">
            Hosted by {classItem.companies.company_name}
          </p>
        )}

        <Button
          className="w-full"
          onClick={() => bookClass(classItem.id)}
          disabled={classItem.current_bookings >= classItem.max_capacity}
        >
          {classItem.current_bookings >= classItem.max_capacity
            ? "Class Full"
            : "Book Class"}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function ClassSchedule() {
  const { classes, fetchClasses } = useUserClasses();
  const { toast } = useToast();
  const [location, setLocation] = useState<LocationState>({
    latitude: null,
    longitude: null,
    loading: false,
    error: null
  });

  const isLoading = !classes;

  const requestLocation = () => {
    if (!navigator.geolocation) {
      toast({
        title: "Location not supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return;
    }

    setLocation(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          loading: false,
          error: null
        });
        toast({
          title: "Location found",
          description: "Now showing distances to classes!",
        });
      },
      (error) => {
        let errorMessage = "Unable to get your location.";
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied. Please enable location permissions.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }
        setLocation(prev => ({ ...prev, loading: false, error: errorMessage }));
        toast({
          title: "Location Error",
          description: errorMessage,
          variant: "destructive",
        });
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 600000 // 10 minutes
      }
    );
  };

  useEffect(() => {
    fetchClasses();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (isLoading) {
    return (
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <div className="text-center">
            <div className="text-lg">Loading classes...</div>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="py-16 bg-gray-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Upcoming Classes
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-6">
            Discover and book amazing fitness classes from top wellness
            companies
          </p>
          
          <div className="flex justify-center">
            <Button
              onClick={requestLocation}
              disabled={location.loading}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Locate className="w-4 h-4" />
              {location.loading 
                ? "Getting location..." 
                : location.latitude 
                  ? "Location enabled" 
                  : "Show distances"}
            </Button>
          </div>
          
          {location.error && (
            <p className="text-sm text-red-600 mt-2">{location.error}</p>
          )}
        </div>

        {classes.length === 0 ? (
          <div className="text-center py-12">
            <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No upcoming classes
            </h3>
            <p className="text-gray-600">Check back soon for new classes!</p>
          </div>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {classes.map((classItem) => (
              <ClassCard key={classItem.id} classItem={classItem} userLocation={location} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
