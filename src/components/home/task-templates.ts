import type { LucideIcon } from "lucide-react";
import {
  ShoppingCart,
  Dumbbell,
  BookOpen,
  Briefcase,
  GraduationCap,
  Plane,
  Coffee,
  House,
} from "lucide-react";

export type TaskSuggestion = {
  label: string;
  title: string;
  icon: LucideIcon;
};

export const taskSuggestions: TaskSuggestion[] = [
  {
    label: "Buy groceries",
    title: "Buy groceries",
    icon: ShoppingCart,
  },
  {
    label: "Workout",
    title: "Workout for 1 hour",
    icon: Dumbbell,
  },
  {
    label: "Study",
    title: "Study DSA",
    icon: GraduationCap,
  },
  {
    label: "Read",
    title: "Read 20 pages",
    icon: BookOpen,
  },
  {
    label: "Meeting",
    title: "Attend team meeting",
    icon: Briefcase,
  },
  {
    label: "Coffee Break",
    title: "Take a coffee break",
    icon: Coffee,
  },
  {
    label: "Clean Room",
    title: "Clean my room",
    icon: House,
  },
  {
    label: "Travel",
    title: "Plan weekend trip",
    icon: Plane,
  },
];