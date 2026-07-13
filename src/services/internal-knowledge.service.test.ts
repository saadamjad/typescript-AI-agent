import { describe, expect, it } from "vitest";
import { getInternalResponse } from "@/services/internal-knowledge.service";

describe("getInternalResponse", () => {
  it("answers how many days are in a week", () => {
    expect(getInternalResponse("How many days are there in a week?")).toBe(
      "There are 7 days in a week.",
    );
  });

  it("answers how many months are in a year", () => {
    expect(getInternalResponse("How many months are there in a year?")).toBe(
      "There are 12 months in a year.",
    );
  });

  it("answers what day it is today", () => {
    const expectedWeekday = new Date().toLocaleDateString("en-US", { weekday: "long" });
    expect(getInternalResponse("What day is it today?")).toBe(
      `Today is ${expectedWeekday}.`,
    );
  });

  it("answers what today's date is", () => {
    const expectedDate = new Date().toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
    expect(getInternalResponse("What is today's date?")).toBe(
      `Today's date is ${expectedDate}.`,
    );
  });

  it("answers how old are you", () => {
    expect(getInternalResponse("How old are you?")).toContain("virtual assistant");
  });

  it("performs basic addition", () => {
    expect(getInternalResponse("What is 2 + 2?")).toBe("The answer is 4.");
  });

  it("performs basic subtraction, multiplication, and division", () => {
    expect(getInternalResponse("10 - 3")).toBe("The answer is 7.");
    expect(getInternalResponse("6 x 7")).toBe("The answer is 42.");
    expect(getInternalResponse("20 / 4")).toBe("The answer is 5.");
  });

  it("handles division by zero safely", () => {
    expect(getInternalResponse("5 / 0")).toBe("I can't divide by zero.");
  });

  it("returns null for unsupported questions", () => {
    expect(getInternalResponse("What is the capital of France?")).toBeNull();
  });
});
