import { trpc } from "@/lib/trpc";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Trophy, Target } from "lucide-react";

interface ProgressBarProps {
  sector: string;
}

export default function ProgressBar({ sector }: ProgressBarProps) {
  const { data: progress, isLoading } = trpc.requirements.getProgress.useQuery(
    { sector },
    { enabled: !!sector }
  );

  if (isLoading || !progress) {
    return null;
  }

  const { totalPoints, completedPoints, percentage } = progress;

  return (
    <Card className="bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
      <CardContent className="pt-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Trophy className="h-6 w-6" />
            <h3 className="text-lg font-bold">Progresso do Setor</h3>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold">{percentage}%</div>
            <div className="text-sm opacity-90">Concluído</div>
          </div>
        </div>

        <Progress value={percentage} className="h-3 mb-3 bg-blue-300" />

        <div className="flex items-center justify-between text-sm opacity-90 gap-4">
          <div className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span>{completedPoints} de {totalPoints} pontos</span>
          </div>
          <span>{totalPoints - completedPoints} pontos restantes</span>
        </div>
      </CardContent>
    </Card>
  );
}
