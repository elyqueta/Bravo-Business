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
    let text = String(value).trim();
    if (text === "") return null;

    text = text.replace(/\s/g, "");

    const hasComma = text.includes(",");
    const hasDot = text.includes(".");

    if (hasComma && hasDot) {
      text = text.replace(/\./g, "").replace(",", ".");
    } else if (hasComma && !hasDot) {
      text = text.replace(",", ".");
    } else if (!hasComma && hasDot) {
      const dotCount = (text.match(/\./g) || []).length;
      if (dotCount > 1) {
        text = text.replace(/\./g, "");
      }
    }

    const num = Number(text);
    return Number.isNaN(num) ? null : num;
  }
  private parseNumber(value: string): number | null {
    return this.parse(value);
  }
}
