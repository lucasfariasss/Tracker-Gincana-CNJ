import { useState, useMemo } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Loader2, ArrowLeft, Calendar, Target } from "lucide-react";
import { APP_TITLE } from "@/const";
import RequirementModal from "@/components/RequirementModal";
import ProgressBar from "@/components/ProgressBar";

// Esquema de cores por eixo
const EIXO_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  "1. GOVERNANÇA": { bg: "bg-blue-50", text: "text-blue-700", border: "border-blue-200" },
  "2. PRODUTIVIDADE": { bg: "bg-green-50", text: "text-green-700", border: "border-green-200" },
  "3. TRANSPARÊNCIA": { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  "4. DADOS E TECNOLOGIA": { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
};

const STATUS_COLORS: Record<string, string> = {
  pendente: "bg-gray-200 text-gray-700",
  em_andamento: "bg-yellow-200 text-yellow-800",
  concluido: "bg-green-200 text-green-800",
};

const STATUS_LABELS: Record<string, string> = {
  pendente: "Pendente",
  em_andamento: "Em Andamento",
  concluido: "Concluído",
};

export default function Dashboard() {
  const [, setLocation] = useLocation();
  const params = new URLSearchParams(window.location.search);
  const sector = params.get("sector") || "";
  const coordinator = params.get("coordenador") || "";
  const [selectedRequirement, setSelectedRequirement] = useState<any>(null);

  const { data: requirements, isLoading } = (coordinator
    ? trpc.requirements.getByCoordinator.useQuery({ coordinator }, { enabled: !!coordinator })
    : trpc.requirements.getBySector.useQuery({ sector }, { enabled: !!sector })
  );

  // Agrupar por eixo
  const groupedByEixo = useMemo(() => {
    if (!requirements) return {};
    
    return requirements.reduce((acc, req) => {
      const eixo = req.eixo;
      if (!acc[eixo]) {
        acc[eixo] = [];
      }
      acc[eixo].push(req);
      return acc;
    }, {} as Record<string, typeof requirements>);
  }, [requirements]);

  const handleBack = () => {
    setLocation("/");
  };

  // Verificar se o prazo está próximo (dentro de 30 dias)
  const isDeadlineNear = (deadline: string | null) => {
    if (!deadline) return false;
    const deadlineDate = new Date(deadline);
    const today = new Date();
    const diffTime = deadlineDate.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 30 && diffDays >= 0;
  };

  if (!sector && !coordinator) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-600">Nenhum filtro selecionado. Retorne à página inicial.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{APP_TITLE}</h1>
              <p className="text-sm text-gray-600 mt-1">
                {sector && (
                  <>Setor: <span className="font-semibold">{sector}</span></>
                )}
                {coordinator && (
                  <>Coordenador: <span className="font-semibold">{coordinator}</span></>
                )}
              </p>
            </div>
            <Button onClick={handleBack} variant="outline">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Voltar
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto py-8">
        {/* Barra de Progresso */}
        {sector && !coordinator && (
          <div className="mb-8">
            <ProgressBar sector={sector} />
          </div>
        )}
        
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
          </div>
        ) : (
          <div className="space-y-8">
            {Object.entries(groupedByEixo).map(([eixo, reqs]) => {
              const colors = EIXO_COLORS[eixo] || EIXO_COLORS["1. GOVERNANÇA"];
              
              return (
                <div key={eixo}>
                  <h2 className={`text-xl font-bold mb-4 ${colors.text}`}>
                    {eixo}
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {reqs.map((req) => {
                      const status = req.update?.status || "pendente";
                      const deadlineNear = isDeadlineNear(req.deadline);
                      
                      return (
                        <Card
                          key={req.id}
                          className={`${colors.bg} ${colors.border} border-2 hover:shadow-lg transition-shadow cursor-pointer`}
                          onClick={() => setSelectedRequirement(req)}
                        >
                          <CardHeader>
                            <div className="flex items-start justify-between gap-2">
                              <CardTitle className="text-base leading-tight">
                                {req.requisito}
                              </CardTitle>
                              <Badge className={STATUS_COLORS[status]}>
                                {STATUS_LABELS[status]}
                              </Badge>
                            </div>
                          </CardHeader>
                          
                          <CardContent className="space-y-3">
                            <div className="text-sm text-gray-700">
                              <p className="font-medium">Meta:</p>
                              <p className="text-gray-600">{req.item}</p>
                            </div>
                            
                            {req.deadline && (
                              <div className="flex items-center gap-2 text-sm">
                                <Calendar className="h-4 w-4" />
                                <span className={deadlineNear ? "text-red-600 font-semibold" : "text-gray-600"}>
                                  Prazo: {new Date(req.deadline).toLocaleDateString("pt-BR")}
                                </span>
                              </div>
                            )}
                            
                            <div className="flex items-center gap-2 text-sm">
                              <Target className="h-4 w-4" />
                              <span className="font-semibold text-gray-700">
                                {req.pontosAplicaveis2026} pontos
                              </span>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Modal de Edição */}
      <RequirementModal
        requirement={selectedRequirement}
        open={!!selectedRequirement}
        onClose={() => setSelectedRequirement(null)}
        onSuccess={() => {
          // Refresh data after update
        }}
      />
    </div>
  );
}
