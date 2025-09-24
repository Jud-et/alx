import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ProtectedRoute from "@/components/protected-route";
import { getPolls } from "@/lib/actions";

export default async function PollsListPage() {
  let polls: any[] = [];
  let error: string | null = null;

  try {
    polls = await getPolls();
  } catch (err) {
    error = (err as Error).message;
  }

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

          {error && (
            <Card className="mb-6 border-destructive">
              <CardContent className="p-4">
                <p className="text-destructive">Error loading polls: {error}</p>
              </CardContent>
            </Card>
          )}

          <div className="grid gap-4">
            {polls.map((poll) => (
              <Card
                key={poll.id}
                className="hover:shadow-md transition-shadow cursor-pointer"
              >
                <CardContent className="p-6">
                  <Link href={`/polls/${poll.id}`} className="block">
                    <CardHeader className="p-0 mb-2">
                      <CardTitle className="text-lg font-medium text-card-foreground hover:text-primary transition-colors">
                        {poll.question}
                      </CardTitle>
                      {poll.description && (
                        <CardDescription className="text-sm text-muted-foreground mt-1">
                          {poll.description}
                        </CardDescription>
                      )}
                    </CardHeader>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>
                        {new Date(poll.created_at).toLocaleDateString()}
                      </span>
                      <span>
                        {poll.options?.length || 0} options
                      </span>
                    </div>
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>

          {polls.length === 0 && !error && (
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



