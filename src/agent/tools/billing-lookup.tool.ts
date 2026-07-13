import type { Tool } from "@/agent/types";

interface BillingRecord {
  balance: number;
  dueDate: string;
  lastPayment: { amount: number; date: string };
}

const MOCK_BILLING_RECORD: BillingRecord = {
  balance: 128.4,
  dueDate: "2026-08-01",
  lastPayment: { amount: 50, date: "2026-06-20" },
};

/** Simulated business tool: looks up a customer's billing record. */
export const billingLookupTool: Tool = {
  name: "billing_lookup",
  async run() {
    const record = MOCK_BILLING_RECORD;
    return {
      output:
        `Your current balance is $${record.balance.toFixed(2)}, due on ${record.dueDate}. ` +
        `Your last payment of $${record.lastPayment.amount.toFixed(2)} was received on ${record.lastPayment.date}.`,
      statePatch: { billing_status: "reviewed", balance: record.balance },
    };
  },
};
