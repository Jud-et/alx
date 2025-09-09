"use client";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProtectedRoute from "@/components/protected-route";

export default function PollsListPage() {
  // Placeholder list
  const polls = [
    { id: "1", question: "What's your favorite programming language?" },
    { id: "2", question: "Tabs or spaces?" },
  ];

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="max-w-4xl mx-auto p-6">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground mb-2">
              Polls Dashboard
            </h1>
            <p className="text-muted-foreground">
              Create and participate in polls
            </p>
          </div>

          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Polls</h2>
            <Button asChild size="lg">
              <Link href="/polls/new">+ Create New Poll</Link>
            </Button>
          </div>

          <div className="grid gap-4">
            {polls.map((p) => (
              <Card
                key={p.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-6">
                  <Link href={`/polls/${p.id}`} className="block">
                    <h3 className="text-lg font-medium text-card-foreground hover:text-primary transition-colors">
                      {p.question}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                      Click to view and vote
                    </p>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {polls.length === 0 && (
            <Card className="text-center py-12">
              <CardContent>
                <h3 className="text-lg font-medium text-muted-foreground mb-2">
                  No polls yet
                </h3>
                <p className="text-muted-foreground mb-4">
                  Be the first to create a poll!
                </p>
                <Button asChild>
                  <Link href="/polls/new">Create your first poll</Link>
                </Button>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}



