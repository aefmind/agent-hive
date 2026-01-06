import * as path from 'path';
import { tool, type Plugin } from "@opencode-ai/plugin";
import { WorktreeService } from "./services/worktreeService.js";
import { FeatureService } from "./services/featureService.js";
import { PlanService } from "./services/planService.js";
import { TaskService } from "./services/taskService.js";

const HIVE_SYSTEM_PROMPT = `
## Hive - Feature Development System

Plan-first development: Write plan → User reviews → Approve → Execute tasks

### Tools (13 total)

| Domain | Tools |
|--------|-------|
| Feature | hive_feature_create, hive_feature_list, hive_feature_switch, hive_feature_complete |
| Plan | hive_plan_write, hive_plan_read, hive_plan_approve |
| Task | hive_tasks_sync, hive_task_create, hive_task_update |
| Exec | hive_exec_start, hive_exec_complete, hive_exec_abort |

### Workflow

1. \`hive_feature_create(name)\` - Create feature
2. \`hive_plan_write(content)\` - Write plan.md
3. User adds comments in VSCode → \`hive_plan_read\` to see them
4. Revise plan → User approves
5. \`hive_tasks_sync()\` - Generate tasks from plan
6. \`hive_exec_start(task)\` → work → \`hive_exec_complete(task, summary)\`

### Plan Format

\`\`\`markdown
# Feature Name

## Overview
What we're building and why.

## Tasks

### 1. Task Name
Description of what to do.

### 2. Another Task
Description.
\`\`\`

\`hive_tasks_sync\` parses \`### N. Task Name\` headers.
`;

type ToolContext = {
  sessionID: string;
  messageID: string;
  agent: string;
  abort: AbortSignal;
};

const plugin: Plugin = async (ctx) => {
  const { directory } = ctx;

  const featureService = new FeatureService(directory);
  const planService = new PlanService(directory);
  const taskService = new TaskService(directory);
  const worktreeService = new WorktreeService({
    baseDir: directory,
    hiveDir: path.join(directory, '.hive'),
  });

  const captureSession = (toolContext: unknown) => {
    const activeFeature = featureService.getActive();
    if (!activeFeature) return;
    
    const ctx = toolContext as ToolContext;
    if (ctx?.sessionID) {
      const currentSession = featureService.getSession(activeFeature);
      if (currentSession !== ctx.sessionID) {
        featureService.setSession(activeFeature, ctx.sessionID);
      }
    }
  };

  return {
    "experimental.chat.system.transform": async (_input: unknown, output: { system: string[] }) => {
      output.system.push(HIVE_SYSTEM_PROMPT);

      const activeFeature = featureService.getActive();
      if (activeFeature) {
        const info = featureService.getInfo(activeFeature);
        if (info) {
          let statusHint = `\n### Current Hive Status\n`;
          statusHint += `**Active Feature**: ${info.name} (${info.status})\n`;
          statusHint += `**Progress**: ${info.tasks.filter(t => t.status === 'done').length}/${info.tasks.length} tasks\n`;

          if (info.commentCount > 0) {
            statusHint += `**Comments**: ${info.commentCount} unresolved - address with hive_plan_read\n`;
          }

          output.system.push(statusHint);
        }
      }
    },

    tool: {
      hive_feature_create: tool({
        description: 'Create a new feature and set it as active',
        args: {
          name: tool.schema.string().describe('Feature name'),
          ticket: tool.schema.string().optional().describe('Ticket reference'),
        },
        async execute({ name, ticket }) {
          const feature = featureService.create(name, ticket);
          return `Feature "${name}" created. Status: ${feature.status}. Write a plan with hive_plan_write.`;
        },
      }),

      hive_feature_list: tool({
        description: 'List all features',
        args: {},
        async execute() {
          const features = featureService.list();
          const active = featureService.getActive();
          if (features.length === 0) return "No features found.";
          const list = features.map(f => {
            const info = featureService.getInfo(f);
            return `${f === active ? '* ' : '  '}${f} (${info?.status || 'unknown'})`;
          });
          return list.join('\n');
        },
      }),

      hive_feature_switch: tool({
        description: 'Switch to a different feature',
        args: { name: tool.schema.string().describe('Feature name') },
        async execute({ name }) {
          featureService.setActive(name);
          return `Switched to feature "${name}"`;
        },
      }),

      hive_feature_complete: tool({
        description: 'Mark feature as completed (irreversible)',
        args: { name: tool.schema.string().optional().describe('Feature name (defaults to active)') },
        async execute({ name }) {
          const feature = name || featureService.getActive();
          if (!feature) return "Error: No active feature";
          featureService.complete(feature);
          return `Feature "${feature}" marked as completed`;
        },
      }),

      hive_plan_write: tool({
        description: 'Write plan.md (clears existing comments)',
        args: { content: tool.schema.string().describe('Plan markdown content') },
        async execute({ content }, toolContext) {
          captureSession(toolContext);
          const feature = featureService.getActive();
          if (!feature) return "Error: No active feature";
          const planPath = planService.write(feature, content);
          return `Plan written to ${planPath}. Comments cleared for fresh review.`;
        },
      }),

      hive_plan_read: tool({
        description: 'Read plan.md and user comments',
        args: {},
        async execute(_args, toolContext) {
          captureSession(toolContext);
          const feature = featureService.getActive();
          if (!feature) return "Error: No active feature";
          const result = planService.read(feature);
          if (!result) return "Error: No plan.md found";
          return JSON.stringify(result, null, 2);
        },
      }),

      hive_plan_approve: tool({
        description: 'Approve plan for execution',
        args: {},
        async execute(_args, toolContext) {
          captureSession(toolContext);
          const feature = featureService.getActive();
          if (!feature) return "Error: No active feature";
          const comments = planService.getComments(feature);
          if (comments.length > 0) {
            return `Error: Cannot approve - ${comments.length} unresolved comment(s). Address them first.`;
          }
          planService.approve(feature);
          return "Plan approved. Run hive_tasks_sync to generate tasks.";
        },
      }),

      hive_tasks_sync: tool({
        description: 'Generate tasks from approved plan',
        args: {},
        async execute() {
          const feature = featureService.getActive();
          if (!feature) return "Error: No active feature";
          const featureData = featureService.get(feature);
          if (!featureData || featureData.status === 'planning') {
            return "Error: Plan must be approved first";
          }
          const result = taskService.sync(feature);
          if (featureData.status === 'approved') {
            featureService.updateStatus(feature, 'executing');
          }
          return `Tasks synced: ${result.created.length} created, ${result.removed.length} removed, ${result.kept.length} kept`;
        },
      }),

      hive_task_create: tool({
        description: 'Create manual task (not from plan)',
        args: {
          name: tool.schema.string().describe('Task name'),
          order: tool.schema.number().optional().describe('Task order'),
        },
        async execute({ name, order }) {
          const feature = featureService.getActive();
          if (!feature) return "Error: No active feature";
          const folder = taskService.create(feature, name, order);
          return `Manual task created: ${folder}`;
        },
      }),

      hive_task_update: tool({
        description: 'Update task status or summary',
        args: {
          task: tool.schema.string().describe('Task folder name'),
          status: tool.schema.string().optional().describe('New status: pending, in_progress, done, cancelled'),
          summary: tool.schema.string().optional().describe('Summary of work'),
        },
        async execute({ task, status, summary }) {
          const feature = featureService.getActive();
          if (!feature) return "Error: No active feature";
          const updated = taskService.update(feature, task, {
            status: status as any,
            summary,
          });
          return `Task "${task}" updated: status=${updated.status}`;
        },
      }),

      hive_exec_start: tool({
        description: 'Create worktree and begin work on task',
        args: { task: tool.schema.string().describe('Task folder name') },
        async execute({ task }) {
          const feature = featureService.getActive();
          if (!feature) return "Error: No active feature";

          const taskInfo = taskService.get(feature, task);
          if (!taskInfo) return `Error: Task "${task}" not found`;
          if (taskInfo.status === 'done') return "Error: Task already completed";

          const worktree = await worktreeService.create(feature, task);
          taskService.update(feature, task, { status: 'in_progress' });

          return `Worktree created at ${worktree.path}\nBranch: ${worktree.branch}`;
        },
      }),

      hive_exec_complete: tool({
        description: 'Complete task: apply changes, write report',
        args: {
          task: tool.schema.string().describe('Task folder name'),
          summary: tool.schema.string().describe('Summary of what was done'),
        },
        async execute({ task, summary }) {
          const feature = featureService.getActive();
          if (!feature) return "Error: No active feature";

          const taskInfo = taskService.get(feature, task);
          if (!taskInfo) return `Error: Task "${task}" not found`;
          if (taskInfo.status !== 'in_progress') return "Error: Task not in progress";

          const diff = await worktreeService.getDiff(feature, task);
          if (diff?.hasDiff) {
            await worktreeService.applyDiff(feature, task);
          }

          const report = `# ${task}\n\n## Summary\n\n${summary}\n`;
          taskService.writeReport(feature, task, report);
          taskService.update(feature, task, { status: 'done', summary });

          await worktreeService.remove(feature, task);

          return `Task "${task}" completed. Changes applied.`;
        },
      }),

      hive_exec_abort: tool({
        description: 'Abort task: discard changes, reset status',
        args: { task: tool.schema.string().describe('Task folder name') },
        async execute({ task }) {
          const feature = featureService.getActive();
          if (!feature) return "Error: No active feature";

          await worktreeService.remove(feature, task);
          taskService.update(feature, task, { status: 'pending' });

          return `Task "${task}" aborted. Status reset to pending.`;
        },
      }),
    },

    command: {
      hive: {
        description: "Create a new feature: /hive <feature-name>",
        async run(args: string) {
          const name = args.trim();
          if (!name) return "Usage: /hive <feature-name>";
          return `Create feature "${name}" using hive_feature_create tool.`;
        },
      },
    },
  };
};

export default plugin;
