import { PageHeaderComponent } from '@shared/components/ui/page-header/page-header.component';
import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-form-header',
  standalone: true,
  imports: [PageHeaderComponent],
  templateUrl: './form-header.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'block' },
})
export class FormHeaderComponent {
  title = input.required<string>();
  subtitle = input<string>('');
  icon = input<string>();
}
