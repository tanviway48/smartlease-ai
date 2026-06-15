"use client";

import { useRouter } from "next/navigation";
import LeaseAnalysisResults from "@/components/lease/LeaseAnalysisResults";
import type { LeaseAnalysisResult } from "@/lib/gemini";

interface Props {
  result: LeaseAnalysisResult;
  fileName: string;
  analysisId: string;
}

export default function ReportResultsClient({ result, fileName, analysisId }: Props) {
  const router = useRouter();

  return (
    <LeaseAnalysisResults
      result={result}
      fileName={fileName}
      analysisId={analysisId}
      onReset={() => router.push("/dashboard/analyze")}
    />
  );
}
