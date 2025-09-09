"use client";
import { useParams } from "next/navigation";
import { notFound } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/protected-route";

const MOCK = {
  "1": {
    question: "What's your favorite programming language?",
    options: ["JavaScript", "Python", "Go", "Rust"],
  },
  "2": {
    question: "Tabs or spaces?",
    options: ["Tabs", "Spaces"],
  },
};

export default function PollDetailPage() {
  const params = useParams();
  const poll = MOCK[params.id as keyof typeof MOCK];
  if (!poll) return notFound();

  return (
    <ProtectedRoute>
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto p-6">
        <div className="mb-6">
          <Button variant="ghost" asChild>
            <a href="/polls">← Back to Polls</a>
          </Button>
        </div>
        
        <Card className="shadow-lg">
          <CardHeader className="text-center">
            <CardTitle className="text-2xl">{poll.question}</CardTitle>
            <CardDescription>Select your preferred option below</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {poll.options.map((opt, index) => (
              <Button 
                key={opt} 
                variant="outline" 
                className="w-full justify-start h-12 text-left hover:bg-primary hover:text-primary-foreground transition-colors"
                onClick={() => {
                  // TODO: Handle vote submission
                  alert(`You voted for: ${opt}`);
                }}
              >
                <span className="mr-3 text-sm font-medium text-muted-foreground">
                  {String.fromCharCode(65 + index)}
                </span>
                {opt}
              </Button>
            ))}
          </CardContent>
          <CardFooter className="text-center">
            <p className="text-sm text-muted-foreground">
              Click on an option to cast your vote
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
    </ProtectedRoute>
  );
}



