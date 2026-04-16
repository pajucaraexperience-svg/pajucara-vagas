"use client";
import { useRef, useState } from "react";
import { File as FileIcon, UploadCloud, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FieldError } from "@/components/public/field-error";
import { validation } from "@/lib/content/messages";

const ACCEPTED = [
  "application/pdf",
  "application/msword",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
];
const MAX = 10 * 1024 * 1024;

interface UploadedFile {
  name: string;
  url: string;
}

interface Props {
  label: string;
  required?: boolean;
  value?: UploadedFile | null;
  onChange: (v: UploadedFile | null) => void;
  multiple?: boolean;
  multiValue?: UploadedFile[];
  onMultiChange?: (v: UploadedFile[]) => void;
  error?: string;
}

export function ResumeUpload({
  label,
  required,
  value,
  onChange,
  multiple,
  multiValue = [],
  onMultiChange,
  error,
}: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [localError, setLocalError] = useState<string | null>(null);

  async function uploadOne(file: File) {
    if (!ACCEPTED.includes(file.type)) {
      setLocalError(validation.resumeType);
      return null;
    }
    if (file.size > MAX) {
      setLocalError(validation.resumeSize);
      return null;
    }
    setLocalError(null);

    const fd = new FormData();
    fd.append("file", file);
    const res = await fetch("/api/upload", { method: "POST", body: fd });
    if (!res.ok) {
      setLocalError("Não foi possível enviar o arquivo. Tente novamente.");
      return null;
    }
    const data = (await res.json()) as { url: string; name: string };
    return data;
  }

  async function handleFiles(files: FileList | null) {
    if (!files || files.length === 0) return;
    setBusy(true);
    if (multiple && onMultiChange) {
      const uploaded: UploadedFile[] = [];
      for (const f of Array.from(files)) {
        const r = await uploadOne(f);
        if (r) uploaded.push(r);
      }
      onMultiChange([...multiValue, ...uploaded]);
    } else {
      const r = await uploadOne(files[0]);
      if (r) onChange(r);
    }
    setBusy(false);
  }

  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium">
        {label}
        {required && <span className="ml-1 text-destructive">*</span>}
      </label>

      {!multiple && value && (
        <div className="flex items-center justify-between rounded-md border bg-secondary/40 p-3 text-sm">
          <span className="flex items-center gap-2">
            <FileIcon className="h-4 w-4" /> {value.name}
          </span>
          <button
            type="button"
            onClick={() => onChange(null)}
            className="text-muted-foreground hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}

      {multiple && multiValue.length > 0 && (
        <ul className="space-y-2">
          {multiValue.map((f, i) => (
            <li
              key={`${f.url}-${i}`}
              className="flex items-center justify-between rounded-md border bg-secondary/40 p-3 text-sm"
            >
              <span className="flex items-center gap-2">
                <FileIcon className="h-4 w-4" /> {f.name}
              </span>
              <button
                type="button"
                onClick={() =>
                  onMultiChange?.(multiValue.filter((_, idx) => idx !== i))
                }
                className="text-muted-foreground hover:text-destructive"
              >
                <X className="h-4 w-4" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {(!value || multiple) && (
        <div
          className="flex flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-input bg-secondary/30 p-6 text-center"
          onDragOver={(e) => e.preventDefault()}
          onDrop={(e) => {
            e.preventDefault();
            handleFiles(e.dataTransfer.files);
          }}
        >
          <UploadCloud className="h-7 w-7 text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            Arraste o arquivo aqui ou clique para selecionar
          </p>
          <p className="text-xs text-muted-foreground">PDF, DOC ou DOCX · até 10 MB</p>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,.doc,.docx"
            multiple={multiple}
            className="hidden"
            onChange={(e) => handleFiles(e.target.files)}
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={busy}
            onClick={() => inputRef.current?.click()}
          >
            {busy ? "Enviando..." : "Selecionar arquivo"}
          </Button>
        </div>
      )}

      <FieldError message={error ?? localError ?? undefined} />
    </div>
  );
}
