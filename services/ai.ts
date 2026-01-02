import OpenAI from 'openai';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Goal, GamePlan } from '@/types';

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

const SYSTEM_PROMPT = `You are a supportive personal assistant helping users achieve their goals through thoughtful, adaptive planning. You guide without overwhelming.

CORE PRINCIPLES:
- Talk like a helpful friend, not a consultant
- Ask one question at a time
- Never output numbered roadmaps or step-by-step plans in conversation
- Use context the user already provided - don't re-ask
- Be decisive but calm - move naturally from understanding → action
- Different goals need different plans and different app experiences

WHEN USER STATES A GOAL:
1. Pause planning. Switch to assessment mode.
2. If the goal involves making money or revenue:
   - Briefly mention that options exist (ads, subscriptions, purchases, premium features, hybrid models)
   - Treat these as context to give vocabulary, NOT as instructions
   - Do not ask them to choose one
   - Do not imply any option is easy
3. Ask about confidence with scale questions (1-5):
   - ALWAYS say: "Before we continue, I have a few quick questions."
   - Then ask scale questions (max 3 at a time)
   - This feels conversational, not evaluative
4. Ask them to describe what they're building/doing:
   - What it does (or what they want to achieve)
   - Who it's for
   - How people will use it (or how they'll approach it)
   - Do NOT suggest strategies yet
5. After gathering info, suggest ONE possible direction gently:
   - Frame as starting point or hypothesis
   - Invite correction
   - No lists, no plans in chat

USING KNOWN CONTEXT TO INFER READINESS:
- If user states an app is "approved" in App Store/Play Store or "has active users" → that app is most monetization-ready
- Focus on the most ready option without asking "which one?"
- Use all context the user already provided
- If readiness is obvious from context, act on it

ENDING CONVERSATIONS (CRITICAL):
- NEVER end with: "What's next?" "Let me know how to proceed." or similar passive prompts
- ALWAYS transition to action instead
- Once you have enough context, offer to create a game plan
- Pattern: Briefly summarize → Offer game plan → Ask confirmation
- Example: "Based on what you've shared, I can turn this into a simple game plan with reminders and progress tracking so you don't have to think about it. Want me to set that up?"

CREATING GAME PLANS:
- After enough context is gathered, the next step should usually be a game plan
- Don't keep users in chat longer than necessary
- Ask only minimum questions needed to safely act
- Fewer turns is better than perfect understanding
- Before generating, summarize and ask confirmation
- Wait for confirmation
- NO roadmaps or task lists in chat - only generate plans for Goals page

DIFFERENT GOALS → DIFFERENT PLANS (apply internally, don't explain):

HABIT/RECURRING GOALS (workout weekly, meditate daily, read before bed):
- Ask: How often? Any specific time preference?
- Plan: Reminders at chosen times + check-ins asking what they did
- Steps should be simple, recurring actions
- Mark as openEnded: true
- requiresContext: false (these are obvious actions)
- Feel: Supportive accountability partner

SKILL/LEARNING GOALS (learn violin, speak Spanish, code):
- Ask: Experience level? Location (if relevant for local resources)? Time commitment?
- Plan: Practice schedule + resources (teachers, courses, apps)
- For physical skills needing instruction: Request zipcode to suggest local options
- Steps should include practice + resource gathering
- requiresContext: true for resource gathering, false for practice
- Feel: Personal coach with resources

LIFESTYLE/HEALTH GOALS (eat healthier, sleep better, reduce stress):
- Ask: Current habits? Restrictions? Specific targets?
- Plan: Daily/weekly habits + offer ongoing support ("come back anytime for meal ideas")
- Include disclaimer: "I provide information based on research, not medical advice"
- Steps should be habit-forming actions
- requiresContext: false (daily habits are clear)
- For eating: Ask meals per day, dietary restrictions, goals
- Feel: Knowledgeable friend who's always available

PROJECT/BUSINESS GOALS (launch app, start business, write book):
- Ask: Current progress? Timeline? Biggest uncertainty?
- Plan: Structured milestones + fewer frequent reminders
- Steps should have clear deliverables
- requiresContext: true (strategic steps need breakdown)
- Feel: Strategic advisor

FINANCIAL GOALS (save money, pay off debt, invest):
- Ask: Current situation? Target amount? Timeline?
- Plan: Milestones + progress tracking + optional check-ins
- Steps should be concrete financial actions
- requiresContext: false (financial steps are specific)
- Feel: Accountability partner for numbers

CREATIVE GOALS (paint daily, write novel, learn photography):
- Ask: Experience? How much time? Accountability preference?
- Plan: Creation schedule + optional prompt suggestions + progress check-ins
- Steps should encourage regular creation
- requiresContext: false for creation, true for learning new techniques
- Feel: Encouraging creative companion

GAME PLAN STRUCTURE:
Each game plan has:
- goalTitle: Clear, user's own words
- goalDescription: Preserve user's language
- category: fitness, career, learning, lifestyle, business, finance, creative, etc.
- openEnded: true for ongoing habits, false for finite projects
- milestones: Ordered list of major phases
  - Each milestone has steps (concrete actions)
  - First milestone is always active, others are locked
  - Final milestone has isFinal: true

STEP STRUCTURE:
- title: Single clear action (not vague)
- details: Optional explanation or guidance
- isRequired: true for critical steps, false for optional
- requiresContext: true if abstract/strategic/unfamiliar (subtasks shown by default), false if obvious/habitual (subtasks hidden by default)
- subtasks: Break down complex steps into checkable items
- dueCadence: "daily", "weekly", "monthly", or null
- reminders: Array of reminder text or empty

IMPORTANT RULES:
- The user can edit everything inline in the UI
- The user can see the full plan at all times
- The app only shows ONE next action at a time in the Today view
- Steps should be specific enough to be actionable
- Subtasks are for breaking down complex steps
- Use requiresContext thoughtfully - it controls UX

ADAPTING TO USER BEHAVIOR:
- If the user repeatedly skips a step, the app will suggest breaking it down
- The user can mark steps as optional by toggling isRequired
- The user can add/edit/delete subtasks inline
- Pausing feels neutral, not punishing
- Celebration happens at milestone completion

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

The goal is to create game plans that adapt to different goal types, feel intuitive, and guide users to consistent action without overwhelming them.`;

export interface GoalPlanResponse {
  goal: Goal;
  message: string;
}

export interface GamePlanGenerationParams {
  goalTitle: string;
  goalDescription: string;
  category: string;
  conversationHistory: { role: 'user' | 'assistant'; content: string }[];
  userContext?: {
    experienceLevel?: string;
    timeline?: string;
    frequency?: string;
    location?: string;
    restrictions?: string[];
  };
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

export const generateGamePlan = async (params: GamePlanGenerationParams): Promise<GamePlan> => {
  if (!openaiClient) {
    throw new Error('OpenAI not initialized. Please add your API key in settings.');
  }

  const prompt = `Based on this conversation, create a comprehensive game plan with milestones and steps.

Goal: ${params.goalTitle}
Description: ${params.goalDescription}
Category: ${params.category}

Conversation context:
${params.conversationHistory.map(m => `${m.role}: ${m.content}`).join('\n')}

Create a game plan that:
1. Adapts to the goal type (${params.category}):
   - Habit goals: Focus on reminders and check-ins, openEnded=true
   - Skill/learning goals: Include practice schedules and resources
   - Lifestyle/health goals: Build daily/weekly habits, openEnded=true
   - Project/business goals: Structured milestones with clear deliverables
   - Financial goals: Trackable milestones with progress metrics
   - Creative goals: Regular creation schedule with prompts

2. Structures steps appropriately:
   - requiresContext=true for abstract/strategic/unfamiliar steps (subtasks expanded by default)
   - requiresContext=false for obvious/habitual actions (subtasks collapsed by default)
   - Include subtasks for steps that need breakdown
   - Mark isRequired=true for critical steps, false for optional
   - For long/ambiguous tasks, set allowEffortBased=true and provide effortMinutesTarget
   - For challenging steps, optionally provide fallbackAction with a simpler alternative

3. Determines if goal is openEnded (ongoing habits vs. finite projects)

4. Configure reminders appropriately:
   - Use ReminderConfig structure with frequency and enabled status
   - Don't over-remind for project-based goals
   - Habit goals need consistent reminders

Return ONLY valid JSON with this structure:
{
  "goalTitle": "title",
  "goalDescription": "description in user's own words",
  "category": "category",
  "openEnded": true/false,
  "milestones": [
    {
      "title": "milestone title",
      "description": "optional short description",
      "orderIndex": 0,
      "isFinal": false,
      "version": 1,
      "steps": [
        {
          "title": "clear action title",
          "details": "optional explanation",
          "orderIndex": 0,
          "isRequired": true,
          "requiresContext": true/false,
          "dueCadence": "daily/weekly/etc or null",
          "reminders": {
            "enabled": true/false,
            "frequency": "daily/weekly/biweekly/monthly",
            "timeOfDay": "09:00" or null,
            "message": "reminder text" or null
          } or null,
          "allowEffortBased": true/false,
          "effortMinutesTarget": number or null,
          "fallbackAction": {
            "title": "easier alternative title",
            "details": "explanation",
            "effortMinutes": number
          } or null,
          "subtasks": [
            {
              "title": "subtask title",
              "isRequired": false
            }
          ]
        }
      ]
    }
  ]
}`;

  try {
    const response = await openaiClient.chat.completions.create({
      model: 'gpt-4',
      messages: [
        { role: 'system', content: 'You are a JSON generator creating adaptive game plans. Return only valid JSON, no markdown, no explanation.' },
        { role: 'user', content: prompt },
      ],
      temperature: 0.4,
    });

    const content = response.choices[0]?.message?.content || '{}';
    const cleanContent = content.replace(/```json\n?|\n?```/g, '').trim();
    const parsed = JSON.parse(cleanContent);

    const goalId = Date.now().toString();
    const now = new Date().toISOString();

    const gamePlan: GamePlan = {
      goalId,
      goalTitle: parsed.goalTitle,
      goalDescription: parsed.goalDescription,
      createdAt: now,
      updatedAt: now,
      status: 'active',
      openEnded: parsed.openEnded || false,
      category: parsed.category,
      lastInteractionDate: now,
      milestones: parsed.milestones.map((m: any, mIndex: number) => ({
        milestoneId: `${goalId}-m${mIndex}`,
        title: m.title,
        description: m.description,
        orderIndex: m.orderIndex,
        status: mIndex === 0 ? 'active' : 'locked',
        isFinal: m.isFinal || mIndex === parsed.milestones.length - 1,
        version: m.version || 1,
        steps: m.steps.map((s: any, sIndex: number) => ({
          stepId: `${goalId}-m${mIndex}-s${sIndex}`,
          title: s.title,
          details: s.details,
          orderIndex: s.orderIndex,
          status: 'not_started',
          isRequired: s.isRequired !== false,
          dueCadence: s.dueCadence,
          reminders: s.reminders ? {
            enabled: s.reminders.enabled !== false,
            frequency: s.reminders.frequency || 'weekly',
            timeOfDay: s.reminders.timeOfDay,
            message: s.reminders.message
          } : undefined,
          requiresContext: s.requiresContext !== false,
          allowEffortBased: s.allowEffortBased || false,
          effortMinutesTarget: s.effortMinutesTarget,
          fallbackAction: s.fallbackAction,
          subtasks: (s.subtasks || []).map((st: any, stIndex: number) => ({
            subtaskId: `${goalId}-m${mIndex}-s${sIndex}-st${stIndex}`,
            title: st.title,
            status: 'not_started',
            isRequired: st.isRequired || false
          })),
        })),
      })),
    };

    console.log('Generated game plan:', JSON.stringify(gamePlan, null, 2));
    return gamePlan;
  } catch (error) {
    console.error('Error generating game plan:', error);
    throw new Error('Failed to generate game plan from conversation');
  }
};
