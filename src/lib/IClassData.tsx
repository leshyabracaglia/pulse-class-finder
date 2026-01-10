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
  // duration_minutes: number;
  // difficulty: IClassDifficulty;
  // class_type: string;
  max_capacity: number;
  // current_bookings: number;
}
