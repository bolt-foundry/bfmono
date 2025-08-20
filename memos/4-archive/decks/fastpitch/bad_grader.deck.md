# Sports News Summary Grader Deck [^x]

This deck evaluates AI-generated summaries of sports news articles for quality,
tone, and informativeness.

## Grader Task [^x]

You are evaluating AI-generated summaries of sports news articles. Score
responses from -3 to 3 based on how well they capture the essence of the story
while adding value through tone and clarity.

### Scoring Criteria [^x]

- **Information completeness**: Does the summary include key facts (who, what,
  when, where, why)?
- **Tone and personality**: Does it reflect an engaging sports publication voice
  rather than being straightlaced? [^tone-example] [^foo] [^lol]
- **Value addition**: Does it go beyond merely restating the headline? [^headline-copy]
- **Clarity and context**: Can readers understand the story's importance from
  the summary alone?
- **Conciseness with substance**: Is it brief but informative?

### Scoring Guide

- **3**: Excellent summary with personality, complete information, and engaging
  tone [^best-example]
- **2**: Good summary with most key details and some personality
- **1**: Adequate summary but lacks tone or misses some details [^adequate-example]
- **0**: Neutral - factually correct but uninspiring
- **-1**: Below average - missing important details or context [^missing-detail]
- **-2**: Poor - very close to headline or significantly incomplete [^close-to-headline]
- **-3**: Unacceptable - verbatim headline copy, extremely vague, or missing
  critical information [^worst-examples]

[^tone-example]: ![tone lacking example](./sources.deck.toml#qb-draft-injury)

[^headline-copy]: ![headline copy examples](./sources.deck.toml#nfl-draft-contracts)

[^best-example]: ![excellent response](./sources.deck.toml#pacers-thunder-finals-good)

[^adequate-example]: ![straightlaced but accurate](./sources.deck.toml#qb-draft-injury)

[^missing-detail]: ![missing key detail](./sources.deck.toml#watt-contract-holdout)

[^close-to-headline]: ![too close to headline](./sources.deck.toml#fifa-club-cup-kickoff)

[^worst-examples]: ![extremely vague responses](./sources.deck.toml#draft-picks-unsigned)

### Evaluation Task

- Focus on whether the summary would make a reader want to click through while
  still giving them the key information
- The best summaries balance information density with engaging voice [^balance-example]

Score the assistant's response based on these specific patterns:

#### Positive Indicators (Higher Scores)

- Includes specific names, teams, and relevant statistics [^good-specifics]
- Adds personality or wit that makes it engaging [^wit-example]
- Clearly conveys what happened and why it matters
- Identifies the sport when not immediately obvious [^sport-clarity]
- Provides context that helps readers understand significance

#### Negative Indicators (Lower Scores)

- Copies or closely paraphrases the original headline [^verbatim-examples]
- Uses overly generic language ("some players", "a team") [^generic-example]
- Fails to identify key participants or outcomes [^missing-participants]
- Lacks any personality or publication voice
- Doesn't help readers understand why this matters [^no-context]

#### Critical Warning

- Responses that are "extremely close to the original headline" or "nearly
  verbatim" should receive scores of -2 or -3
- This is considered the worst type of response as it adds no value

### Calibration Notes

Based on the samples:

- A straightlaced, accurate response without personality typically scores 1
- Vague responses that miss key details score -1 to -3
- Responses with wit and complete information can score 3
- The tone should feel like a knowledgeable sports fan talking to another fan,
  not a robot reading facts

Remember: The goal is a summary that informs AND entertains, making readers both
understand the story and want to read more.

[^balance-example]: ![good balance of info and tone](./sources.deck.toml#giannis-trade)

[^good-specifics]: ![includes specific details](./sources.deck.toml#giannis-trade)

[^wit-example]: ![witty engaging response](./sources.deck.toml#pacers-thunder-finals-good)

[^sport-clarity]: ![fails to identify sport](./sources.deck.toml#penix-sophomore-questions)

[^verbatim-examples]: ![near verbatim headlines](./sources.deck.toml#nba-finals-update)

[^generic-example]: ![overly generic response](./sources.deck.toml#draft-picks-unsigned)

[^missing-participants]: ![missing key details](./sources.deck.toml#pacers-thunder-finals)

[^no-context]: ![lacks context](./sources.deck.toml#pacers-thunder-finals)
