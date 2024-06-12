import { afterEach, describe, expect, test } from "vitest";
import { cleanup, render, screen } from "@testing-library/react";
import FormButton from "./form-button";

describe("Form Button", () => {
  afterEach(cleanup);

  test("Enabled when not submitting", () => {
    render(<FormButton isSubmitting={false} label="Login" />);
    const btn = screen.getByRole("button");
    expect(btn).toBeDefined();
    expect(btn.hasAttribute("disabled")).toBeFalsy();
  });

  test("Disabled when submitting", () => {
    render(<FormButton isSubmitting={true} label="Register" />);
    const btn = screen.getByRole("button");
    expect(btn).toBeDefined();
    expect(btn.hasAttribute("disabled")).toBeTruthy();
  });
});
