import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ChatInput } from "@/components/chat/ChatInput";

describe("ChatInput", () => {
  it("renders a textbox and a send button", () => {
    render(<ChatInput isLoading={false} onSend={vi.fn()} />);
    expect(
      screen.getByRole("textbox", { name: /type your message/i }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /send/i })).toBeInTheDocument();
  });

  it("disables the input and button while loading", () => {
    render(<ChatInput isLoading={true} onSend={vi.fn()} />);
    expect(screen.getByRole("textbox")).toBeDisabled();
    expect(screen.getByRole("button", { name: /send/i })).toBeDisabled();
  });

  it("does not call onSend for an empty submission", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput isLoading={false} onSend={onSend} />);

    await user.click(screen.getByRole("button", { name: /send/i }));
    expect(onSend).not.toHaveBeenCalled();
  });

  it("calls onSend with the trimmed message and clears the input", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput isLoading={false} onSend={onSend} />);

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Hello world");
    await user.click(screen.getByRole("button", { name: /send/i }));

    expect(onSend).toHaveBeenCalledWith("Hello world");
    expect(textbox).toHaveValue("");
  });

  it("submits on Enter and inserts a newline on Shift+Enter", async () => {
    const onSend = vi.fn();
    const user = userEvent.setup();
    render(<ChatInput isLoading={false} onSend={onSend} />);

    const textbox = screen.getByRole("textbox");
    await user.type(textbox, "Line one{Shift>}{Enter}{/Shift}Line two{Enter}");

    expect(onSend).toHaveBeenCalledWith("Line one\nLine two");
  });
});
