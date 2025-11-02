import { LucideIcon } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

interface MetricCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  valueColor?: string;
}

export const MetricCard = ({ title, value, icon: Icon, description, valueColor = "text-primary" }: MetricCardProps) => {
  return (
    <Card className="glass-card border-primary/10 hover:border-primary/30 transition-all duration-300">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-primary" />
      </CardHeader>
      <CardContent>
        <div className={`text-2xl font-bold ${valueColor}`}>{value}</div>
        {description && (
          <CardDescription className="text-xs mt-1">{description}</CardDescription>
        )}
      </CardContent>
    </Card>
  );
};
