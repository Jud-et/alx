"use client";
import { useState, FormEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField, FormLabel, FormMessage } from "@/components/ui/form";
import ProtectedRoute from "@/components/protected-route";
import { createPoll, CreatePollData } from "@/lib/actions";

export default function NewPollPage() {
  const [question, setQuestion] = useState("");
  const [description, setDescription] = useState("");
  const [options, setOptions] = useState<string[]>(["", ""]);
  const [expiresAt, setExpiresAt] = useState("");
  const [allowMultipleVotes, setAllowMultipleVotes] = useState(false);
  const [showResultsBeforeVoting, setShowResultsBeforeVoting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  function updateOption(index: number, value: string) {
    setOptions((prev) => prev.map((o, i) => (i === index ? value : o)));
  }

  function addOption() {
    setOptions((prev) => [...prev, ""]);
  }

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);

    setIsSubmitting(true);
    try {
      const pollData: CreatePollData = {
        question: question.trim(),
        description: description.trim() || undefined,
        options: options.map(o => o.trim()).filter(o => o.length > 0),
        expiresAt: expiresAt || undefined,
        allowMultipleVotes,
        showResultsBeforeVoting,
      };

      await createPoll(pollData);
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
                <FormLabel htmlFor="question">Poll Question *</FormLabel>
                <Textarea 
                  id="question" 
                  placeholder="What would you like to ask?"
                  value={question} 
                  onChange={(e) => setQuestion(e.target.value)} 
                  required 
                  className="min-h-[100px]"
                />
              </FormField>

              <FormField>
                <FormLabel htmlFor="description">Description (Optional)</FormLabel>
                <Textarea 
                  id="description" 
                  placeholder="Add more context about your poll..."
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  className="min-h-[80px]"
                />
              </FormField>
              
              <div className="space-y-3">
                <FormLabel>Poll Options *</FormLabel>
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
              </div>

              <div className="space-y-4 pt-4 border-t">
                <FormField>
                  <FormLabel htmlFor="expiresAt">Expiration Date (Optional)</FormLabel>
                  <Input 
                    id="expiresAt"
                    type="datetime-local"
                    value={expiresAt}
                    onChange={(e) => setExpiresAt(e.target.value)}
                  />
                </FormField>

                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <input
                      id="allowMultipleVotes"
                      type="checkbox"
                      checked={allowMultipleVotes}
                      onChange={(e) => setAllowMultipleVotes(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <FormLabel htmlFor="allowMultipleVotes" className="text-sm font-normal">
                      Allow multiple votes per user
                    </FormLabel>
                  </div>

                  <div className="flex items-center space-x-2">
                    <input
                      id="showResultsBeforeVoting"
                      type="checkbox"
                      checked={showResultsBeforeVoting}
                      onChange={(e) => setShowResultsBeforeVoting(e.target.checked)}
                      className="rounded border-gray-300"
                    />
                    <FormLabel htmlFor="showResultsBeforeVoting" className="text-sm font-normal">
                      Show results before voting
                    </FormLabel>
                  </div>
                </div>
              </div>

              <FormMessage>{error}</FormMessage>
              
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



