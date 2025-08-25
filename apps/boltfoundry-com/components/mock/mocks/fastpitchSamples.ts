import type { GradingSample } from "@bfmono/apps/boltfoundry-com/types/grading.ts";

export const fastpitchGradingSamples: Array<GradingSample> = [
  {
    id: "sample-plus3-major-ai-developments",
    timestamp: "2025-07-08T17:00:00Z",
    duration: 180,
    provider: "anthropic",
    request: {
      url: "https://api.anthropic.com/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "sk-ant-api03-...",
      },
      body: {
        model: "claude-3-5-sonnet-20241022",
        messages: [
          {
            role: "user",
            content:
              `Grade the following 5 AI news stories for relevance to AI professionals:

ID,Title,Source Name,Article URL,Published Date,Relevance Score,Content Preview
197,ChatGPT is testing a mysterious new feature called 'study together',TechCrunch AI,https://techcrunch.com/2025/07/07/chatgpt-is-testing-a-mysterious-new-feature-called-study-together/,2025-07-07T19:53:30.000Z,70,"ChatGPT is currently experimenting with a new feature dubbed 'study together,' which aims to enhance its role as an educational tool by shifting the focus from providing direct answers to fostering a..."
270,OpenAI and Microsoft Bankroll New A.I. Training for Teachers,NY Times Technology,https://www.nytimes.com/2025/07/08/technology/chatgpt-teachers-openai-microsoft.html,2025-07-08T09:00:08.000Z,90,"OpenAI and Microsoft are investing $23 million to establish a national training center for educators, aimed at integrating AI tools into teaching practices, with additional support from Anthropic. Thi..."
249,Sakana AI's TreeQuest: Deploy multi-model teams that outperform individual LLMs by 30%,VentureBeat AI,https://venturebeat.com/ai/sakana-ais-treequest-deploy-multi-model-teams-that-outperform-individual-llms-by-30/,2025-07-03T22:00:19.000Z,80,"Sakana AI's innovative TreeQuest leverages a Monte-Carlo Tree Search technique to enable multiple large language models (LLMs) to work collaboratively, resulting in a performance boost of 30% over ind..."
195,Meta reportedly recruits Apple's head of AI models,TechCrunch AI,https://techcrunch.com/2025/07/07/meta-reportedly-recruits-apples-head-of-ai-models/,2025-07-07T23:39:02.000Z,80,"Meta's recent recruitment of Ruoming Pang, formerly the head of AI models at Apple, signals a strategic shift as the company aims to bolster its AI capabilities and enhance its competitive edge in the..."
204,Google faces EU antitrust complaint over AI Overviews,TechCrunch AI,https://techcrunch.com/2025/07/05/google-faces-eu-antitrust-complaint-over-ai-overviews/,2025-07-05T17:36:54.000Z,70,"Google is facing a significant antitrust complaint from the EU, alleging that its AI Overviews feature in Google Search improperly utilizes web content, leading to detrimental impacts on publishers, p..."`,
          },
        ],
      },
    },
    response: {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": "5000",
        "X-RateLimit-Remaining": "4999",
      },
      body: {
        id: "msg_01ABC123DEF456",
        object: "message",
        created: 1720454400,
        model: "claude-3-5-sonnet-20241022",
        usage: {
          prompt_tokens: 850,
          completion_tokens: 150,
          total_tokens: 1000,
        },
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: {
                stories: [
                  {
                    articleId: 197,
                    summary:
                      "ChatGPT tests mysterious 'study together' feature to enhance educational capabilities",
                    emoji: "📚",
                  },
                  {
                    articleId: 270,
                    summary:
                      "OpenAI and Microsoft invest $23M to establish national AI training center for educators",
                    emoji: "🏫",
                  },
                  {
                    articleId: 249,
                    summary:
                      "Sakana AI's TreeQuest enables collaborative LLM teams with 30% performance boost",
                    emoji: "🌳",
                  },
                  {
                    articleId: 195,
                    summary:
                      "Meta recruits Apple's head of AI models in strategic talent acquisition",
                    emoji: "🍎",
                  },
                  {
                    articleId: 204,
                    summary:
                      "Google faces EU antitrust complaint over AI Overviews feature impact on publishers",
                    emoji: "⚖️",
                  },
                ],
              },
            },
          },
        ],
      },
    },
    graderEvaluations: [
      {
        graderId: "ai-digest-quality-grader-v4",
        graderName: "AI Digest Quality Grader",
        score: 3,
        reason:
          "This digest achieves a +3 score by featuring 5 major AI/technical developments from different companies and sources: ChatGPT's mysterious new 'study together' feature, OpenAI/Microsoft's $23M education initiative, Sakana AI's breakthrough collaborative model system, Meta's strategic talent acquisition from Apple, and Google's EU antitrust complaint over AI Overviews. All stories represent significant technical breakthroughs or major industry developments with high relevance to AI professionals.",
      },
    ],
    bfMetadata: {
      deckName: "AI Digest Quality Grader",
      deckContent:
        "Grade a selection of 5 AI news stories for relevance to AI professionals based on AI relevance and technical impact. Apply penalties for major violations (irrelevant stories, company duplication, weak stories) before considering positive scoring.",
      contextVariables: {
        userId: "fastpitch-demo",
        sessionId: "fastpitch-sample-plus3",
      },
    },
  },
  {
    id: "sample-plus2-strong-technical-stories",
    timestamp: "2025-06-25T17:00:00Z",
    duration: 165,
    provider: "anthropic",
    request: {
      url: "https://api.anthropic.com/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "sk-ant-api03-...",
      },
      body: {
        model: "claude-3-5-sonnet-20241022",
        messages: [
          {
            role: "user",
            content:
              `Grade the following 5 AI news stories for relevance to AI professionals:

id,title,content,url,published_at,scraped_at,source_id,relevance_score
484,Google's new AI will help researchers understand how our genes work,"When scientists first sequenced the human genome in 2003, they revealed the full set of DNA instructions that make a person. But we still didn't know what all those 3 billion genetic letters actually do.  Now Google's DeepMind division says it's made a leap in trying to understand the code with AlphaGenome, an AI model…",https://www.technologyreview.com/2025/06/25/1119345/google-deepmind-alphagenome-ai/,2025-06-25 14:00:00,2025-06-25 17:56:36.284563,23,80
468,Google unveils Gemini CLI an open-source AI tool for terminals,"Google is launching a new agentic AI tool that will put its Gemini AI models closer to where developers are already coding. The company announced on Wednesday the launch of Gemini CLI, an agentic AI tool designed to run locally from your terminal. The new tool connects Google's Gemini AI models to local codebases, and […]",https://techcrunch.com/2025/06/25/google-unveils-gemini-cli-an-open-source-ai-tool-for-terminals/,2025-06-25 13:00:00,2025-06-25 17:56:33.167995,17,70
483,Stanford's ChatEHR allows clinicians to query patient medical records using natural language without compromising patient data,"ChatEHR accelerates chart reviews for ER admissions, streamlines patient transfer summaries and synthesizes complex medical histories.",https://venturebeat.com/ai/stanfords-chatehr-allows-clinicians-to-query-patient-medical-records-using-natural-language-without-compromising-patient-data/,2025-06-25 00:24:25,2025-06-25 17:56:35.886328,22,50
480,Enterprises must rethink IAM as AI agents outnumber humans 10 to 1,"Identity is the essential control plane for agentic AI security, redefining enterprise defenses amid rising credential-based breaches.",https://venturebeat.com/security/identity-becomes-the-control-plane-for-enterprise-ai-security/,2025-06-25 15:05:00,2025-06-25 17:56:35.70778,22,60
492,Why Does Every Commercial for A.I. Think You're a Moron?,Ads for consumer A.I. are struggling to imagine how the product could improve your day — unless you're a barely functioning idiot.,https://www.nytimes.com/2025/06/25/magazine/ai-commercials-ads-loneliness.html,2025-06-25 09:01:09,2025-06-25 17:56:39.907544,26,50`,
          },
        ],
      },
    },
    response: {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": "5000",
        "X-RateLimit-Remaining": "4998",
      },
      body: {
        id: "msg_01DEF789GHI012",
        object: "message",
        created: 1719342000,
        model: "claude-3-5-sonnet-20241022",
        usage: {
          prompt_tokens: 420,
          completion_tokens: 180,
          total_tokens: 600,
        },
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: {
                stories: [
                  {
                    articleId: 484,
                    summary:
                      "Google DeepMind unveils AlphaGenome AI to decode human genetic functions beyond basic sequencing",
                    emoji: "🧬",
                  },
                  {
                    articleId: 468,
                    summary:
                      "Google unveils Gemini CLI, an open-source AI tool for terminals",
                    emoji: "💻",
                  },
                  {
                    articleId: 483,
                    summary:
                      "Stanford's ChatEHR allows clinicians to query patient medical records using natural language",
                    emoji: "🏥",
                  },
                  {
                    articleId: 480,
                    summary:
                      "Enterprises must rethink IAM as AI agents outnumber humans 10 to 1",
                    emoji: "🔒",
                  },
                  {
                    articleId: 492,
                    summary:
                      "Why Does Every Commercial for A.I. Think You're a Moron?",
                    emoji: "📺",
                  },
                ],
              },
            },
          },
        ],
      },
    },
    graderEvaluations: [
      {
        graderId: "ai-digest-quality-grader-v4",
        graderName: "AI Digest Quality Grader",
        score: 2,
        reason:
          "This digest contains mostly strong technical AI stories with clear professional relevance: Google's AlphaGenome breakthrough, Gemini CLI for developers, Stanford's ChatEHR medical AI, and AI enterprise security. Only one weaker story about AI commercials commentary brings it down from +3 to +2.",
      },
    ],
    bfMetadata: {
      deckName: "AI Digest Quality Grader",
      deckContent:
        "Grade a selection of 5 AI news stories for relevance to AI professionals based on AI relevance and technical impact. Apply penalties for major violations (irrelevant stories, company duplication, weak stories) before considering positive scoring.",
      contextVariables: {
        userId: "fastpitch-demo",
        sessionId: "fastpitch-sample-plus2",
      },
    },
  },
  {
    id: "sample-neg3-company-duplication",
    timestamp: "2025-07-08T17:30:00Z",
    duration: 145,
    provider: "anthropic",
    request: {
      url: "https://api.anthropic.com/v1/messages",
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": "sk-ant-api03-...",
      },
      body: {
        model: "claude-3-5-sonnet-20241022",
        messages: [
          {
            role: "user",
            content:
              `Grade the following 5 AI news stories for relevance to AI professionals:

ID,Title,Source Name,Article URL,Published Date,Relevance Score,Content Preview
270,OpenAI and Microsoft Bankroll New A.I. Training for Teachers,NY Times Technology,https://www.nytimes.com/2025/07/08/technology/chatgpt-teachers-openai-microsoft.html,2025-07-08T09:00:08.000Z,90,"OpenAI and Microsoft are investing $23 million to establish a national training center for educators, aimed at integrating AI tools into teaching practices, with additional support from Anthropic. Thi..."
195,Meta reportedly recruits Apple's head of AI models,TechCrunch AI,https://techcrunch.com/2025/07/07/meta-reportedly-recruits-apples-head-of-ai-models/,2025-07-07T23:39:02.000Z,80,"Meta's recent recruitment of Ruoming Pang, formerly the head of AI models at Apple, signals a strategic shift as the company aims to bolster its AI capabilities and enhance its competitive edge in the..."
194,OpenAI tightens the screws on security to keep away prying eyes,TechCrunch AI,https://techcrunch.com/2025/07/07/openai-tightens-the-screws-on-security-to-keep-away-prying-eyes/,2025-07-08T05:44:33.000Z,70,"OpenAI has significantly enhanced its security measures in response to concerns over corporate espionage, particularly following allegations that Chinese startup DeepSeek improperly replicated its mod..."
204,Google faces EU antitrust complaint over AI Overviews,TechCrunch AI,https://techcrunch.com/2025/07/05/google-faces-eu-antitrust-complaint-over-ai-overviews/,2025-07-05T17:36:54.000Z,70,"Google is facing a significant antitrust complaint from the EU, alleging that its AI Overviews feature in Google Search improperly utilizes web content, leading to detrimental impacts on publishers, p..."
197,ChatGPT is testing a mysterious new feature called 'study together',TechCrunch AI,https://techcrunch.com/2025/07/07/chatgpt-is-testing-a-mysterious-new-feature-called-study-together/,2025-07-07T19:53:30.000Z,70,"ChatGPT is currently experimenting with a new feature dubbed 'study together,' which aims to enhance its role as an educational tool by shifting the focus from providing direct answers to fostering a..."`,
          },
        ],
      },
    },
    response: {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        "X-RateLimit-Limit": "5000",
        "X-RateLimit-Remaining": "4997",
      },
      body: {
        id: "msg_01JKL345MNO678",
        object: "message",
        created: 1720456200,
        model: "claude-3-5-sonnet-20241022",
        usage: {
          prompt_tokens: 380,
          completion_tokens: 190,
          total_tokens: 570,
        },
        choices: [
          {
            index: 0,
            message: {
              role: "assistant",
              content: {
                stories: [
                  {
                    articleId: 270,
                    summary:
                      "OpenAI and Microsoft invest $23M to establish national AI training center for educators",
                    emoji: "🏫",
                  },
                  {
                    articleId: 195,
                    summary:
                      "Meta recruits Apple's head of AI models in strategic talent acquisition",
                    emoji: "🍎",
                  },
                  {
                    articleId: 194,
                    summary:
                      "OpenAI enhances security measures to prevent corporate espionage and model replication",
                    emoji: "🔒",
                  },
                  {
                    articleId: 204,
                    summary:
                      "Google faces EU antitrust complaint over AI Overviews feature impact on publishers",
                    emoji: "⚖️",
                  },
                  {
                    articleId: 197,
                    summary:
                      "ChatGPT tests new 'study together' feature to enhance educational capabilities",
                    emoji: "📚",
                  },
                ],
              },
            },
          },
        ],
      },
    },
    graderEvaluations: [
      {
        graderId: "ai-digest-quality-grader-v4",
        graderName: "AI Digest Quality Grader",
        score: -3,
        reason:
          "This digest receives automatic -3 penalty for company duplication violations: it includes 2 OpenAI stories (training center and security measures) and 3 TechCrunch AI stories (OpenAI security, Google antitrust, ChatGPT feature). Despite having technically strong AI stories, the penalty-first approach means company duplication dominates the scoring, demonstrating how even good content fails when diversity principles are violated.",
      },
    ],
    bfMetadata: {
      deckName: "AI Digest Quality Grader",
      deckContent:
        "Grade a selection of 5 AI news stories for relevance to AI professionals based on AI relevance and technical impact. Apply penalties for major violations (irrelevant stories, company duplication, weak stories) before considering positive scoring.",
      contextVariables: {
        userId: "fastpitch-demo",
        sessionId: "fastpitch-sample-neg3",
      },
    },
  },
];
