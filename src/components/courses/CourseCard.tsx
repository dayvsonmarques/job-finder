"use client";

import {
  ExternalLink,
  MapPin,
  Building2,
  GraduationCap,
  Clock,
  DollarSign,
  Award,
  Monitor,
  BookOpen,
} from "lucide-react";
import { Course } from "@/types";
import { clsx } from "clsx";

interface CourseCardProps {
  course: Course;
}

const LEVEL_LABELS: Record<string, string> = {
  "pos-graduacao": "Pós-Graduação",
  mestrado: "Mestrado",
  doutorado: "Doutorado",
};

const MODALITY_LABELS: Record<string, string> = {
  presencial: "Presencial",
  ead: "EAD",
  hibrido: "Híbrido",
};

const MODALITY_COLORS: Record<string, string> = {
  presencial: "bg-emerald-50 text-emerald-700 border-emerald-200",
  ead: "bg-violet-50 text-violet-700 border-violet-200",
  hibrido: "bg-amber-50 text-amber-700 border-amber-200",
};

export function CourseCard({ course }: CourseCardProps) {
  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <span
              className={clsx(
                "px-2 py-0.5 text-xs font-semibold rounded-full border",
                course.level === "mestrado"
                  ? "bg-blue-50 text-blue-700 border-blue-200"
                  : "bg-purple-50 text-purple-700 border-purple-200"
              )}
            >
              {LEVEL_LABELS[course.level] || course.level}
            </span>
            <span
              className={clsx(
                "px-2 py-0.5 text-xs font-semibold rounded-full border",
                MODALITY_COLORS[course.modality] || "bg-gray-50 text-gray-700"
              )}
            >
              <span className="flex items-center gap-1">
                <Monitor className="w-3 h-3" />
                {MODALITY_LABELS[course.modality] || course.modality}
              </span>
            </span>
            {course.mecRecognized && (
              <span className="flex items-center gap-1 px-2 py-0.5 text-xs font-semibold bg-green-50 text-green-700 border border-green-200 rounded-full">
                <Award className="w-3 h-3" />
                MEC
                {course.mecGrade && ` (Nota ${course.mecGrade})`}
              </span>
            )}
          </div>

          <h3 className="text-lg font-semibold text-gray-900 mt-2">
            {course.program}
          </h3>

          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {course.institution}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {course.city === "EAD" ? "100% Online" : `${course.city}, ${course.state}`}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              {course.duration}
            </span>
            {course.price && (
              <span className={clsx(
                "flex items-center gap-1 font-semibold",
                course.price.includes("Gratuito")
                  ? "text-green-600"
                  : "text-gray-600"
              )}>
                <DollarSign className="w-4 h-4" />
                {course.price}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <a
            href={course.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Ver programa"
            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <ExternalLink className="w-4 h-4" />
            Ver Programa
          </a>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-600 line-clamp-2 break-words">
        {course.description}
      </p>

      <div className="mt-3 flex items-center gap-2 flex-wrap">
        <span className="flex items-center gap-1 text-xs text-gray-500">
          <BookOpen className="w-3 h-3" />
          {course.area}
        </span>
        <span className="text-gray-300">·</span>
        {course.tags.slice(0, 5).map((tag) => (
          <span
            key={tag}
            className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full"
          >
            {tag}
          </span>
        ))}
      </div>
    </div>
  );
}
