import * as fs from "fs/promises";
import * as path from "path";
import { getFeaturePath } from "../utils/paths.js";
import { ensureDir, readJson, writeJson } from "../utils/json.js";
import { randomUUID } from "crypto";

export interface Citation {
  type: "file" | "rule";
  path: string;
  lines?: string;
}

export interface CommentResponse {
  id: string;
  author: "user" | "agent";
  timestamp: string;
  body: string;
  action?: "addressed" | "rejected" | "deferred" | "step-removed" | "step-modified";
}

export interface Comment {
  id: string;
  version: number;
  section: string;
  stepId?: string;
  author: "user" | "agent";
  timestamp: string;
  body: string;
  citations: Citation[];
  resolved: boolean;
  responses: CommentResponse[];
}

interface CommentsFile {
  comments: Comment[];
}

const CITE_REGEX = /@cite:([^:\s]+)(?::(\d+-\d+))?/g;

export class CommentService {
  constructor(private directory: string) {}

  private getCommentsPath(featureName: string): string {
    return path.join(getFeaturePath(this.directory, featureName), "plan-comments.json");
  }

  parseCitations(body: string): Citation[] {
    const citations: Citation[] = [];
    let match;
    const regex = new RegExp(CITE_REGEX.source, "g");
    
    while ((match = regex.exec(body)) !== null) {
      citations.push({
        type: match[1].startsWith(".agent/rules") ? "rule" : "file",
        path: match[1],
        lines: match[2],
      });
    }
    
    return citations;
  }

  async getComments(featureName: string): Promise<Comment[]> {
    const commentsPath = this.getCommentsPath(featureName);
    const data = await readJson<CommentsFile>(commentsPath);
    return data?.comments ?? [];
  }

  async getUnresolvedComments(featureName: string): Promise<Comment[]> {
    const comments = await this.getComments(featureName);
    return comments.filter((c) => !c.resolved);
  }

  async addComment(
    featureName: string,
    comment: Omit<Comment, "id" | "timestamp" | "citations" | "responses" | "resolved">
  ): Promise<Comment> {
    const commentsPath = this.getCommentsPath(featureName);
    const data = (await readJson<CommentsFile>(commentsPath)) ?? { comments: [] };

    const newComment: Comment = {
      ...comment,
      id: randomUUID().slice(0, 8),
      timestamp: new Date().toISOString(),
      citations: this.parseCitations(comment.body),
      resolved: false,
      responses: [],
    };

    data.comments.push(newComment);
    await ensureDir(path.dirname(commentsPath));
    await writeJson(commentsPath, data);

    return newComment;
  }

  async addResponse(
    featureName: string,
    commentId: string,
    response: Omit<CommentResponse, "id" | "timestamp">
  ): Promise<void> {
    const commentsPath = this.getCommentsPath(featureName);
    const data = await readJson<CommentsFile>(commentsPath);
    
    if (!data) {
      throw new Error(`No comments file found for feature "${featureName}"`);
    }

    const comment = data.comments.find((c) => c.id === commentId);
    if (!comment) {
      throw new Error(`Comment "${commentId}" not found`);
    }

    const newResponse: CommentResponse = {
      ...response,
      id: randomUUID().slice(0, 8),
      timestamp: new Date().toISOString(),
    };

    comment.responses.push(newResponse);

    if (response.action === "addressed") {
      comment.resolved = true;
    }

    await writeJson(commentsPath, data);
  }

  async resolveComment(featureName: string, commentId: string): Promise<void> {
    const commentsPath = this.getCommentsPath(featureName);
    const data = await readJson<CommentsFile>(commentsPath);
    
    if (!data) {
      throw new Error(`No comments file found for feature "${featureName}"`);
    }

    const comment = data.comments.find((c) => c.id === commentId);
    if (!comment) {
      throw new Error(`Comment "${commentId}" not found`);
    }

    comment.resolved = true;
    await writeJson(commentsPath, data);
  }

  async unresolveComment(featureName: string, commentId: string): Promise<void> {
    const commentsPath = this.getCommentsPath(featureName);
    const data = await readJson<CommentsFile>(commentsPath);
    
    if (!data) {
      throw new Error(`No comments file found for feature "${featureName}"`);
    }

    const comment = data.comments.find((c) => c.id === commentId);
    if (!comment) {
      throw new Error(`Comment "${commentId}" not found`);
    }

    comment.resolved = false;
    await writeJson(commentsPath, data);
  }
}
