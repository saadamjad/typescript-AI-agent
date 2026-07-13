import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ChatMessage } from "@/components/chat/ChatMessage";

describe("ChatMessage", () => {
  it("renders a user message right-aligned", () => {
    render(
      <ul>
        <ChatMessage
          message={{ id: "1", role: "user", content: "Hi there", timestamp: 0 }}
        />
      </ul>,
    );

    const item = screen.getByLabelText("Your message");
    expect(item).toHaveTextContent("Hi there");
    expect(item).toHaveClass("justify-end");
  });

  it("renders an assistant message left-aligned", () => {
    render(
      <ul>
        <ChatMessage
          message={{
            id: "2",
            role: "assistant",
            content: "How can I help?",
            timestamp: 0,
          }}
        />
      </ul>,
    );

    const item = screen.getByLabelText("Assistant message");
    expect(item).toHaveTextContent("How can I help?");
    expect(item).toHaveClass("justify-start");
  });
});
