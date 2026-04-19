import { motion } from "framer-motion";

export function StatCard({ title, value, icon: Icon, subtitle, breakdown }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="rounded-xl border bg-card p-5 stat-card-shadow transition-shadow duration-200"
    >
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm text-muted-foreground">{title}</p>
          <p className="mt-1 font-display text-3xl font-bold tracking-tight text-foreground">
            {value}
          </p>
          {subtitle && (
            <p className="mt-0.5 text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>

        <div className="rounded-lg bg-primary/10 p-2.5">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>

      {breakdown && (
        <div className="mt-4 flex flex-wrap gap-3">
          {breakdown.map((item) => (
            <div key={item.label} className="flex items-center gap-1.5">
              <span className={`h-2 w-2 rounded-full ${item.colorClass}`} />
              <span className="text-xs text-muted-foreground">
                {item.value} {item.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}