import { invokeLLM } from "./llm";

export interface EmailTemplate {
  subject: string;
  body: string;
  html: string;
}

export async function generateWelcomeEmail(
  userName: string,
  planName: string
): Promise<EmailTemplate> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an email marketing expert. Generate professional welcome emails for SaaS onboarding.",
      },
      {
        role: "user",
        content: `Generate a welcome email for a new user named "${userName}" who just subscribed to the "${planName}" plan of ConversaAI.Cloud. 
        
        The email should:
        1. Welcome them warmly
        2. Explain what they can do with the platform
        3. Provide a link to get started (use {{dashboardUrl}})
        4. Offer support contact
        
        Return JSON with: { "subject": "...", "body": "..." }`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "email_template",
        strict: true,
        schema: {
          type: "object",
          properties: {
            subject: { type: "string", description: "Email subject line" },
            body: { type: "string", description: "Plain text email body" },
          },
          required: ["subject", "body"],
          additionalProperties: false,
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to generate email template");

  const contentStr = typeof content === "string" ? content : "";
  const parsed = JSON.parse(contentStr);

  return {
    subject: parsed.subject,
    body: parsed.body,
    html: `<html><body><p>${parsed.body.replace(/\n/g, "</p><p>")}</p></body></html>`,
  };
}

export async function generateOnboardingSequence(
  userName: string,
  planName: string
): Promise<EmailTemplate[]> {
  const response = await invokeLLM({
    messages: [
      {
        role: "system",
        content:
          "You are an email marketing expert specializing in SaaS onboarding sequences.",
      },
      {
        role: "user",
        content: `Create a 3-email onboarding sequence for a new ConversaAI.Cloud user named "${userName}" on the "${planName}" plan.
        
        Email 1: Welcome & Getting Started (Day 1)
        Email 2: First Steps Tutorial (Day 3)
        Email 3: Success Tips & Support (Day 7)
        
        Each email should be professional, helpful, and include a call-to-action.
        
        Return JSON array with: [{ "subject": "...", "body": "..." }, ...]`,
      },
    ],
    response_format: {
      type: "json_schema",
      json_schema: {
        name: "onboarding_sequence",
        strict: true,
        schema: {
          type: "array",
          items: {
            type: "object",
            properties: {
              subject: { type: "string" },
              body: { type: "string" },
            },
            required: ["subject", "body"],
            additionalProperties: false,
          },
        },
      },
    },
  });

  const content = response.choices[0]?.message?.content;
  if (!content) throw new Error("Failed to generate onboarding sequence");

  const contentStr = typeof content === "string" ? content : "";
  const parsed = JSON.parse(contentStr);

  return parsed.map(
    (email: { subject: string; body: string }) => ({
      subject: email.subject,
      body: email.body,
      html: `<html><body><p>${email.body.replace(/\n/g, "</p><p>")}</p></body></html>`,
    })
  );
}

export async function sendEmail(
  to: string,
  subject: string,
  body: string,
  html?: string
): Promise<boolean> {
  try {
    // In production, integrate with SendGrid, AWS SES, or similar
    console.log(`[Email] Sending to ${to}`);
    console.log(`[Email] Subject: ${subject}`);
    console.log(`[Email] Body: ${body}`);

    // For now, just log the email
    // In production, call your email service API here
    return true;
  } catch (error) {
    console.error("[Email] Failed to send:", error);
    return false;
  }
}

export async function scheduleOnboardingEmails(
  userId: number,
  userEmail: string,
  userName: string,
  planName: string
): Promise<void> {
  try {
    const sequence = await generateOnboardingSequence(userName, planName);

    // Schedule emails at different times
    const delays = [0, 3 * 24 * 60 * 60 * 1000, 7 * 24 * 60 * 60 * 1000]; // 0, 3, 7 days

    sequence.forEach((email, index) => {
      setTimeout(() => {
        sendEmail(userEmail, email.subject, email.body, email.html).catch(
          console.error
        );
      }, delays[index]);
    });

    console.log(
      `[Email] Scheduled ${sequence.length} onboarding emails for user ${userId}`
    );
  } catch (error) {
    console.error("[Email] Failed to schedule onboarding:", error);
  }
}
