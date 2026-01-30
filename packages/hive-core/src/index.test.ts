import { describe, expect, it } from "bun:test";
import * as os from "os";
import * as path from "path";
import { getHivePath, normalizePath } from "./utils/paths";
import { detectContext } from "./utils/detection";

describe("hive-core", () => {
  it("exports path helpers", () => {
    const tmpProject = path.join(os.tmpdir(), "project");
    expect(getHivePath(tmpProject)).toBe(normalizePath(path.join(tmpProject, ".hive")));
  });

  it("detects worktree paths on Windows", () => {
    const result = detectContext("C:\\repo\\.hive\\.worktrees\\feature-x\\01-task");

    expect(result.isWorktree).toBe(true);
    expect(result.feature).toBe("feature-x");
    expect(result.task).toBe("01-task");
    expect(result.projectRoot).toBe("C:/repo");
  });
});
