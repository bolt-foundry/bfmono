import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";

export const mockGradingSamples: Array<GradingSample> = [
  {
    id: "sample-1",
    timestamp: "2023-10-01T12:00:00Z",
    duration: 150,
    provider: "openai",
    request: {
      url: "https://api.openai.com/v1/chat/completions",
      method: "POST",
      headers: {},
      body: {
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: "Can you give me the markdown for this invoice?",
          },
          {
            role: "assistant",
            content:
              "# Invoice\n\n**Date:** 2023-10-01\n\n**Bill To:**\nJohn Doe\n123 Main St.\nCity, State, ZIP\n\n**Items:**\n- Item 1: $100.00\n- Item 2: $50.00\n\n**Total:** $150.00\n",
          },
          {
            role: "user",
            content: "What output format do you want for the invoice?",
          },
          {
            role: "assistant",
            content:
              "JSON following this format: {'lineItems': [{'description': 'Item 1', 'amount': 100.00}, {'description': 'Item 2', 'amount': 50.00}], 'total': 150.00, 'date': '2023-10-01', 'billTo': {'name': 'John Doe', 'address': '123 Main St., City, State, ZIP'}}",
          },
        ],
      },
    },
    response: {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": "60",
        "X-RateLimit-Remaining": "59",
      },
      body: {
        id: "chatcmpl-1234567890",
        object: "chat.completion",
        created: 1700000000,
        model: "gpt-4",
        usage: {
          prompt_tokens: 100,
          completion_tokens: 50,
          total_tokens: 150,
        },
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: {
                lineItems: [
                  {
                    description: "Item 1",
                    amount: 100.00,
                  },
                  {
                    description: "Item 2",
                    amount: 50.00,
                  },
                ],
                total: 150.00,
                date: "2023-10-01",
                billTo: {
                  name: "John Doe",
                  address: "123 Main St., City, State, ZIP",
                },
              },
            },
          },
        ],
      },
    },
    graderEvaluations: [
      {
        graderId: "grader-1",
        graderName: "JSON Validator",
        score: 3,
        reason:
          "The JSON output correctly matches the requested format with all required fields present and properly structured.",
      },
      {
        graderId: "grader-2",
        graderName: "Data Accuracy",
        score: 3,
        reason:
          "All values from the original invoice are accurately represented in the JSON output.",
      },
    ],
    bfMetadata: {
      deckName: "Invoice Generation",
      deckContent:
        "Generate an invoice in JSON format based on the provided markdown.",
      contextVariables: {
        userId: "12345",
        sessionId: "abcde-12345",
      },
    },
  },
  {
    id: "sample-2",
    timestamp: "2023-10-01T14:30:00Z",
    duration: 175,
    provider: "openai",
    request: {
      url: "https://api.openai.com/v1/chat/completions",
      method: "POST",
      headers: {},
      body: {
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content: "Convert this receipt to markdown format",
          },
          {
            role: "assistant",
            content:
              "# Receipt\n\n**Date:** 2023-10-01\n**Transaction ID:** RCP-789456\n\n**Store:** Tech Supplies Co.\n456 Commerce Blvd\nTechville, CA 94000\n\n**Items:**\n- USB-C Cable (2m): $24.99\n- Wireless Mouse: $39.99\n- Mouse Pad: $12.99\n\n**Subtotal:** $77.97\n**Tax (8.75%):** $6.82\n**Total:** $84.79\n\n**Payment Method:** Credit Card ending in 4242",
          },
          {
            role: "user",
            content: "Now convert to JSON format please",
          },
          {
            role: "assistant",
            content:
              "I'll convert the receipt to JSON format with a clear structure for all the transaction details.",
          },
        ],
      },
    },
    response: {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": "60",
        "X-RateLimit-Remaining": "58",
      },
      body: {
        id: "chatcmpl-2345678901",
        object: "chat.completion",
        created: 1700008200,
        model: "gpt-4",
        usage: {
          prompt_tokens: 120,
          completion_tokens: 80,
          total_tokens: 200,
        },
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: {
                transactionId: "RCP-789456",
                date: "2023-10-01",
                store: {
                  name: "Tech Supplies Co.",
                  address: "456 Commerce Blvd, Techville, CA 94000",
                },
                lineItems: [
                  {
                    description: "USB-C Cable (2m)",
                    amount: 24.99,
                  },
                  {
                    description: "Wireless Mouse",
                    amount: 39.99,
                  },
                  {
                    description: "Mouse Pad",
                    amount: 12.99,
                  },
                ],
                subtotal: 77.97,
                tax: {
                  rate: 0.0875,
                  amount: 6.82,
                },
                total: 84.79,
                paymentMethod: "Credit Card ending in 4242",
              },
            },
          },
        ],
      },
    },
    graderEvaluations: [
      {
        graderId: "grader-1",
        graderName: "JSON Validator",
        score: 3,
        reason:
          "Valid JSON structure with proper nesting and data types. All fields are correctly formatted.",
      },
      {
        graderId: "grader-2",
        graderName: "Data Accuracy",
        score: 3,
        reason:
          "All monetary values, items, and transaction details are accurately transferred from the markdown receipt.",
      },
    ],
    bfMetadata: {
      deckName: "Invoice Generation",
      deckContent:
        "Generate an invoice in JSON format based on the provided markdown.",
      contextVariables: {
        userId: "12345",
        sessionId: "abcde-12345",
      },
    },
  },
  {
    id: "sample-3",
    timestamp: "2023-10-02T09:15:00Z",
    duration: 195,
    provider: "openai",
    request: {
      url: "https://api.openai.com/v1/chat/completions",
      method: "POST",
      headers: {},
      body: {
        model: "gpt-4",
        messages: [
          {
            role: "user",
            content:
              "Here's a purchase order in text format, please convert to markdown",
          },
          {
            role: "assistant",
            content:
              "# Purchase Order\n\n**PO Number:** PO-2023-10-567\n**Date:** 2023-10-02\n**Delivery Date:** 2023-10-09\n\n**Vendor:**\nOffice Essentials Ltd.\n789 Supply Street\nVendor City, VC 12345\n\n**Ship To:**\nAcme Corporation\n321 Business Ave\nCorporate City, CC 54321\n\n**Items:**\n- Printer Paper (10 reams): $45.90\n- Ink Cartridges (Black, 4-pack): $89.96\n- Stapler Set: $23.45\n- File Folders (Box of 100): $34.50\n\n**Subtotal:** $193.81\n**Shipping:** $12.00\n**Total:** $205.81\n\n**Terms:** Net 30",
          },
          {
            role: "user",
            content: "Perfect, now I need this in JSON format for our system",
          },
          {
            role: "assistant",
            content:
              "I'll convert this purchase order to JSON format for your system integration.",
          },
        ],
      },
    },
    response: {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": "60",
        "X-RateLimit-Remaining": "57",
      },
      body: {
        id: "chatcmpl-3456789012",
        object: "chat.completion",
        created: 1700097300,
        model: "gpt-4",
        usage: {
          prompt_tokens: 140,
          completion_tokens: 95,
          total_tokens: 235,
        },
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: {
                poNumber: "PO-2023-10-567",
                date: "2023-10-02",
                deliveryDate: "2023-10-09",
                vendor: {
                  name: "Office Essentials Ltd.",
                  address: "789 Supply Street, Vendor City, VC 12345",
                },
                shipTo: {
                  name: "Acme Corporation",
                  address: "321 Business Ave, Corporate City, CC 54321",
                },
                lineItems: [
                  {
                    description: "Printer Paper (10 reams)",
                    amount: 45.90,
                  },
                  {
                    description: "Ink Cartridges (Black, 4-pack)",
                    amount: 89.96,
                  },
                  {
                    description: "Stapler Set",
                    amount: 23.45,
                  },
                  {
                    description: "File Folders (Box of 100)",
                    amount: 34.50,
                  },
                ],
                subtotal: 193.81,
                shipping: 12.00,
                total: 205.81,
                terms: "Net 30",
              },
            },
          },
        ],
      },
    },
    graderEvaluations: [
      {
        graderId: "grader-1",
        graderName: "JSON Validator",
        score: 3,
        reason:
          "Well-structured JSON with consistent formatting. All required fields are present with appropriate data types.",
      },
      {
        graderId: "grader-2",
        graderName: "Data Accuracy",
        score: 2,
        reason:
          "Most data is accurate, but the calculation shows subtotal + shipping = $205.81 which is correct. All line items and totals match the source.",
      },
    ],
    bfMetadata: {
      deckName: "Invoice Generation",
      deckContent:
        "Generate an invoice in JSON format based on the provided markdown.",
      contextVariables: {
        userId: "12345",
        sessionId: "abcde-12345",
      },
    },
  },
];
