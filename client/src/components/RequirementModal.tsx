import { useState, useEffect } from "react";
import { trpc } from "@/lib/trpc";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

interface RequirementModalProps {
  requirement: any;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

const STATUS_OPTIONS = [
  { value: "pendente", label: "Pendente" },
  { value: "em_andamento", label: "Em Andamento" },
  { value: "concluido", label: "Concluído" },
];

export default function RequirementModal({
  requirement,
  open,
  onClose,
  onSuccess,
}: RequirementModalProps) {
  const [status, setStatus] = useState<string>("pendente");
  const [linkEvidencia, setLinkEvidencia] = useState("");
  const [observacoes, setObservacoes] = useState("");

  const utils = trpc.useUtils();
  const updateMutation = trpc.requirements.updateStatus.useMutation({
    onSuccess: () => {
      toast.success("Requisito atualizado com sucesso!");
      // Invalidar ambas as queries para atualizar em tempo real
      utils.requirements.getBySector.invalidate();
      utils.requirements.getProgress.invalidate();
      onSuccess();
      onClose();
    },
    onError: (error) => {
      toast.error("Erro ao atualizar requisito: " + error.message);
    },
  });

  // Preencher campos quando o modal abre
  useEffect(() => {
    if (requirement && open) {
      setStatus(requirement.update?.status || "pendente");
      setLinkEvidencia(requirement.update?.linkEvidencia || "");
      setObservacoes(requirement.update?.observacoes || "");
    }
  }, [requirement, open]);

  const handleSave = () => {
    if (!requirement) return;

    updateMutation.mutate({
      requirementId: requirement.id,
      status: status as "pendente" | "em_andamento" | "concluido",
      linkEvidencia: linkEvidencia || undefined,
      observacoes: observacoes || undefined,
    });
  };

  if (!requirement) return null;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{requirement.requisito}</DialogTitle>
          <DialogDescription asChild>
            <div className="mt-2 space-y-2 text-sm text-gray-700">
              <div><strong>Meta:</strong> {requirement.item}</div>
              {requirement.descricao && (
                <div><strong>Descrição:</strong> {requirement.descricao}</div>
              )}
              <div><strong>Prazo:</strong> {requirement.deadline ? new Date(requirement.deadline).toLocaleDateString("pt-BR") : "Não definido"}</div>
              <div><strong>Pontos:</strong> {requirement.pontosAplicaveis2026}</div>
            </div>
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={setStatus}>
              <SelectTrigger id="status">
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="link">Link de Evidência</Label>
            <Input
              id="link"
              type="url"
              placeholder="https://..."
              value={linkEvidencia}
              onChange={(e) => setLinkEvidencia(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="obs">Observações</Label>
            <Textarea
              id="obs"
              placeholder="Adicione observações sobre o andamento..."
              rows={4}
              value={observacoes}
              onChange={(e) => setObservacoes(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={updateMutation.isPending}>
            Cancelar
          </Button>
          <Button onClick={handleSave} disabled={updateMutation.isPending}>
            {updateMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Salvar
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
