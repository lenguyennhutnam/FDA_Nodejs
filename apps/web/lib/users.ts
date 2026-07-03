import { UserService } from './apis/users';
export type { User, CreateUserInput, UpdateUserInput, ChangePasswordInput } from './apis/users';

export async function fetchUsers(token: string) {
  return UserService.fetchUsers(token);
}

export async function createUser(input: any, token: string) {
  return UserService.createUser(input, token);
}

export async function updateUser(id: any, input: any, token: string) {
  return UserService.updateUser(id, input, token);
}

export async function deleteUser(id: any, token: string) {
  return UserService.deleteUser(id, token);
}

export async function changePasswordApi(input: any, token: string) {
  return UserService.changePasswordApi(input, token);
}
