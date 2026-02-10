import { CourseList } from "@/components/courses/CourseList";
import { GraduationCap } from "lucide-react";

export default function CoursesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <GraduationCap className="w-8 h-8 text-purple-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Pós-Graduação e Mestrado
          </h1>
          <p className="text-sm text-gray-500">
            Programas gratuitos reconhecidos pelo MEC em instituições públicas —
            Recife e região
          </p>
        </div>
      </div>
      <CourseList />
    </div>
  );
}
