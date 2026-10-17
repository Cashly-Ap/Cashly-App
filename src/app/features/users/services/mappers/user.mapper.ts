import { UserList } from '@features/users/models/interfaces/user-list.interface';
import { UserDetails } from '@features/users/models/interfaces/user-details.interface';
import { UserEdit } from '@features/users/models/interfaces/user-edit.interface';

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
      deletable: true,
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
