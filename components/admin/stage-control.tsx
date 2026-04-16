"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { stageLabels } from "@/lib/content/messages";

interface Props {
  applicationId: string;
  current: string;
}

export function StageControl({ applicationId, current }: Props) {
  const router = useRouter();
  const [stage, setStage] = useState(current);
  const [pending, start] = useTransition();

  function update(v: string) {
    setStage(v);
    start(async () => {
      await fetch(`/api/admin/applications/${applicationId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ stage: v }),
      });
      router.refresh();
    });
  }

  return (
    <div className="flex items-center gap-2">
      <Select value={stage} onValueChange={update}>
        <SelectTrigger className="w-[220px]"><SelectValue /></SelectTrigger>
        <SelectContent>
          {Object.entries(stageLabels).map(([k, v]) => (
            <SelectItem key={k} value={k}>{v}</SelectItem>
          ))}
        </SelectContent>
      </Select>
      {pending && <Loader2 className="h-4 w-4 animate-spin text-muted-foreground" />}
    </div>
  );
}
