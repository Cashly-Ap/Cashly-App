import { ChangeDetectionStrategy, Component, effect, inject, input, signal } from '@angular/core';
import { AvatarModule } from 'primeng/avatar';
import { UserPhotoService } from '@features/platform/auth/services/api/user-photo.service';
@Component({
  selector: 'app-user-avatar',
  standalone: true,
  imports: [AvatarModule],
  templateUrl: './user-avatar.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class UserAvatarComponent {
  private readonly photos = inject(UserPhotoService);
  readonly userId = input<string>();
  readonly photoPath = input<string | null>();
  readonly name = input('Usuario');
  readonly size = input<'normal' | 'large' | 'xlarge'>('normal');
  readonly url = signal<string | null>(null);
  constructor() {
    effect((onCleanup) => {
      const path = this.photoPath();
      const id = this.userId();
      this.url.set(null);
      if (!path) return;
      let url: string | null = null;
      const subscription = this.photos.get(id).subscribe({
        next: (blob) => {
          url = URL.createObjectURL(blob);
          this.url.set(url);
        },
        error: () => this.url.set(null),
      });
      onCleanup(() => {
        subscription.unsubscribe();
        if (url) URL.revokeObjectURL(url);
      });
    });
  }
}
