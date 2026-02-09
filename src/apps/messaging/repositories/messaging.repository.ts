import { Injectable } from "@nestjs/common";

@Injectable()
export class MessagingRepository {
  private static readonly LIMIT = 10;
  private readonly users: Map<string, Set<string>> = new Map();
  private readonly groups: Map<string, Set<string>> = new Map();

  addToGroup(userId: string, token: string, groupId: string) {
    if (!this.users.has(userId)) {
      this.users.set(userId, new Set());
    }

    const userTokens = this.users.get(userId)!;
    if (userTokens.size >= MessagingRepository.LIMIT) {
      return;
    }

    userTokens.add(token);
    this.users.set(userId, userTokens);

    if (!this.groups.has(groupId)) {
      this.groups.set(groupId, new Set());
    }

    const groupTokens = this.groups.get(groupId)!;
    groupTokens.add(token);

    this.groups.set(groupId, groupTokens);
  }

  removeFromGroup(userId: string, token: string, groupId: string) {
    const userTokens = this.users.get(userId);
    if (userTokens) {
      userTokens.delete(token);
      this.users.set(userId, userTokens);
    }

    const group = this.groups.get(groupId);
    if (!group) return;

    group.delete(token);

    this.groups.set(groupId, group);
  }

  getGroup(groupId: string): Set<string> | null {
    return this.groups.get(groupId) || null;
  }

  deleteGroup(groupId: string) {
    this.groups.delete(groupId);
  }
}
