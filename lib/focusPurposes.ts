import {
  Target,
  Briefcase,
  BookOpen,
  Dumbbell,
  GraduationCap,
  Plus,
  type LucideIcon,
} from "lucide-react";

export interface FocusPurpose {
  id: string;
  label: string;
  labelKo: string;
  icon: LucideIcon;
  color: string;
  bgColor: string;
}

export const FOCUS_PURPOSES: FocusPurpose[] = [
  {
    id: "focus",
    label: "Focus",
    labelKo: "집중",
    icon: Target,
    color: "text-blue-400",
    bgColor: "bg-blue-500/20",
  },
  {
    id: "work",
    label: "Work",
    labelKo: "업무",
    icon: Briefcase,
    color: "text-amber-400",
    bgColor: "bg-amber-500/20",
  },
  {
    id: "read",
    label: "Read",
    labelKo: "독서",
    icon: BookOpen,
    color: "text-green-400",
    bgColor: "bg-green-500/20",
  },
  {
    id: "exercise",
    label: "Exercise",
    labelKo: "운동",
    icon: Dumbbell,
    color: "text-red-400",
    bgColor: "bg-red-500/20",
  },
  {
    id: "study",
    label: "Study",
    labelKo: "학습",
    icon: GraduationCap,
    color: "text-purple-400",
    bgColor: "bg-purple-500/20",
  },
  {
    id: "custom",
    label: "Custom",
    labelKo: "기타",
    icon: Plus,
    color: "text-gray-400",
    bgColor: "bg-gray-500/20",
  },
];

export function getFocusPurposeById(id: string): FocusPurpose | undefined {
  return FOCUS_PURPOSES.find((p) => p.id === id);
}
