import type { LucideIcon } from "lucide-react";
import {
  Keyboard,
  Code2,
  Laptop,
  BookOpen,
  GitFork,
  FileText,
  BrainCircuit,
  NotebookPen,
  Dumbbell,
  Coffee,
} from "lucide-react";

export type TaskSuggestion = {
  label: string;
  title: string;
  icon: LucideIcon;
};

// export const taskSuggestions: TaskSuggestion[] = [
//   {
//     label: "Buy groceries",
//     title: "Buy groceries",
//     icon: ShoppingCart,
//   },
//   {
//     label: "Workout",
//     title: "Workout for 1 hour",
//     icon: Dumbbell,
//   },
//   {
//     label: "Study",
//     title: "Study DSA",
//     icon: GraduationCap,
//   },
//   {
//     label: "Read",
//     title: "Read 20 pages",
//     icon: BookOpen,
//   },
//   {
//     label: "Meeting",
//     title: "Attend team meeting",
//     icon: Briefcase,
//   },
//   {
//     label: "Coffee Break",
//     title: "Take a coffee break",
//     icon: Coffee,
//   },
//   {
//     label: "Clean Room",
//     title: "Clean my room",
//     icon: House,
//   },
//   {
//     label: "Travel",
//     title: "Plan weekend trip",
//     icon: Plane,
//   },
// ];

export const taskSuggestions: TaskSuggestion[] = [
  {
    label: "Typing",
    title: "Practice typing for 10 minutes",
    icon: Keyboard,
  },
  {
    label: "DSA",
    title: "Solve 1 DSA problem",
    icon: Code2,
  },
  {
    label: "Coding",
    title: "Work on your coding project",
    icon: Laptop,
  },
  {
  label: "Revision",
  title: "Study for end-semester exams for 1 hour",
  icon: NotebookPen,
},
  {
    label: "GitHub",
    title: "Make at least one GitHub commit today",
    icon: GitFork,
  },
  {
    label: "Resume",
    title: "Improve your resume or portfolio",
    icon: FileText,
  },
  {
    label: "Aptitude",
    title: "Practice aptitude questions",
    icon: BrainCircuit,
  },
  {
    label: "Workout",
    title: "Exercise for 45 minutes",
    icon: Dumbbell,
  },
  {
    label: "Break",
    title: "Take a 15-minute break",
    icon: Coffee,
  },
];