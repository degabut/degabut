import { GetAccessTokenQuery } from "./get-access-token";
import { GetGuildMemberQuery } from "./get-guild-member";
import { GetUserQuery } from "./get-user";

export * from "./get-access-token";
export * from "./get-guild-member";
export * from "./get-user";

export const Queries = [GetAccessTokenQuery, GetGuildMemberQuery, GetUserQuery];
