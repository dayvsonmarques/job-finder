"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Course, CourseModalityFilter, CourseLevelFilter } from "@/types";
import { CourseCard } from "./CourseCard";
import {
  Loader2,
  Search,
  SearchX,
  GraduationCap,
  MapPin,
  Monitor,
  BookOpen,
  Gift,
} from "lucide-react";
import { clsx } from "clsx";

interface CourseStats {
  total: number;
  presencial: number;
  ead: number;
  mestrado: number;
  posGraduacao: number;
  doutorado: number;
  recife: number;
  comBolsa: number;
}

export function CourseList() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [stats, setStats] = useState<CourseStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [modality, setModality] = useState<CourseModalityFilter>("all");
  const [level, setLevel] = useState<CourseLevelFilter>("all");

  const fetchCourses = useCallback(async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      if (searchTerm) params.set("q", searchTerm);
      if (modality !== "all") params.set("modality", modality);
      if (level !== "all") params.set("level", level);

      const res = await fetch(`/api/courses?${params}`);
      if (!res.ok) return;
      const data = await res.json();
      setCourses(data.courses);
      setStats(data.stats);
    } catch {
    } finally {
      setLoading(false);
    }
  }, [searchTerm, modality, level]);

  useEffect(() => {
    const debounce = setTimeout(fetchCourses, 300);
    return () => clearTimeout(debounce);
  }, [fetchCourses]);

  const filteredCourses = useMemo(() => courses, [courses]);

  return (
    <div className="space-y-6">
      {stats && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
          <StatBadge
            icon={<BookOpen className="w-4 h-4" />}
            label="Gratuitos"
            value={stats.total}
            color="bg-green-50 text-green-700 border-green-200"
          />
          <StatBadge
            icon={<MapPin className="w-4 h-4" />}
            label="em Recife"
            value={stats.recife}
            color="bg-emerald-50 text-emerald-700 border-emerald-200"
          />
          <StatBadge
            icon={<GraduationCap className="w-4 h-4" />}
            label="Mestrado"
            value={stats.mestrado}
            color="bg-blue-50 text-blue-700 border-blue-200"
          />
          <StatBadge
            icon={<Gift className="w-4 h-4" />}
            label="com Bolsa"
            value={stats.comBolsa}
            color="bg-amber-50 text-amber-700 border-amber-200"
          />
        </div>
      )}

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar programas, instituições, tecnologias..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div className="flex gap-2 shrink-0">
          <select
            value={modality}
            onChange={(e) => setModality(e.target.value as CourseModalityFilter)}
            className="px-3 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">Todas Modalidades</option>
            <option value="presencial">Presencial</option>
            <option value="ead">EAD</option>
            <option value="hibrido">Híbrido</option>
          </select>

          <select
            value={level}
            onChange={(e) => setLevel(e.target.value as CourseLevelFilter)}
            className="px-3 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
          >
            <option value="all">Todos os Níveis</option>
            <option value="pos-graduacao">Pós-Graduação</option>
            <option value="mestrado">Mestrado</option>
            <option value="doutorado">Doutorado</option>
          </select>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredCourses.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <SearchX className="w-16 h-16 mb-4" />
          <p className="text-lg">Nenhum programa encontrado</p>
          <p className="text-sm mt-2">
            Tente ajustar os filtros ou termos de busca
          </p>
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {filteredCourses.length} programa{filteredCourses.length !== 1 && "s"}{" "}
            encontrado{filteredCourses.length !== 1 && "s"}
          </p>
          <div className="grid grid-cols-1 gap-4 w-full">
            {filteredCourses.map((course) => (
              <CourseCard key={course.id} course={course} />
            ))}
          </div>
        </>
      )}
    </div>
  );
}

function StatBadge({
  icon,
  label,
  value,
  color,
}: {
  icon: React.ReactNode;
  label: string;
  value: number;
  color: string;
}) {
  return (
    <div
      className={clsx(
        "flex items-center gap-2 px-3 py-2 rounded-lg border text-sm font-medium",
        color
      )}
    >
      {icon}
      <span>{value}</span>
      <span className="text-xs opacity-70">{label}</span>
    </div>
  );
}
