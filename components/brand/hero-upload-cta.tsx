"use client";

import { useRef, useState, type DragEvent } from "react";
import Link from "next/link";
import { UploadCloud, FileCheck2 } from "lucide-react";

const ACCEPTED = [".pdf", ".doc", ".docx"];

function isAccepted(file: File) {
  const name = file.name.toLowerCase();
  return ACCEPTED.some((ext) => name.endsWith(ext));
}

/**
 * A real dropzone, not a styled link pretending to be one. It accepts an
 * actual drag-and-drop or click-to-browse file, then is honest about what
 * happens next: analysis needs an account, so it hands the file's name back
 * and asks the visitor to continue -- it never silently swallows the file.
 */
export function HeroUploadCta() {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFiles(files: FileList | null) {
    const file = files?.[0];
    if (!file || !isAccepted(file)) return;
    setFileName(file.name);
  }

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    handleFiles(e.dataTransfer.files);
  }

  if (fileName) {
    return (
      <div className="flex w-full sm:w-auto flex-1 items-center justify-between rounded-[4px] border border-[#e8c6a8] bg-white px-3.5 py-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.05)]">
        <div className="flex items-center min-w-0">
          <FileCheck2 className="size-4 text-[#b04000] mr-2.5 shrink-0" />
          <span className="text-xs sm:text-sm text-[#08090a] truncate">
            {fileName} selected
          </span>
        </div>
        <Link
          href="/signup"
          className="shrink-0 ml-2 text-xs font-medium bg-[#08090a] text-white px-3 py-1 rounded-[4px] hover:bg-[#000000]"
        >
          Create free account to analyze
        </Link>
      </div>
    );
  }

  return (
    <div
      role="button"
      tabIndex={0}
      onClick={() => inputRef.current?.click()}
      onKeyDown={(e) => {
        if (e.key === "Enter" || e.key === " ") inputRef.current?.click();
      }}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={`flex w-full sm:w-auto flex-1 cursor-pointer items-center justify-between rounded-[4px] border bg-white px-3.5 py-2.5 shadow-[0_2px_4px_rgba(0,0,0,0.05)] transition-colors group ${
        isDragging
          ? "border-[#b04000] bg-[#fbeee4]/40"
          : "border-[#dddddd] hover:border-[#cccccc]"
      }`}
    >
      <input
        ref={inputRef}
        type="file"
        accept={ACCEPTED.join(",")}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />
      <div className="flex items-center">
        <UploadCloud className="size-4 text-[#b04000] mr-2.5 shrink-0" />
        <span className="text-xs sm:text-sm text-[#868c98] group-hover:text-[#525866]">
          {isDragging ? "Drop it here" : "Drop a contract PDF or DOCX to analyze..."}
        </span>
      </div>
      <span className="shrink-0 ml-2 text-xs font-medium bg-[#08090a] text-white px-3 py-1 rounded-[4px]">
        Browse
      </span>
    </div>
  );
}
