import { Pipe, PipeTransform } from "@angular/core";
import { MoneyService } from "../../core/money.service";

@Pipe({
  name: "money",
  standalone: true,
})
export class MoneyPipe implements PipeTransform {
  constructor(private readonly moneyService: MoneyService) {}
  transform(value: number | string | null | undefined): string {
    return this.moneyService.format(value);
  }
}
