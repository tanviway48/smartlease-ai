"use client";

import { useState, useRef, useCallback } from "react";
import { Upload, Sparkles, AlertCircle, FileText } from "lucide-react";
import { useUploadThing } from "@/lib/uploadthing-client";
import { analyzeLeaseAction } from "@/app/actions/analyzeLeaseAction";
import type { LeaseAnalysisResult } from "@/lib/gemini";
import { cn } from "@/lib/utils";

interface LeaseUploaderProps {
  onUploadComplete: (analysisId: string, result: LeaseAnalysisResult, fileName: string) => void;
  onError: (error: string) => void;
}

type UploaderState =
  | { status: "idle" }
  | { status: "dragging" }
  | { status: "uploading"; fileName: string; fileSize: string }
  | { status: "analyzing"; fileName: string }
  | { status: "error"; message: string };

function formatBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export default function LeaseUploader({ onUploadComplete, onError }: LeaseUploaderProps) {
  const [state, setState] = useState<UploaderState>({ status: "idle" });
  const inputRef = useRef<HTMLInputElement>(null);
  const dragCounter = useRef(0);
  const pendingFileName = useRef<string>("");

  const { startUpload } = useUploadThing("leaseUploader", {
    onClientUploadComplete: async (res) => {
      try {
        if (!res || res.length === 0) {
          setState({ status: "error", message: "Upload failed. No file received." });
          onError("Upload failed. No file received.");
          return;
        }
        const fileUrl = res[0].ufsUrl;;
        const fileName = res[0].name ?? pendingFileName.current;
        setState({ status: "analyzing", fileName });

        const result = await analyzeLeaseAction(fileUrl, fileName);

        if (result.success) {
          onUploadComplete(result.analysisId, result.result, fileName);
        } else {
          setState({ status: "error", message: result.error });
          onError(result.error);
        }
      } catch {
        const msg = "Analysis failed. Please try again.";
        setState({ status: "error", message: msg });
        onError(msg);
      }
    },
    onUploadError: (error) => {
      const msg = error.message || "Upload failed.";
      setState({ status: "error", message: msg });
      onError(msg);
    },
  });

  const processFile = useCallback(
    async (file: File) => {
      if (file.type !== "application/pdf") {
        setState({ status: "error", message: "Please upload a PDF file only." });
        return;
      }
      if (file.size > 8 * 1024 * 1024) {
        setState({ status: "error", message: "File too large. Maximum size is 8MB." });
        return;
      }

      pendingFileName.current = file.name;
      setState({ status: "uploading", fileName: file.name, fileSize: formatBytes(file.size) });
      await startUpload([file]);
    },
    [startUpload]
  );

  const onDragEnter = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current += 1;
    if (state.status === "idle") setState({ status: "dragging" });
  };

  const onDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current -= 1;
    if (dragCounter.current === 0) setState({ status: "idle" });
  };

  const onDragOver = (e: React.DragEvent) => e.preventDefault();

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    dragCounter.current = 0;
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  };

  const onInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = "";
  };

  const reset = () => {
    setState({ status: "idle" });
    dragCounter.current = 0;
  };

  const isIdle = state.status === "idle";
  const isDragging = state.status === "dragging";
  const isUploading = state.status === "uploading";
  const isAnalyzing = state.status === "analyzing";
  const isError = state.status === "error";

  return (
    <div className="w-full">
      {/* Main drop zone */}
      {(isIdle || isDragging) && (
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload PDF"
          onDragEnter={onDragEnter}
          onDragLeave={onDragLeave}
          onDragOver={onDragOver}
          onDrop={onDrop}
          onClick={() => inputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && inputRef.current?.click()}
          className={cn(
            "rounded-2xl border-2 border-dashed p-8 sm:p-12 text-center cursor-pointer transition-all duration-200 select-none",
            isDragging
              ? "border-indigo-500 bg-indigo-50"
              : "border-slate-200 bg-white hover:border-indigo-400 hover:bg-indigo-50"
          )}
        >
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,application/pdf"
            className="hidden"
            onChange={onInputChange}
          />
          <Upload
            className={cn(
              "w-12 h-12 mx-auto mb-4 transition-colors duration-200",
              isDragging ? "text-indigo-500" : "text-slate-300"
            )}
          />
          <p className="text-xl font-semibold text-slate-700 mb-1">
            {isDragging ? "Release to upload your lease" : "Drop your lease PDF here"}
          </p>
          <p className="text-sm text-slate-400 mb-4">
            {isDragging ? "" : "or click to browse"}
          </p>
          <span className="inline-block bg-slate-100 text-slate-500 text-xs px-3 py-1 rounded-full">
            PDF files only · Max 8MB
          </span>
        </div>
      )}

      {/* Uploading state */}
      {isUploading && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-white p-8 sm:p-12 text-center">
          <FileText className="w-12 h-12 mx-auto mb-4 text-indigo-400" />
          <p className="text-lg font-semibold text-slate-700 mb-1">Uploading securely...</p>
          <p className="text-sm text-slate-500 mb-1">{state.fileName}</p>
          <p className="text-xs text-slate-400 mb-6">{state.fileSize}</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full animate-pulse w-3/5" />
          </div>
        </div>
      )}

      {/* Analyzing state */}
      {isAnalyzing && (
        <div className="rounded-2xl border-2 border-indigo-200 bg-white p-8 sm:p-12 text-center">
          <Sparkles className="w-12 h-12 mx-auto mb-4 text-indigo-500 animate-pulse" />
          <p className="text-xl font-semibold text-slate-700 mb-2">
            Analyzing your lease
            <span className="inline-flex ml-1">
              <span className="animate-[bounce_1s_infinite_0ms]">.</span>
              <span className="animate-[bounce_1s_infinite_200ms]">.</span>
              <span className="animate-[bounce_1s_infinite_400ms]">.</span>
            </span>
          </p>
          <p className="text-sm text-slate-400 mb-2">
            Reading clauses · Checking tenant rights · Calculating risk
          </p>
          <p className="text-xs text-slate-300">Usually takes 20–30 seconds</p>
          <div className="w-full bg-slate-100 rounded-full h-1.5 mt-6 overflow-hidden">
            <div className="h-full bg-indigo-500 rounded-full animate-pulse w-4/5" />
          </div>
        </div>
      )}

      {/* Error state */}
      {isError && (
        <div className="rounded-2xl border-2 border-red-200 bg-red-50 p-8 sm:p-12 text-center">
          <AlertCircle className="w-12 h-12 mx-auto mb-4 text-red-400" />
          <p className="text-lg font-semibold text-red-700 mb-2">Upload failed</p>
          <p className="text-sm text-red-600 mb-6">{state.message}</p>
          <button
            onClick={reset}
            className="inline-flex items-center px-5 py-2.5 rounded-xl bg-white border border-red-200 text-red-600 text-sm font-medium hover:bg-red-50 transition-colors cursor-pointer"
          >
            Try again
          </button>
        </div>
      )}
    </div>
  );
}
