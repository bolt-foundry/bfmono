# Bolt Foundry - Customer Success Platform for AI

**Make AI systems continuously improve through customer feedback, creating
reliable, customer-centric AI that gets better every day using RLHF workflows.**

Most AI systems are built and deployed without meaningful connection to customer
feedback. Companies launch AI features, get complaints, and struggle to
translate customer dissatisfaction into systematic improvements. Bolt Foundry
changes that with our RLHF workflow platform.

## The Problem

AI systems today are disconnected from customer success:

- **Disconnected systems**: AI behavior doesn't reflect actual customer needs
- **Unmeasurable impact**: No clear connection between AI changes and customer
  satisfaction
- **Untestable improvements**: Can't verify if changes actually help customers
- **Scaling challenges**: Each customer complaint requires manual investigation
  and custom fixes

## The Solution

Bolt Foundry provides a **Customer Success Platform for AI** that turns customer
feedback into systematic AI improvements through our RLHF workflow:

- **Feedback collection**: Systematic capture of customer interactions and
  satisfaction signals
- **Evaluation specs**: Automated generation of evaluation criteria from
  customer feedback patterns
- **Response optimization**: Continuous improvement of AI responses based on
  customer success metrics
- **Success tracking**: Measurable outcomes connecting customer satisfaction to
  AI improvements

## Why This Matters

### For Customer Success Teams

- Transform customer feedback into systematic AI improvements
- Measure and track customer satisfaction with AI interactions
- Identify patterns in customer needs and optimize AI responses
- Build customer-centric AI that continuously improves

### For Companies

- AI systems that truly serve customers better over time
- Measurable ROI from customer satisfaction improvements
- Competitive advantage through customer-driven AI excellence
- Predictable customer success outcomes

## How It Works

Our platform uses **graders** - evaluation specifications that define what good
AI behavior looks like from a customer success perspective:

```markdown
# Customer Support Response Grader

Evaluate customer support responses for satisfaction and resolution quality.

## Evaluation Criteria

- Addresses customer's specific concern directly
- Provides clear, actionable next steps
- Maintains professional, empathetic tone
- Resolves issue or escalates appropriately

## Scoring Guidelines

- **+3**: Perfect customer experience, issue fully resolved
- **+1**: Good response, minor customer experience improvements possible
- **-1**: Adequate but customer could be more satisfied
- **-3**: Poor customer experience, likely to generate complaint

![customer feedback samples](./customer-support-context-and-samples.deck.toml)
```

The scoring system (-3 to +3) gives you precise control over customer
satisfaction outcomes.

## Customer Success in Action

**Current Implementation**: We're working with example-customer.com to implement
a complete customer success workflow for invoice extraction AI, targeting >90%
accuracy through systematic customer feedback integration.

**Result**: Measurable improvements in customer satisfaction and business
outcomes through our RLHF workflow platform.

## Get Started

### 1. Try Customer Success Validation

See how our platform works with real customer success metrics:

```bash
# Install our platform
npm install @bolt-foundry/bolt-foundry

# Run customer success calibration
aibff calibrate your-customer-feedback-grader.deck.md
```

### 2. Build Your RLHF Workflow

Create systematic customer feedback-to-AI improvement workflows:

- **Customer feedback processing**: Automated analysis of customer interactions
- **Evaluation spec generation**: Turn feedback patterns into measurable
  criteria
- **Response optimization**: Continuous improvement based on customer success
  metrics
- **Success tracking**: Monitor customer satisfaction improvements over time

## Revenue Model

We offer credit-based pricing for customer success services:

- **Feedback Processing**: Customer feedback interactions processed through our
  RLHF workflow
- **Evaluation Specs**: Automated generation of evaluation specifications from
  customer feedback
- **Response Optimization**: Batch processing of improved AI responses based on
  customer success metrics
- **Performance Analytics**: Customer satisfaction tracking and success
  optimization

## Learn More

- **[Company Vision](memos/guides/company-vision.md)** - Our mission and
  approach
- **[Business Vision](memos/guides/business-vision.md)** - Go-to-market strategy
  and revenue model
- **[Customer Success Plan](memos/plans/2025-07-14-customer-success-prompt-iteration-plan.md)** -
  Current implementation details
- **[Project Status](memos/guides/STATUS.md)** - Current project status and
  priorities

## Licensing

This repository is **public** so you can explore and understand how Bolt Foundry
works. However, it is **not open source** at this time.

- **License:** All rights reserved by Content Foundry, Inc.
- You may **view** the code and use it for **reference**.
- You may **not** copy, modify, redistribute, or use this code in any other way
  without written permission.

We are currently **evaluating our long-term licensing strategy**. In the future,
we may adopt an open source or source-available license such as the Business
Source License (BSL), Apache License 2.0, or similar, to balance transparency
with sustainability.

Older versions released under future licenses will remain under those licenses.

---

**Contact**: Ready to improve your AI through customer success? Email us at
[contact@boltfoundry.com](mailto:contact@boltfoundry.com)
