import { UserList, UserDetails, UserEdit } from '@features/users/models/interfaces';

export class UserMapper {
  static toList(user: UserDetails): UserList {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
      active: user.active,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
      modulePermissions: user.modulePermissions ?? [],
    };
  }

  static toListArray(users: UserDetails[]): UserList[] {
    return users.map((user) => UserMapper.toList(user));
  }

  static toEdit(user: UserDetails): UserEdit {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
      active: user.active,
    };
  }
}
