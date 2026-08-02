import { Router, type IRouter } from "express";
import OpenAI from "openai";
import { GenerateResourceBody, GenerateResourceResponse } from "@workspace/api-zod";

const router: IRouter = Router();

function getOpenAIClient(): OpenAI {
  if (!process.env.OPENAI_API_KEY) {
    throw new Error("OPENAI_API_KEY is not configured");
  }
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

function buildPrompt(data: {
  resourceType: string;
  subject: string;
  yearLevel: string;
  topic: string;
  learningObjectives?: string;
  duration?: string;
  difficulty?: string;
  additionalInstructions?: string;
}): string {
  const resourceTypeFormatGuide: Record<string, string> = {
    "Lesson Plan": `Create a comprehensive lesson plan with the following sections:
- Learning Objectives (aligned with Australian Curriculum V9)
- Materials and Resources Needed
- Lesson Overview / Introduction (Hook activity)
- Main Body (Step-by-step teaching sequence with timing)
- Guided Practice Activities
- Independent Practice
- Differentiation Strategies (for students who need extension and support)
- Assessment / Checking for Understanding
- Closure / Lesson Wrap-up
- Homework / Extension (if applicable)`,

    "Worksheet": `Create an engaging student worksheet with the following sections:
- Clear Title and Instructions
- Warm-Up Activity (2-3 easy questions)
- Main Activities (6-8 progressively challenging questions/tasks)
- Extension Challenge (for advanced students)
- Reflection Question
Include a mix of question types: multiple choice, short answer, fill-in-the-blank, and open-ended questions where appropriate.`,

    "Assessment": `Create a comprehensive assessment with:
- Clear Assessment Title and Instructions
- Marking Criteria / Rubric
- Section A: Knowledge and Understanding (multiple choice or true/false, 10 questions)
- Section B: Application (short answer questions, 4-5 questions)
- Section C: Analysis and Evaluation (extended response, 1-2 questions)
- Total marks clearly indicated
- Time allocation suggestion`,

    "Classroom Activity": `Design an engaging classroom activity with:
- Activity Overview and Purpose
- Learning Outcomes (linked to Australian Curriculum V9)
- Time Required
- Materials Needed
- Preparation Instructions for Teacher
- Step-by-Step Activity Instructions
- Discussion Prompts / Debrief Questions
- Differentiation Options
- Assessment Suggestions`,

    "PowerPoint Outline": `Create a detailed PowerPoint presentation outline with:
- Slide 1: Title Slide (title, subject, year level)
- Slide 2: Learning Objectives (dot points)
- Slide 3-4: Prior Knowledge / Warm-Up
- Slides 5-10: Main Content (key concepts with suggested visuals, diagrams, and examples)
- Slides 11-12: Practice Activities / Class Discussion
- Slide 13: Summary / Key Takeaways
- Slide 14: Assessment / Exit Ticket
- Slide 15: Homework / Next Steps
For each slide, specify: title, dot-point content, and suggested visuals or teacher notes.`,

    "Curriculum Planner": `Create a detailed curriculum planning document with:
- Unit Overview (3-4 week unit)
- Curriculum Links (Australian Curriculum V9 content descriptions and elaborations)
- Essential Questions
- Learning Objectives / Outcomes
- Week-by-Week Overview with lesson topics
- Key Assessment Tasks with due dates
- Resources and Materials List
- Differentiation Strategies across the unit
- Cross-curriculum Priorities and General Capabilities addressed`,
  };

  const formatGuide = resourceTypeFormatGuide[data.resourceType] || `Create a well-structured ${data.resourceType} with clear headings, logical flow, and engaging content.`;

  let prompt = `You are an experienced Australian teacher with deep expertise in the Australian Curriculum Version 9. 
Create a professional, high-quality ${data.resourceType} for the following details:

**Subject:** ${data.subject}
**Year Level:** ${data.yearLevel}
**Topic:** ${data.topic}`;

  if (data.learningObjectives) {
    prompt += `\n**Learning Objectives:** ${data.learningObjectives}`;
  }
  if (data.duration) {
    prompt += `\n**Duration:** ${data.duration}`;
  }
  if (data.difficulty) {
    prompt += `\n**Difficulty Level:** ${data.difficulty}`;
  }
  if (data.additionalInstructions) {
    prompt += `\n**Additional Instructions:** ${data.additionalInstructions}`;
  }

  prompt += `\n\n${formatGuide}

**Important guidelines:**
- Align all content with Australian Curriculum Version 9
- Use Australian English spelling and terminology
- Make content age-appropriate for ${data.yearLevel} students
- Ensure activities are engaging, practical, and educationally sound
- Include clear headings and subheadings for easy navigation
- Be specific and detailed — this should be ready to use in the classroom immediately

Please create the ${data.resourceType} now:`;

  return prompt;
}

function generateTitle(data: {
  resourceType: string;
  subject: string;
  yearLevel: string;
  topic: string;
}): string {
  return `${data.resourceType}: ${data.topic} — ${data.subject} ${data.yearLevel}`;
}

router.post("/generate", async (req, res): Promise<void> => {
  if (!req.isAuthenticated()) {
    res.status(401).json({ error: "Unauthorized" });
    return;
  }

  const parsed = GenerateResourceBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  try {
    const openai = getOpenAIClient();
    const prompt = buildPrompt(parsed.data);
    const title = generateTitle(parsed.data);

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: prompt,
        },
      ],
      max_tokens: 4000,
      temperature: 0.7,
    });

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      res.status(500).json({ error: "AI generation returned empty response" });
      return;
    }

    res.json(GenerateResourceResponse.parse({ content, title }));
  } catch (err) {
    req.log.error({ err }, "AI generation failed");
    if (err instanceof Error && err.message.includes("OPENAI_API_KEY")) {
      res.status(500).json({ error: "OpenAI API key not configured" });
    } else {
      res.status(500).json({ error: "AI generation failed. Please try again." });
    }
  }
});

export default router;
