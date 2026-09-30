import type { Task } from "@/logic/taskLogic";
export function isTask(value: unknown): value is Task {
  if (typeof value !== "object" || value === null || Array.isArray(value)) {
    return false;
  }

  return (
    "id" in value &&
    typeof value.id === "string" &&
    "name" in value &&
    typeof value.name === "string" &&
    "est" in value &&
    typeof value.est === "number" &&
    Number.isFinite(value.est) &&
    "act" in value &&
    typeof value.act === "number" &&
    Number.isFinite(value.act) &&
    "isDone" in value &&
    typeof value.isDone === "boolean" &&
    (!("userId" in value) || typeof value.userId === "string")
  );
}

export function isTaskArray(value: unknown): value is Task[] {
  return Array.isArray(value) && value.every(isTask);
}