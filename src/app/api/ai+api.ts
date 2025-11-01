import OpenAi from "openai";

const openai = new OpenAi({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: Request) {
  const { exerciseName } = await request.json();
  if (!exerciseName) {
    return new Response("Exercise name is required", { status: 400 });
  }
  const prompt = `
You are a fitness coach.
You are given an exercise, provide clear instructions on how to perform the exercise. Include if any equipment is required.
Explain the exercise in detail and for a beginner.

The exercise name is: ${exerciseName}

Keep it short and concise. Use markdown formatting.

Use the following format:

## Equipment Required

## Instructions

### Tips

### Variations

### Safety

keep spacing between the headings and the content.

Always use headings and subheadings.`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: prompt,
        },
      ],
    });
    console.log("OpenAI response:", response);
    return Response.json({ result: response.choices[0].message?.content });
  } catch (error) {
    console.error("Error generating exercise instructions:", error);
    return new Response("Error generating exercise instructions", {
      status: 500,
    });
  }
}
