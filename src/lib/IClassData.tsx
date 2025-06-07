export const CLASS_DIFFICULTIES = {
  BEGINNER: "Beginner",
  INTERMEDIATE: "Intermediate",
  ADVANCED: "Advanced",
} as const;

export type IClassDifficulty =
  (typeof CLASS_DIFFICULTIES)[keyof typeof CLASS_DIFFICULTIES];

export interface IClassData {
  id: string;
  title: string;
  instructor: string;
  class_time: string;
  class_date: string;
  duration_minutes: number;
  difficulty: IClassDifficulty;
  class_type: string;
  max_capacity: number;
  current_bookings: number;
}

export const DEFAULT_CLASS_DATA: IClassData = {
  id: "",
  title: "",
  instructor: "",
  class_time: "",
  class_date: "",
  duration_minutes: 60,
  difficulty: CLASS_DIFFICULTIES.BEGINNER,
  class_type: "",
  max_capacity: 20,
  current_bookings: 0,
};
