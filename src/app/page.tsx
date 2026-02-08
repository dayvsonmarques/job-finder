import { JobList } from "@/components/jobs/JobList";
import { Briefcase } from "lucide-react";

export default function HomePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Briefcase className="w-8 h-8 text-blue-600" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Vagas de Emprego
          </h1>
          <p className="text-sm text-gray-500">
            Pesquise e acompanhe vagas em tempo real
          </p>
        </div>
      </div>
      <JobList filter="all" showSearchControls />
    </div>
  );
}
