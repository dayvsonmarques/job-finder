import { JobList } from "@/components/jobs/JobList";
import { Send } from "lucide-react";

export default function SubmittedPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Send className="w-8 h-8 text-green-500" />
        <div>
          <h1 className="text-2xl font-bold text-gray-900">
            Vagas Submetidas
          </h1>
          <p className="text-sm text-gray-500">
            Vagas para as quais você já se candidatou
          </p>
        </div>
      </div>
      <JobList filter="submitted" />
    </div>
  );
}
