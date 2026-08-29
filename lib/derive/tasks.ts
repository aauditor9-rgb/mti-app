import { todayLondon } from "./age";

export type TaskStatus = "Completed" | "Overdue" | "Open";

export function computeTaskStatus(dueDate: string, completedAt: Date | null, today: string = todayLondon()): TaskStatus {
  if (completedAt) return "Completed";
  return dueDate < today ? "Overdue" : "Open";
}
