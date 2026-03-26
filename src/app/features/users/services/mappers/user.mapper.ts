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
      createdAt: user.createdAt,
    };
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
