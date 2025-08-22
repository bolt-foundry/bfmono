# PromptGrade Overview

PromptGrade is the human-in-the-loop evaluation interface for BoltFoundry's  
RLHF  
workflows. It allows teams to establish ground truth by manually grading AI  
outputs and calibrating automated graders.

## Core Workflow

Users have production AI workflows (called "actor decks") optimized for cost,  
latency, and performance. For example, a customer support response generator  
that takes customer questions and produces helpful answers.

Separate "grader decks" define evaluation criteria for what makes a good  
response.

1.  **AI Processing**: Actor deck processes inputs and generates outputs, grader  
    deck provides automatic grades
2.  **Human Review**: Samples appear in PromptGrade Inbox for human validation
3.  **Ground Truth**: Humans provide manual grades to establish what "good" looks  
    like
4.  **Calibration**: System learns from human grades to improve automatic grading
5.  **Analysis**: Validated samples provide scientific evidence for improving  
    actor decks
6.  **Deck Improvement**: Teams update actor deck prompts/models based on grading  
    insights

## Sample Lifecycle

```
Actor Deck Output → Grader Auto-Grade → Inbox (needs validation) → Manual Grade → Samples History → Actor Deck Improvements
```

## Interface Structure

*   **Inbox Tab** (default): Auto-graded samples needing human validation
*   **Samples Tab**: Historical record of all samples for analysis
*   **Graders Tab**: Configuration of evaluation criteria

The goal is continuous improvement through scientific iteration - establishing  
reliable ground truth so automated graders can handle routine evaluations while  
humans focus on edge cases. The grading data provides evidence-based insights to  
improve actor deck prompts, models, and configurations.