import { Pipe, PipeTransform } from "@angular/core";
import { DateUtils } from "@shared/utils/date.utils";

@Pipe({
  name: "appDateFormat",
  standalone: true,
})
export class DateFormatPipe implements PipeTransform {
  transform(value: string | Date | null | undefined): string {
    return DateUtils.toDisplayDate(value);
  }
}
