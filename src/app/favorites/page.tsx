import { JobList } from "@/components/jobs/JobList";
import { Star } from "lucide-react";

export default function FavoritesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Star className="w-8 h-8 text-yellow-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Vagas Favoritas
          </h1>
          <p className="text-sm text-gray-500">
            Vagas que você marcou como favoritas
          </p>
        </div>
      </div>
      <JobList filter="favorite" />
    </div>
  );
}
