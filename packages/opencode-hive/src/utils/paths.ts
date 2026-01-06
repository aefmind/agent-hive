import * as path from "path";

export const TASKS_DIR = "tasks";
export const CONTEXT_DIR = "context";
export const DECISIONS_DIR = "decisions";
export const REFERENCES_DIR = "references";
export const ARTIFACTS_DIR = "artifacts";

export const PROBLEM_FILE = "problem.md";
export const PLAN_FILE = "plan.json";
export const FEATURE_FILE = "feature.json";

/** @deprecated Use TASKS_DIR instead */
export const EXECUTION_DIR = "execution";
/** @deprecated Requirements merged into context/problem.md */
export const REQUIREMENTS_DIR = "requirements";

export function getHivePath(directory: string): string {
  return path.join(directory, ".hive");
}

export function getFeaturePath(directory: string, featureName: string): string {
  return path.join(getHivePath(directory), "features", featureName);
}

export function getTasksPath(featurePath: string): string {
  return path.join(featurePath, TASKS_DIR);
}

export function getTaskPath(featurePath: string, taskFolder: string): string {
  return path.join(getTasksPath(featurePath), taskFolder);
}

export function getContextPath(featurePath: string): string {
  return path.join(featurePath, CONTEXT_DIR);
}

export function getDecisionsPath(featurePath: string): string {
  return path.join(getContextPath(featurePath), DECISIONS_DIR);
}

export function getReferencesPath(featurePath: string): string {
  return path.join(getContextPath(featurePath), REFERENCES_DIR);
}

export function getArtifactsPath(featurePath: string): string {
  return path.join(getContextPath(featurePath), ARTIFACTS_DIR);
}

export function getProblemPath(featurePath: string): string {
  return path.join(getContextPath(featurePath), PROBLEM_FILE);
}

export function getPlanPath(featurePath: string): string {
  return path.join(featurePath, PLAN_FILE);
}

export function getActiveFeaturePath(directory: string): string {
  return path.join(getHivePath(directory), "active-feature.txt");
}

export function getDecisionFilename(title: string): string {
  const timestamp = new Date().toISOString().split("T")[0];
  const slug = title.toLowerCase().replace(/\s+/g, "-");
  return `${timestamp}-${slug}.md`;
}

/** @deprecated Use getTasksPath instead */
export function getExecutionPath(featurePath: string): string {
  return path.join(featurePath, EXECUTION_DIR);
}

/** @deprecated Use getTaskPath instead */
export function getStepPath(featurePath: string, stepFolder: string): string {
  return path.join(getExecutionPath(featurePath), stepFolder);
}

/** @deprecated Requirements merged into context/problem.md */
export function getRequirementsPath(featurePath: string): string {
  return path.join(featurePath, REQUIREMENTS_DIR);
}
