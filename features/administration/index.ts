/** Administration bounded context (C9) — public API barrel. */
export { UserService, userService, USER_EVENTS } from "./services/user.service";
export { USER_STATUS } from "./types/user";
export type { UserEntity, UserStatus, UserFilter } from "./types/user";
export {
  assignRolesSchema,
  userFilterSchema,
  roleCodeSchema,
} from "./schemas/user.schema";
export type { AssignRolesInput, UserFilterInput } from "./schemas/user.schema";
export { UsersTable } from "./components/UsersTable";
export { RolesPanel } from "./components/RolesPanel";
