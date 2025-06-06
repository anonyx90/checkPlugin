import { checks } from "./checks/allChecks";
import { CheckResult } from "./types";

// Run all checks, then group results by their category
export async function runAllChecks(): Promise<Record<string, CheckResult[]>> {
  const results = await Promise.all(checks.map((check) => check.run()));
  const grouped: Record<string, CheckResult[]> = {};

  for (let i = 0; i < checks.length; i++) {
    const category = checks[i].category ?? "Uncategorized"; 
    if (!grouped[category]) grouped[category] = [];
    grouped[category].push(results[i]);
  }

  return grouped;
}
