import { describe, it, expect, beforeEach } from "vitest";
import { CurrencyPipe } from "./currency.pipe";

describe("CurrencyPipe", () => {
  let pipe: CurrencyPipe;

  beforeEach(() => {
    pipe = new CurrencyPipe();
  });

  it("should create an instance", () => {
    expect(pipe).toBeTruthy();
  });

  describe("transform", () => {
    it("should format positive numbers correctly", () => {
      expect(pipe.transform(1234.56)).toBe("1.234,56$");
    });

    it("should format zero correctly", () => {
      expect(pipe.transform(0)).toBe("0,00$");
    });

    it("should format negative numbers correctly", () => {
      expect(pipe.transform(-1234.56)).toBe("-1.234,56$");
    });

    it("should handle null value", () => {
      expect(pipe.transform(null)).toBe("0,00$");
    });

    it("should handle undefined value", () => {
      expect(pipe.transform(undefined)).toBe("0,00$");
    });

    it("should respect custom decimals parameter", () => {
      expect(pipe.transform(1234.5678, 4)).toBe("1.234,5678$");
    });

    it("should format large numbers with thousand separators", () => {
      expect(pipe.transform(1234567.89)).toBe("1.234.567,89$");
    });

    it("should format small decimal numbers", () => {
      expect(pipe.transform(0.99)).toBe("0,99$");
    });

    it("should format integer as decimal", () => {
      expect(pipe.transform(100)).toBe("100,00$");
    });

    it("should handle single decimal place input", () => {
      expect(pipe.transform(10.5)).toBe("10,50$");
    });
  });
});
