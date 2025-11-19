import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { APP_TITLE } from "@/const";

export default function SectorSelection() {
  const [, setLocation] = useLocation();
  const [selectedSector, setSelectedSector] = useState<string>("");
  const [selectedCoordinator, setSelectedCoordinator] = useState<string>("");

  const { data: sectors, isLoading: loadingSectors } = trpc.requirements.getSectors.useQuery();
  const { data: coordinators, isLoading: loadingCoordinators } = trpc.requirements.getCoordinators.useQuery();

  const handleEnterSector = () => {
    if (selectedSector) {
      setLocation(`/dashboard?sector=${encodeURIComponent(selectedSector)}`);
    }
  };

  const handleEnterCoordinator = () => {
    if (selectedCoordinator) {
      setLocation(`/dashboard?coordenador=${encodeURIComponent(selectedCoordinator)}`);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-blue-100">
      <div className="w-full max-w-md p-8 bg-white rounded-lg shadow-xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-blue-900 mb-2">
            {APP_TITLE}
          </h1>
          <p className="text-gray-600">
            Sistema de Acompanhamento de Metas Estratégicas
          </p>
        </div>

        <div className="space-y-8">
          {/* Seleção por Setor */}
          <div className="space-y-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecionar por Setor
            </label>
            {loadingSectors ? (
              <div className="flex items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
              </div>
            ) : (
              <Select value={selectedSector} onValueChange={setSelectedSector}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione seu setor..." />
                </SelectTrigger>
                <SelectContent>
                  {sectors?.map((sector) => (
                    <SelectItem key={sector} value={sector}>
                      {sector}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
            <Button
              onClick={handleEnterSector}
              disabled={!selectedSector || loadingSectors}
              className="w-full bg-blue-600 hover:bg-blue-700"
              size="lg"
            >
              Ver Metas do Setor
            </Button>
          </div>

          {/* Seleção por Coordenador */}
            <div className="space-y-4 border-t pt-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Selecionar por Coordenador Executivo
              </label>
              {loadingCoordinators ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
                </div>
              ) : (
                <Select value={selectedCoordinator} onValueChange={setSelectedCoordinator}>
                  <SelectTrigger className="w-full">
                    <SelectValue placeholder="Selecione o coordenador..." />
                  </SelectTrigger>
                  <SelectContent>
                    {coordinators?.filter(c => !!c).map((coord) => (
                      <SelectItem key={coord} value={coord}>
                        {coord}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
              <Button
                onClick={handleEnterCoordinator}
                disabled={!selectedCoordinator || loadingCoordinators}
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
              >
                Ver Metas do Coordenador
              </Button>
            </div>
        </div>

        <div className="mt-8 text-center text-sm text-gray-500">
          <p>Tribunal de Justiça da Paraíba</p>
          <p className="mt-1">Prêmio CNJ de Qualidade 2026</p>
        </div>
      </div>
    </div>
  );
}
