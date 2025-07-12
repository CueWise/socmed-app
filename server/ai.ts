import OpenAI from "openai";

const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface CaptionGenerationRequest {
  topic: string;
  platform: string;
  tone?: string;
  keywords?: string[];
}

export interface HashtagSuggestion {
  hashtags: string[];
  reasoning: string;
}

export interface ContentOptimization {
  optimizedContent: string;
  suggestions: string[];
  score: number;
}

// the newest OpenAI model is "gpt-4o" which was released May 13, 2024. do not change this unless explicitly requested by the user
export async function generateCaption(request: CaptionGenerationRequest): Promise<string> {
  const { topic, platform, tone = "professional", keywords = [] } = request;
  
  const prompt = `Generate a compelling social media caption for ${platform} about "${topic}". 
  Use a ${tone} tone. ${keywords.length > 0 ? `Include these keywords: ${keywords.join(", ")}` : ""}
  Make it engaging and platform-appropriate. Keep it concise but impactful.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [{ role: "user", content: prompt }],
    max_tokens: 200,
  });

  return response.choices[0].message.content || "";
}

export async function suggestHashtags(content: string, platform: string): Promise<HashtagSuggestion> {
  const prompt = `Analyze this social media content and suggest relevant hashtags for ${platform}: "${content}"
  
  Provide response in JSON format with:
  - hashtags: array of 8-12 relevant hashtags without the # symbol
  - reasoning: brief explanation of hashtag strategy
  
  Focus on trending, relevant, and platform-specific hashtags.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a social media expert. Provide hashtag suggestions in JSON format."
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function optimizeForEngagement(content: string, platform: string): Promise<ContentOptimization> {
  const prompt = `Optimize this social media content for maximum engagement on ${platform}: "${content}"

  Provide response in JSON format with:
  - optimizedContent: improved version of the content
  - suggestions: array of specific improvement recommendations
  - score: engagement potential score from 1-100

  Focus on engagement drivers like hooks, calls-to-action, emotional triggers, and platform best practices.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a social media optimization expert. Analyze and optimize content for engagement."
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function suggestBestPostingTime(platform: string, audienceTimezone: string = "UTC"): Promise<{
  recommendedTime: string;
  reasoning: string;
  alternativeTimes: string[];
}> {
  const prompt = `Suggest the best posting time for ${platform} content targeting audience in ${audienceTimezone} timezone.
  
  Provide response in JSON format with:
  - recommendedTime: best time in HH:MM format
  - reasoning: explanation of why this time is optimal
  - alternativeTimes: array of 2-3 alternative good times
  
  Base recommendations on platform-specific engagement patterns and best practices.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a social media timing expert. Provide optimal posting time recommendations."
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function generateContentIdeas(brand: string, industry: string, currentTrends: string[] = []): Promise<{
  ideas: Array<{
    title: string;
    description: string;
    platform: string;
    contentType: string;
  }>;
}> {
  const prompt = `Generate 5 creative content ideas for ${brand} in the ${industry} industry.
  ${currentTrends.length > 0 ? `Consider these current trends: ${currentTrends.join(", ")}` : ""}
  
  Provide response in JSON format with:
  - ideas: array of content ideas, each with title, description, platform, and contentType
  
  Make ideas diverse, engaging, and relevant to current social media trends.`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system",
        content: "You are a creative content strategist. Generate innovative social media content ideas."
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}

export async function checkBrandTone(content: string, brandGuidelines: string): Promise<{
  isOnBrand: boolean;
  score: number;
  feedback: string[];
  suggestions: string[];
}> {
  const prompt = `Check if this content aligns with the brand tone and guidelines: "${content}"
  
  Brand Guidelines: ${brandGuidelines}
  
  Provide response in JSON format with:
  - isOnBrand: boolean indicating if content matches brand guidelines
  - score: brand alignment score from 1-100
  - feedback: array of specific observations about brand alignment
  - suggestions: array of recommendations to improve brand alignment`;

  const response = await openai.chat.completions.create({
    model: "gpt-4o",
    messages: [
      {
        role: "system", 
        content: "You are a brand consistency expert. Analyze content for brand alignment."
      },
      { role: "user", content: prompt }
    ],
    response_format: { type: "json_object" },
  });

  return JSON.parse(response.choices[0].message.content || "{}");
}
