import { Injectable } from '@angular/core';
import { UserList, UserDetails, UserEdit } from '../../models/interfaces';

@Injectable({ providedIn: 'root' })
export class UserMapper {
  toList(user: UserDetails): UserList {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
      active: user.active,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    };
  }

  toListArray(users: UserDetails[]): UserList[] {
    return users.map((user) => this.toList(user));
  }

  toEdit(user: UserDetails): UserEdit {
    return {
      id: user.id,
      email: user.email,
      userName: user.userName,
      role: user.role,
      active: user.active,
    };
  }
}
