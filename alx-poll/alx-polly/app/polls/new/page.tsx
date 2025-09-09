"use client";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormLabel, FormMessage } from "@/components/ui/form";
import ProtectedRoute from "@/components/protected-route";
import { useAuth } from "@/lib/auth-context";
import { useRouter } from "next/navigation";

export default function NewPollPage() {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { supabase, session } = useAuth();
  const router = useRouter();

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    const trimmedQuestion = question.trim();
    const trimmedOptions = options.map((o) => o.trim()).filter((o) => o.length > 0);

    if (trimmedQuestion.length === 0) {
      setError("Question is required");
      return;
    }
    if (trimmedOptions.length < 2) {
      setError("Provide at least two options");
      return;
    }
    const unique = Array.from(new Set(trimmedOptions.map((o) => o.toLowerCase())));
    if (unique.length !== trimmedOptions.length) {
      setError("Options must be unique");
      return;
    }
    if (!session?.user) {
      setError("You must be logged in");
      return;
    }

    setIsSubmitting(true);
    try {
      // Assumes a Supabase table `polls` with columns: id (uuid, default gen),
      // question (text), options (json or text[]), created_by (uuid)
      const { data, error } = await supabase
        .from("polls")
        .insert({
          question: trimmedQuestion,
          options: trimmedOptions,
          created_by: session.user.id,
        })
        .select("id")
        .single();

      if (error) {
        setError(error.message);
        return;
      }

      if (data?.id) {
        // If detail page expects existing data from DB, navigate there; otherwise go back to list
        router.push(`/polls/${data.id}`);
      } else {
        router.push("/polls");
      }
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-foreground mb-2">Create New Poll</h1>
          <p className="text-muted-foreground">Ask a question and let people vote on the options</p>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-xl">Poll Details</CardTitle>
            <CardDescription>Fill in the question and options for your poll</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-6">
              <FormField>
                <FormLabel htmlFor="question">Poll Question</FormLabel>
                <Textarea 
                  id="question" 
                  placeholder="What would you like to ask?"
                  value={question} 
                  onChange={(e) => setQuestion(e.target.value)} 
                  required 
                  className="min-h-[100px]"
                />
              </FormField>
              
              <div className="space-y-3">
                <FormLabel>Poll Options</FormLabel>
                {options.map((opt, i) => (
                  <div key={i} className="flex gap-2">
                    <Input 
                      placeholder={`Option ${i + 1}`} 
                      value={opt} 
                      onChange={(e) => updateOption(i, e.target.value)} 
                      required 
                    />
                    {options.length > 2 && (
                      <Button 
                        type="button" 
                        variant="ghost" 
                        size="sm"
                        onClick={() => setOptions(prev => prev.filter((_, idx) => idx !== i))}
                      >
                        Remove
                      </Button>
                    )}
                  </div>
                ))}
                <Button 
                  type="button" 
                  variant="secondary" 
                  onClick={addOption}
                  className="w-full"
                >
                  + Add Option
                </Button>
                <FormMessage>{error}</FormMessage>
              </div>
              
              <div className="flex gap-3 pt-4">
                <Button type="submit" size="lg" className="flex-1" disabled={isSubmitting}>
                  Create Poll
                </Button>
                <Button type="button" variant="ghost" size="lg" asChild>
                  <a href="/polls">Cancel</a>
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  );
}



