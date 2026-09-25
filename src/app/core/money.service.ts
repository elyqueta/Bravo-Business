import { Injectable } from "@angular/core";

@Injectable({ providedIn: "root" })
export class MoneyService {
  format(value: number | string | null | undefined): string {
    if (value === null || value === undefined || value === "") {
      return "0,00";
    }
    const num = typeof value === "number" ? value : this.parseNumber(value);
    if (num === null) return "0,00";
    return num.toLocaleString("pt-AO", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  }
  parse(value: string | number | null | undefined): number | null {
    if (value === null || value === undefined || value === "") {
      return null;
    }
    const text = String(value).trim();
    if (text === "") return null;
    const normalized = text.replace(/\./g, "").replace(",", ".");
    const num = Number(normalized);
    return Number.isNaN(num) ? null : num;
  }
  private parseNumber(value: string): number | null {
    return this.parse(value);
  }
}
