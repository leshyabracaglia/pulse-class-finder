export const CLASS_DIFFICULTIES = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
} as const;

export type IClassDifficulty =
  (typeof CLASS_DIFFICULTIES)[keyof typeof CLASS_DIFFICULTIES];

export interface IClassData {
  id: string;
  organization_uid: string;
  instructor_uid: string;
  title: string;
  class_time: string;
  class_date: string;
  max_capacity: number;
  price_cents: number;
  current_bookings: number;
  instructor_name?: string;
  organization_name?: string;
  image_url?: string | null;
  instructor_photo_url?: string | null;
}
