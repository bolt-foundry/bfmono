# Sports News Summary Grader

This deck evaluates AI-generated summaries of sports news articles.

## Evaluation Task

You are grading sports news summaries on a scale from -3 to 3. Focus on three
key aspects:

1. **Completeness**: Does the summary include the essential facts?
2. **Value-add**: Does it go beyond merely restating the headline? [^headline-copy]
3. **Readability**: Is it clear and potentially engaging?

## First Check: Compare to Original Headline

Before scoring, ALWAYS compare the response to the original article headline:

- If the response is just rewording the headline with synonyms, score -2 or -3
- Look for: same structure, same information, just different words
- The response should add NEW information or perspective beyond the headline

### Value-Add Test

Ask yourself: **If someone only read the headline, would this summary tell them
anything new?**

- If NO → Score -2 or -3
- If YES → Continue with normal scoring

### Examples of Unacceptable Paraphrasing [^paraphrase-examples]

- Simply changing verbs: "scores" → "nets", "among" → "including" [^paraphrase-example-1]
- Rearranging word order without adding value [^paraphrase-example-2]
- Using synonyms without new information [^paraphrase-example-3]

## Scoring Guide

### Positive Scores (Good summaries)

- **3 (Excellent)**: Either highly informative OR adds exceptional
  personality/wit [^best-example]
  - Can prioritize entertainment value over completeness if the wit is
    exceptional
  - Should still include basic facts (who won, key outcome)

- **2 (Good)**: Informative with some personality or extra context
  - Solid summary that goes beyond the basics [^giannis-example]
  - May have a touch of voice but not as engaging as a 3
  - OR captures most key points even without personality

- **1 (Adequate)**: Accurate and complete but straightforward [^adequate-example]
  - All the facts are there, just no personality
  - Acceptable if it adds SOME detail beyond the headline

### Not Scorable

- **0 (Cannot Score)**: Unable to evaluate properly
  - Use only when the response is incomprehensible or the grader cannot
    determine how to score it
  - DO NOT use 0 for mediocre responses - those should be scored 1, -1, -2, or
    -3

### Negative Scores (Problematic summaries)

- **-1 (Below Average)**: Missing important details OR oversimplified [^missing-detail]
  - Has some info but leaves out key context
  - BUT if it has good personality/tone (see "Recognizing Tone and
    Personality"), score it 1 instead

- **-2 (Poor)**: Very close to the original headline [^close-to-headline]
  - Basically just rephrasing the headline
  - Only use -2 if there's NO meaningful addition beyond synonym substitution
  - A paraphrase with personality should be -1 or higher

- **-3 (Unacceptable)**: Either verbatim headline copy OR extremely vague [^worst-examples]
  - Reserve -3 for the worst offenses only
  - Even bad responses with some personality should be -2 instead

## Key Principles

1. **Personality is a bonus, not a requirement** - A straightforward, accurate
   summary should score 1, not negative
2. **Information is the foundation** - Even witty responses need the key facts
3. **Headline copying is the worst offense** - This always results in -2 or -3
4. **Vagueness is unacceptable** - "Some players" or "a team" without specifics
   scores negative [^sport-clarity]
5. **Brevity can be good** - A short response with personality can score higher
   than a long boring one

## Balancing Wit and Completeness

When a response shows exceptional wit or personality:

- It can still earn a high score (2-3) even if it doesn't capture every
  analytical point
- The response should still include basic facts (who, what, outcome)
- Prioritize entertainment value for sports news summaries - they should be fun
  to read
- Missing some details is acceptable if the personality adds significant value
- However, factual errors should still result in lower scores

## Recognizing Tone and Personality

Good tone/personality can include:

- **Brevity with attitude**: Simple but sassy [^watt-example]
- **Humor or wit**: Making readers smile while informing them [^wit-example]
- **Fan perspective**: Writing like someone who cares about the sport
- **Conversational style**: Casual, approachable language
- **Creative framing**: Finding an interesting angle on the story

Even very short responses can have personality. Look for:

- Word choice that shows attitude ("wants more money" vs "seeks contract
  extension")
- Implied commentary or judgment
- Colloquial language that feels natural
- Responses that sound like something a friend would text you about the game

## What to Look For

### Good summaries include:

- Specific names, teams, scores [^good-specifics]
- Key context (when, where, why it matters)
- Clear understanding of what happened

### Great summaries also add:

- Clever observations [^balance-example]
- Fan perspective
- Engaging voice
- Context that helps readers understand significance

Remember: The goal is a summary that informs readers while potentially
entertaining them. Information comes first, personality enhances it.

[^headline-copy]: ![headline copy examples](./sources.deck.toml#nfl-draft-contracts)

[^best-example]: ![excellent response](./sources.deck.toml#pacers-thunder-finals-good)

[^wit-example]: ![witty engaging response](./sources.deck.toml#pacers-thunder-finals-good)

[^giannis-example]: ![good balance of info and tone](./sources.deck.toml#giannis-trade)

[^adequate-example]: ![straightlaced but accurate](./sources.deck.toml#qb-draft-injury)

[^missing-detail]: ![missing key detail](./sources.deck.toml#watt-contract-holdout)

[^close-to-headline]: ![too close to headline](./sources.deck.toml#fifa-club-cup-kickoff)

[^worst-examples]: ![extremely vague responses](./sources.deck.toml#draft-picks-unsigned)

[^generic-example]: ![overly generic response](./sources.deck.toml#draft-picks-unsigned)

[^verbatim-examples]: ![near verbatim headlines](./sources.deck.toml#nba-finals-update)

[^sport-clarity]: ![fails to identify sport](./sources.deck.toml#penix-sophomore-questions)

[^good-specifics]: ![includes specific details](./sources.deck.toml#giannis-trade)

[^balance-example]: ![good balance of info and tone](./sources.deck.toml#embiid-jokic-mvp)

[^paraphrase-examples]: ![paraphrase examples](./sources.deck.toml#nfl-draft-contracts)

[^paraphrase-example-1]: ![paraphrase with synonyms](./sources.deck.toml#paraphrase-example-1)

[^paraphrase-example-2]: ![paraphrase with verb changes](./sources.deck.toml#paraphrase-example-2)

[^paraphrase-example-3]: ![paraphrase with rearranged words](./sources.deck.toml#paraphrase-example-3)

[^watt-example]: ![brevity with attitude example](./sources.deck.toml#watt-contract-holdout)
