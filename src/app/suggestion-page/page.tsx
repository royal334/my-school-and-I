"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  CardFooter,
} from "@/components/ui/card";
import { toast } from "sonner";
import { ArrowLeft, Send, MessageSquare } from "lucide-react";
import Link from "next/link";

export default function SuggestionPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), 10_000);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitting(true);

    const formData = new FormData(e.currentTarget);
    const data = Object.fromEntries(formData.entries());

    // Add Web3Forms access key
    data.access_key = process.env.NEXT_PUBLIC_WEB3FORMS_ID || "";

    try {
      const response = await fetch("https://api.web3forms.com/submit", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(data),
        signal: controller.signal,
      });

      const result = await response.json();

      if (result.success) {
        setSubmitted(true);
        toast.success("Thank you for your feedback!", {
          position: "top-center",
        });
      } else {
        throw new Error(result.message || "Something went wrong");
      }
    } catch (error: any) {
          const message =
          error instanceof Error && error.name === "AbortError"
          ? "Request timed out. Please try again."
          : error instanceof Error
            ? error.message
            : "Failed to send feedback";
      toast.error(message,{
        position: "top-center",
      });
    } finally {
      setIsSubmitting(false);
      clearTimeout(timeoutId);
    }
  };

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md text-center py-12">
          <CardContent className="space-y-6">
            <div className="mx-auto w-16 h-16 bg-success-bg rounded-full flex items-center justify-center">
              <MessageSquare className="w-8 h-8 text-success" />
            </div>
            <div className="space-y-2">
              <CardTitle className="text-2xl">Feedback Received!</CardTitle>
              <CardDescription className="text-muted-foreground">
                Thank you for helping us improve CampusHub. We appreciate your
                input!
              </CardDescription>
            </div>
            <Link href="/dashboard" className="inline-block mt-4">
              <Button>Back to Dashboard</Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4 flex-col space-y-6 py-12">
      <div className="w-full max-w-md">
        <Link href="/dashboard">
          <Button
            variant="ghost"
            size="sm"
            className="text-muted-foreground hover:text-foreground p-0 hover:bg-transparent"
          >
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Dashboard
          </Button>
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">
            Suggestions & Feedback
          </CardTitle>
          <CardDescription className="text-muted-foreground">
            Tell us how we can make CampusHub better for you
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Name (Optional)</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Your name"
                  className="bg-muted"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email (Optional)</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="your@email.com"
                  className="bg-muted"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Subject</Label>
              <Input
                id="subject"
                name="subject"
                placeholder="What is this about?"
                required
                className="bg-muted"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="message">Your Message</Label>
              <Textarea
                id="message"
                name="message"
                placeholder="Describe your suggestion or feedback in detail..."
                required
                className="min-h-[150px] bg-muted resize-none"
              />
            </div>

            {/* Anti-spam/bot honeypot */}
            <input
              type="checkbox"
              name="botcheck"
              className="hidden"
              style={{ display: "none" }}
            />
          </CardContent>
          <CardFooter>
            <Button
              type="submit"
              className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-medium transition-all"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                "Sending..."
              ) : (
                <>
                  <Send className="w-4 h-4 mr-2" />
                  Submit Feedback
                </>
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <p className="text-center text-xs text-muted-foreground max-w-xs">
        Your feedback is directly sent to our management team for review. Thank
        you for being part of CampusHub.
      </p>
    </div>
  );
}
