"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import { Job, JobFilter } from "@/types";
import { JobCard } from "./JobCard";
import { Loader2, Search, SearchX, RefreshCw } from "lucide-react";

interface JobListProps {
  filter: JobFilter;
  showSearchControls?: boolean;
}

export function JobList({ filter, showSearchControls = false }: JobListProps) {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [searching, setSearching] = useState(false);

  const fetchJobs = useCallback(async () => {
    setLoading(true);
    const params = new URLSearchParams({ filter });
    const res = await fetch(`/api/jobs?${params}`);
    const data = await res.json();
    setJobs(data);
    setLoading(false);
  }, [filter]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  useEffect(() => {
    const handleFocus = () => fetchJobs();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, [fetchJobs]);

  const triggerSearch = async () => {
    setSearching(true);
    await fetch("/api/jobs/search", { method: "POST" });
    setSearching(false);
    fetchJobs();
  };

  const toggleFavorite = async (id: string) => {
    await fetch("/api/jobs/favorite", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (filter === "favorite") {
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } else {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id ? { ...j, isFavorite: !j.isFavorite } : j
        )
      );
    }
  };

  const toggleSubmitted = async (id: string) => {
    await fetch("/api/jobs/submitted", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id }),
    });

    if (filter === "submitted") {
      setJobs((prev) => prev.filter((j) => j.id !== id));
    } else {
      setJobs((prev) =>
        prev.map((j) =>
          j.id === id ? { ...j, isSubmitted: !j.isSubmitted } : j
        )
      );
    }
  };

  const filteredJobs = useMemo(() => {
    if (!searchTerm) return jobs;
    const term = searchTerm.toLowerCase();
    return jobs.filter(
      (job) =>
        job.title.toLowerCase().includes(term) ||
        job.company.toLowerCase().includes(term) ||
        job.location.toLowerCase().includes(term) ||
        (job.tags?.toLowerCase().includes(term) ?? false)
    );
  }, [jobs, searchTerm]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder="Filtrar vagas..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-3 rounded-lg border border-gray-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
        {showSearchControls && (
          <button
            onClick={triggerSearch}
            disabled={searching}
            className="flex items-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors shrink-0"
          >
            <RefreshCw
              className={`w-5 h-5 ${searching ? "animate-spin" : ""}`}
            />
            {searching ? "Buscando..." : "Buscar Agora"}
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
        </div>
      ) : filteredJobs.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-gray-400">
          <SearchX className="w-16 h-16 mb-4" />
          <p className="text-lg">Nenhuma vaga encontrada</p>
          {showSearchControls && (
            <p className="text-sm mt-2">
              Configure suas palavras-chave em Configurações e clique em Buscar
            </p>
          )}
        </div>
      ) : (
        <>
          <p className="text-sm text-gray-500">
            {filteredJobs.length} vaga{filteredJobs.length !== 1 && "s"}{" "}
            encontrada{filteredJobs.length !== 1 && "s"}
          </p>
          <div className="grid grid-cols-1 gap-4 w-full">
            {filteredJobs.map((job) => (
              <JobCard
                key={job.id}
                job={job}
                onToggleFavorite={toggleFavorite}
                onToggleSubmitted={toggleSubmitted}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
