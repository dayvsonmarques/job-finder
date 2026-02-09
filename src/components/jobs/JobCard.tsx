"use client";

import {
  Star,
  Send,
  ExternalLink,
  MapPin,
  Building2,
  DollarSign,
  Sparkles,
} from "lucide-react";
import { Job } from "@/types";
import { clsx } from "clsx";

interface JobCardProps {
  job: Job;
  onToggleFavorite: (id: string) => void;
  onToggleSubmitted: (id: string) => void;
}

function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, "").trim();
}

export function JobCard({
  job,
  onToggleFavorite,
  onToggleSubmitted,
}: JobCardProps) {
  const tags = job.tags?.split(", ").filter(Boolean) || [];

  return (
    <div className="w-full bg-white rounded-xl border border-gray-200 p-6 hover:shadow-lg transition-shadow overflow-hidden">
      <div className="flex items-start justify-between gap-4">
        <div className="flex-1 min-w-0">
          <h3 className="text-lg font-semibold text-gray-900 truncate">
            {job.title}
          </h3>
          <div className="mt-2 flex flex-wrap gap-3 text-sm text-gray-600">
            <span className="flex items-center gap-1">
              <Building2 className="w-4 h-4" />
              {job.company}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="w-4 h-4" />
              {job.location}
            </span>
            {job.salary && (
              <span className="flex items-center gap-1">
                <DollarSign className="w-4 h-4" />
                {job.salary}
              </span>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={() => onToggleFavorite(job.id)}
            title={job.isFavorite ? "Remover favorito" : "Favoritar"}
            className={clsx(
              "p-2 rounded-lg transition-colors",
              job.isFavorite
                ? "bg-yellow-100 text-yellow-600"
                : "bg-gray-100 text-gray-400 hover:bg-yellow-50 hover:text-yellow-500"
            )}
          >
            <Star
              className={clsx("w-5 h-5", job.isFavorite && "fill-current")}
            />
          </button>
          <button
            onClick={() => onToggleSubmitted(job.id)}
            title={job.isSubmitted ? "Desmarcar envio" : "Marcar como enviada"}
            className={clsx(
              "p-2 rounded-lg transition-colors",
              job.isSubmitted
                ? "bg-green-100 text-green-600"
                : "bg-gray-100 text-gray-400 hover:bg-green-50 hover:text-green-500"
            )}
          >
            <Send
              className={clsx("w-5 h-5", job.isSubmitted && "fill-current")}
            />
          </button>
          <a
            href={job.url}
            target="_blank"
            rel="noopener noreferrer"
            title="Abrir vaga"
            className="p-2 rounded-lg bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500 transition-colors"
          >
            <ExternalLink className="w-5 h-5" />
          </a>
        </div>
      </div>

      <p className="mt-3 text-sm text-gray-600 line-clamp-2 break-words">
        {job.aiSummary || stripHtml(job.description)}
      </p>

      {job.aiSummary && (
        <div className="mt-2 flex items-center gap-1 text-xs text-purple-500">
          <Sparkles className="w-3 h-3" />
          <span>Resumo por IA</span>
        </div>
      )}

      {tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {tags.slice(0, 5).map((tag) => (
            <span
              key={tag}
              className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-700 rounded-full"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center justify-between text-xs text-gray-400">
        <span className="bg-gray-100 px-2 py-1 rounded">{job.source}</span>
        {job.postedAt && (
          <span>
            {new Date(job.postedAt).toLocaleDateString("pt-BR")}
          </span>
        )}
      </div>
    </div>
  );
}
