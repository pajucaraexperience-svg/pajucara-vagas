"use client";
import { useState } from "react";
import { Download, FileText, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ResumeLink({
  applicationId,
  fileName = "Currículo",
}: {
  applicationId: string;
  fileName?: string;
}) {
  const [busy, setBusy] = useState(false);

  async function open(kind: "view" | "download" = "view") {
    setBusy(true);
    const res = await fetch(`/api/admin/applications/${applicationId}/resume`);
    setBusy(false);
    if (!res.ok) return alert("Não foi possível abrir o currículo.");
    const { url } = (await res.json()) as { url: string };
    if (kind === "download") {
      const a = document.createElement("a");
      a.href = url;
      a.download = fileName;
      document.body.appendChild(a);
      a.click();
      a.remove();
    } else {
      window.open(url, "_blank", "noopener,noreferrer");
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2">
      <Button variant="outline" size="sm" onClick={() => open("view")} disabled={busy}>
        {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <FileText className="h-4 w-4" />}
        Abrir currículo
      </Button>
      <Button variant="ghost" size="sm" onClick={() => open("download")} disabled={busy}>
        <Download className="h-4 w-4" /> Baixar
      </Button>
    </div>
  );
}
