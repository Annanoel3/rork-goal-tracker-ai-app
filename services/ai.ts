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
  const envApiKey = process.env.OPENAI_API_KEY;
  const storedApiKey = await AsyncStorage.getItem(API_KEY_STORAGE);
  const apiKey = envApiKey || storedApiKey;
  
  if (apiKey) {
    openaiClient = new OpenAI({
      apiKey,
      dangerouslyAllowBrowser: true,
    });
    return true;
  }
  return false;
};

export const isOpenAIInitialized = () => openaiClient !== null;

const SYSTEM_PROMPT = `You are an enthusiastic and supportive AI goal coach. Your role is to:
1. Help users define clear, achievable goals
2. Break down goals into actionable steps with realistic timeframes
3. Ask clarifying questions to understand the user's commitment level, available time, and resources
4. Create detailed game plans with specific milestones
5. Be encouraging and motivating
6. Adapt your approach based on the user's responses

When creating a goal plan, always include:
- A clear title and description
- A realistic timeframe (start date, end date, duration)
- 5-10 specific, actionable steps
- Each step should have a clear outcome
- Appropriate difficulty progression

Keep your responses conversational, warm, and motivating. Use emojis occasionally to add personality.`;

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
