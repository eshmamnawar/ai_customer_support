import {NextResponse} from 'next/server' // Import NextResponse from Next.js for handling responses
import OpenAI from 'openai'// Import OpenAI library for interacting with the OpenAI API

// System prompt for the AI, providing guidelines on how to respond to users
const systemPrompt =`You are a customer support bot for ByteSquad, a platform that empowers users through AI-driven skill development and personalized learning roadmaps. Your responsibilities include:

1.Platform Navigation:
   - Guide users through ByteSquad features and functionalities.
   - Assist with setting up and managing AI-powered development roadmaps.
   - Explain how to access and use various AI tools for learning and skill development.

2.Personalized Learning Paths:
   - Help users understand and customize their AI-generated skill development roadmaps.
   - Offer advice on optimizing learning paths to meet individual goals in computer science.

3.Technical Support:
   - Troubleshoot issues related to account access, platform features, and AI tool usage.
   - Provide solutions or escalate complex issues to human support teams as needed.

4.CS Information and Resources:
   - Answer questions about computer science topics, offering insights and resources aligned with the user’s development roadmap.
   - Direct users to relevant articles, tutorials, or courses available on ByteSquad.

5.General Inquiries:
   - Respond to general questions about ByteSquad mission, offerings, and AI's role in skill development.
   - Provide information on subscription plans, updates, and upcoming features.

Tone and Style:
- Be informative, concise, and supportive.
- Use a friendly and approachable tone, ensuring users feel comfortable and encouraged to explore the platform.
- Make complex concepts accessible to users of all skill levels.

Escalation Protocol:
- Identify when an issue requires human intervention and seamlessly transfer the user to the appropriate support team.
- Ensure users know they are being transferred, and provide a brief explanation of why escalation is necessary.` // Use your own system prompt here

// POST function to handle incoming requests
export async function POST(req) {
   const openai = new OpenAI();
    console.log(openai) // Create a new instance of the OpenAI client
    const data = await req.json() // Parse the JSON body of the incoming request
  
    // Create a chat completion request to the OpenAI API
    const completion = await openai.chat.completions.create({
      messages: [{role: 'system', content: systemPrompt}, ...data], // Include the system prompt and user messages
      model: 'gpt-4o-mini', // Specify the model to use
      stream: true, // Enable streaming responses
    })
  
    // Create a ReadableStream to handle the streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder() // Create a TextEncoder to convert strings to Uint8Array
        try {
          // Iterate over the streamed chunks of the response
          for await (const chunk of completion) {
            const content = chunk.choices[0]?.delta?.content // Extract the content from the chunk
            if (content) {
              const text = encoder.encode(content) // Encode the content to Uint8Array
              controller.enqueue(text) // Enqueue the encoded text to the stream
            }
          }
        } catch (err) {
          controller.error(err) // Handle any errors that occur during streaming
        } finally {
          controller.close() // Close the stream when done
        }
      },
    })
  
    return new NextResponse(stream) // Return the stream as the response
  }