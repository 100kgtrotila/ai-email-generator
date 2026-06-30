'use client';

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQS = [
  {
    question: "Is MailGenius free to use?",
    answer:
      "Yes — creating an account and generating emails is completely free. You can generate emails, copy them to your clipboard, and save them to your personal history at no cost.",
  },
  {
    question: "How does the AI email generation work?",
    answer:
      "You provide a subject, choose a tone (Professional, Friendly, Casual, Formal, or Persuasive) and a length (Short, Medium, or Long), then add any additional context. Your request is sent securely to our server, which calls Google Gemini 2.5 Flash to compose the email and returns the result.",
  },
  {
    question: "Is my data secure?",
    answer:
      "Yes. Every request is authenticated via Firebase Auth — only you can access your own email history. Your API key never touches the client; generation happens exclusively on our server. We do not store your email content beyond your own Firestore collection.",
  },
  {
    question: "What tones are available?",
    answer:
      "MailGenius supports five tones: Professional (clear and structured), Friendly (warm and approachable), Formal (full titles, strict etiquette), Casual (relaxed and conversational), and Persuasive (value-led with a clear call to action).",
  },
  {
    question: "Can I edit or delete emails from my history?",
    answer:
      "You can delete any saved email directly from the History page. Editing is done by loading the original inputs back into the generator, adjusting them, and regenerating — giving you full control over the final result.",
  },
  {
    question: "Which AI model powers MailGenius?",
    answer:
      "MailGenius uses Google Gemini 2.5 Flash — Google's latest production model, optimized for speed and quality in structured text generation tasks like email drafting.",
  },
];

export function FaqAccordion() {
  return (
    <Accordion type="single" collapsible className="w-full space-y-2" id="faq-accordion">
      {FAQS.map((faq, idx) => (
        <AccordionItem
          key={idx}
          value={`faq-${idx}`}
          className="rounded-xl border border-border bg-card px-5 shadow-sm"
          id={`faq-item-${idx}`}
        >
          <AccordionTrigger className="text-left text-sm font-semibold text-foreground hover:no-underline py-4">
            {faq.question}
          </AccordionTrigger>
          <AccordionContent className="text-sm leading-relaxed text-muted-foreground pb-4">
            {faq.answer}
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  );
}
