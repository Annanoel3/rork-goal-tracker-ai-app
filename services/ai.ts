import OpenAI from 'openai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal } from '@/types';

const API_KEY_STORAGE = '@openai_api_key';

let openaiClient: OpenAI | null = null;

export const initializeOpenAI = async (apiKey: string) => {
  openaiClient = new OpenAI({
    apiKey,
    dangerouslyAllowBrowser: true,
  });
  await AsyncStorage.setItem(API_KEY_STORAGE, apiKey);
};

export const loadOpenAIKey = async () => {
  const envApiKey = process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const storedApiKey = await AsyncStorage.getItem(API_KEY_STORAGE);
  const apiKey = envApiKey || storedApiKey;
  
  console.log('Loading OpenAI key...');
  console.log('Env key exists:', !!envApiKey);
  console.log('Env key value:', envApiKey ? `${envApiKey.substring(0, 10)}...` : 'none');
  console.log('Stored key exists:', !!storedApiKey);
  
  if (apiKey) {
    try {
      openaiClient = new OpenAI({
        apiKey,
        dangerouslyAllowBrowser: true,
      });
      console.log('OpenAI client initialized successfully');
      if (envApiKey && !storedApiKey) {
        await AsyncStorage.setItem(API_KEY_STORAGE, envApiKey);
        console.log('Saved env API key to storage');
      }
      return true;
    } catch (error) {
      console.error('Error initializing OpenAI client:', error);
      return false;
    }
  }
  console.log('No OpenAI key found');
  return false;
};

export const isOpenAIInitialized = () => {
  const hasEnvKey = !!process.env.EXPO_PUBLIC_OPENAI_API_KEY;
  const hasClient = openaiClient !== null;
  console.log('Checking OpenAI status - env key:', hasEnvKey, 'client:', hasClient);
  return hasClient;
};

export const getOpenAIStatus = () => ({
  hasEnvKey: !!process.env.EXPO_PUBLIC_OPENAI_API_KEY,
  hasClient: openaiClient !== null,
  isInitialized: isOpenAIInitialized(),
});

const SYSTEM_PROMPT = `You are a supportive personal assistant helping users think through their goals. You guide, not prescribe.

CORE BEHAVIOR:
- Talk like a helpful friend, not a consultant
- Ask one question at a time
- Never output numbered roadmaps or step-by-step plans in conversation
- Never assume the user understands business concepts
- Slow down if they seem overwhelmed
- Be decisive but calm - use context already given
- Move from understanding → action naturally

WHEN USER STATES A GOAL:
1. Pause planning. Switch to assessment mode.
2. If the goal involves making money or revenue:
   - Briefly mention that options exist (ads, subscriptions, purchases, premium features, hybrid models, etc.)
   - Treat these as context to give vocabulary, NOT as instructions
   - Do not ask them to choose one
   - Do not imply any option is easy
3. Ask about their confidence level with scale questions (1-5)
   - WORDING: Always say "Before we continue, I have a few quick questions." then ask scale questions
   - Example: "Before we continue, I have a few quick questions. On a scale of 1-5, how confident are you with [relevant concept]?"
   - Ask max 3 questions at a time
   - Do not proceed until they answer
   - This should feel conversational, not evaluative
4. Ask them to describe what they're building/doing:
   - What it does (or what they want to achieve)
   - Who it's for
   - How people will use it (or how they'll approach it)
   - Do NOT suggest strategies yet
5. After gathering info, suggest ONE possible direction gently
   - Frame it as a starting point or hypothesis
   - Invite correction
   - No lists, no plans in chat

USING KNOWN CONTEXT TO INFER READINESS:
- If user states an app is "approved" in App Store/Play Store or "has active users" → that app is most monetization-ready
- Focus on the most ready option without asking "which one?"
- Use all context the user already provided - don't re-ask
- If readiness is obvious from context, act on it

ENDING CONVERSATIONS (CRITICAL):
- NEVER end with passive prompts like:
  - "What's next on your mind?"
  - "Let me know how you'd like to proceed."
  - "How can I help you next?"
- ALWAYS transition to action instead
- Once you have enough context, offer to create a game plan
- Pattern: Briefly summarize understanding → Offer game plan → Ask confirmation
- Example: "Based on what you've shared, I can turn this into a simple game plan with reminders and progress tracking so you don't have to think about it. Want me to set that up?"

CREATING GAME PLANS:
- After enough context is gathered, the next step should usually be a game plan
- Don't keep users in chat longer than necessary
- Ask only minimum questions needed to safely act
- Fewer turns is better than perfect understanding
- Before generating, summarize and ask: "Want me to set that up?" or similar
- Wait for confirmation
- NO roadmaps or task lists in chat - only generate plans for Goals page

DIFFERENT GOALS → DIFFERENT PLANS (apply internally, don't explain):
- Habit goals → reminders + check-ins
- Skill goals → practice cadence + resources
- Lifestyle goals → habits + optional info support  
- Project/business goals → structured plans + fewer reminders
- The app should feel different depending on goal type

OVER-CHAT PREVENTION:
- Prioritize avoiding drop-off over completeness
- If enough context exists, move to game plan
- Don't delay action with extra questions
- Be decisive - if you can safely act, offer to act

TONE:
- Conversational and warm
- Use emojis sparingly
- No business jargon unless user uses it first
- One topic per message
- Keep responses brief (2-4 sentences usually)

You reduce overwhelm and guide users to action without being pushy.`;

export interface GoalPlanResponse {
  goal: Goal;
  message: string;
}

export const chatWithAI = async (
  messages: { role: 'user' | 'assistant' | 'system'; content: string }[],
  onStream?: (text: string) => void
): Promise<string> => {
  if (!openaiClient) {
    throw new Error('OpenAI not initialized. Please add your API key in settings.');
  }

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        ...messages,
      ],
      temperature: 0.7,
      stream: !!onStream,
    });

    if (onStream) {
      let fullText = '';
      for await (const chunk of response as any) {
        const content = chunk.choices[0]?.delta?.content || '';
        fullText += content;
        onStream(fullText);
      }
      return fullText;
    } else {
      return (response as any).choices[0]?.message?.content || '';
    }
  } catch (error) {
    console.error('OpenAI API Error:', error);
    throw error;
  }
};

export const generateGoalFromConversation = async (
  conversationHistory: { role: 'user' | 'assistant'; content: string }[]
): Promise<Goal> => {
  if (!openaiClient) {
    throw new Error('OpenAI not initialized. Please add your API key in settings.');
  }

  const prompt = `Based on this conversation, extract and create a structured goal plan. Return ONLY a valid JSON object with this exact structure:
{
  "title": "goal title",
  "description": "detailed description",
  "timeframe": {
    "start": "ISO date string",
    "end": "ISO date string",
    "duration": "e.g., 3 months, 6 weeks"
  },
  "category": "e.g., fitness, career, learning",
  "steps": [
    {
      "title": "step title",
      "description": "step description",
      "order": 1,
      "points": 10,
      "dueDate": "ISO date string or null"
    }
  ]
}

Conversation:
${conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}`;

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a JSON generator. Return only valid JSON, no markdown, no explanation.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.3,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanContent);

    const goal: Goal = {
      id: Date.now().toString(),
      title: parsed.title,
      description: parsed.description,
      timeframe: parsed.timeframe,
      steps: parsed.steps.map((step: any, index: number) => ({
        id: `${Date.now()}-${index}`,
        title: step.title,
        description: step.description || '',
        isCompleted: false,
        order: step.order || index,
        points: step.points || 10,
        dueDate: step.dueDate || undefined,
      })),
      progress: 0,
      category: parsed.category,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    return goal;
  } catch (error) {
    console.error('Error generating goal:', error);
    throw new Error('Failed to generate goal from conversation');
  }
};
