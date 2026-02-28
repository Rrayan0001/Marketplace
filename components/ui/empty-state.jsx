import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export default function EmptyState({
  icon,
  title,
  description,
  actionHref,
  actionLabel,
  secondaryAction,
  className = "",
}) {
  return (
    <Card className={`border-dashed border-2 border-zinc-200 ${className}`}>
      <CardContent className="relative flex flex-col items-center justify-center p-12 md:p-16 text-center overflow-hidden">
        <div className="absolute -top-12 h-40 w-40 rounded-full bg-primary/10 blur-2xl" />
        <div className="relative z-10 mb-6 flex h-16 w-16 items-center justify-center rounded-2xl border border-primary/20 bg-white text-primary shadow-sm">
          {icon}
        </div>
        <h3 className="relative z-10 text-xl font-bold text-zinc-900 mb-2">{title}</h3>
        <p className="relative z-10 text-zinc-500 max-w-md mb-6">{description}</p>
        <div className="relative z-10 flex flex-wrap items-center justify-center gap-3">
          {actionHref && actionLabel ? (
            <Button asChild>
              <Link href={actionHref}>{actionLabel}</Link>
            </Button>
          ) : null}
          {secondaryAction || null}
        </div>
      </CardContent>
    </Card>
  );
}
