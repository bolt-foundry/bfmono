# PromptGrade Overview

PromptGrade is the human-in-the-loop evaluation interface for BoltFoundry's RLHF  
workflows. It allows teams to establish ground truth by manually grading AI  
outputs and calibrating automated graders.

## Core Workflow

Users have AI workflows (called "decks") that process inputs and generate  
outputs. For example, a customer support response generator that takes customer  
questions and produces helpful answers.

1.  **AI Processing**: The workflow processes inputs and generates outputs with  
    automatic grades
2.  **Human Review**: Samples appear in PromptGrade Inbox for human validation
3.  **Ground Truth**: Humans provide manual grades to establish what "good" looks  
    like
4.  **Calibration**: System learns from human grades to improve automatic grading
5.  **Historical Reference**: Validated samples move to history for analysis

## Sample Lifecycle

```
AI Output → Auto-Grade → Inbox (needs validation) → Manual Grade → Samples History
```

## Interface Structure

*   **Inbox Tab** (default): Auto-graded samples needing human validation
*   **Samples Tab**: Historical record of all samples for analysis
*   **Graders Tab**: Configuration of evaluation criteria

The goal is continuous improvement - establishing reliable ground truth so  
automated graders can eventually handle routine evaluations while humans focus  
on edge cases and quality assurance.