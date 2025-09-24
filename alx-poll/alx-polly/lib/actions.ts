"use server";

import { createServerSupabaseClient } from "@/lib/supabase-server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

export interface CreatePollData {
  question: string;
  description?: string;
  options: string[];
  expiresAt?: string;
  allowMultipleVotes?: boolean;
  showResultsBeforeVoting?: boolean;
}

export async function createPoll(formData: CreatePollData) {
  const supabase = await createServerSupabaseClient();
  
  // Get current user
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("You must be logged in to create a poll");
  }

  // Validate inputs
  if (!formData.question?.trim()) {
    throw new Error("Question is required");
  }
  
  if (!formData.options || formData.options.length < 2) {
    throw new Error("At least two options are required");
  }
  
  // Remove empty options and check for duplicates
  const validOptions = formData.options
    .map(opt => opt.trim())
    .filter(opt => opt.length > 0);
    
  if (validOptions.length < 2) {
    throw new Error("At least two valid options are required");
  }
  
  const uniqueOptions = Array.from(new Set(validOptions.map(opt => opt.toLowerCase())));
  if (uniqueOptions.length !== validOptions.length) {
    throw new Error("Options must be unique");
  }

  try {
    const { data, error } = await supabase
      .from("polls")
      .insert({
        question: formData.question.trim(),
        description: formData.description?.trim() || null,
        options: validOptions,
        created_by: user.id,
        expires_at: formData.expiresAt ? new Date(formData.expiresAt).toISOString() : null,
        allow_multiple_votes: formData.allowMultipleVotes || false,
        show_results_before_voting: formData.showResultsBeforeVoting || false,
      })
      .select("id")
      .single();

    if (error) {
      throw new Error(error.message);
    }

    if (!data?.id) {
      throw new Error("Failed to create poll");
    }

    // Revalidate the polls page to show the new poll
    revalidatePath("/polls");
    
    // Redirect to the new poll
    redirect(`/polls/${data.id}`);
    
  } catch (error) {
    console.error("Error creating poll:", error);
    throw error;
  }
}

export async function getPolls() {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("You must be logged in to view polls");
  }

  try {
    const { data, error } = await supabase
      .from("polls")
      .select(`
        id,
        question,
        description,
        created_at,
        expires_at,
        is_active,
        allow_multiple_votes,
        show_results_before_voting,
        created_by
      `)
      .eq("is_active", true)
      .order("created_at", { ascending: false });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching polls:", error);
    throw error;
  }
}

export async function getPollById(pollId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("You must be logged in to view polls");
  }

  try {
    const { data, error } = await supabase
      .from("polls")
      .select(`
        id,
        question,
        description,
        options,
        created_at,
        expires_at,
        is_active,
        allow_multiple_votes,
        show_results_before_voting,
        created_by
      `)
      .eq("id", pollId)
      .eq("is_active", true)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        throw new Error("Poll not found");
      }
      throw new Error(error.message);
    }

    return data;
  } catch (error) {
    console.error("Error fetching poll:", error);
    throw error;
  }
}

export async function voteOnPoll(pollId: string, selectedOption: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("You must be logged in to vote");
  }

  try {
    // Check if user can vote
    const { data: canVote, error: canVoteError } = await supabase
      .rpc('can_user_vote', { poll_uuid: pollId, user_uuid: user.id });

    if (canVoteError) {
      throw new Error(canVoteError.message);
    }

    if (!canVote) {
      throw new Error("You cannot vote on this poll");
    }

    // Insert or update vote
    const { error } = await supabase
      .from("votes")
      .upsert({
        poll_id: pollId,
        user_id: user.id,
        selected_option: selectedOption,
      }, {
        onConflict: 'poll_id,user_id'
      });

    if (error) {
      throw new Error(error.message);
    }

    // Revalidate the poll page to show updated results
    revalidatePath(`/polls/${pollId}`);
    
  } catch (error) {
    console.error("Error voting on poll:", error);
    throw error;
  }
}

export async function getPollResults(pollId: string) {
  const supabase = await createServerSupabaseClient();
  
  const { data: { user }, error: authError } = await supabase.auth.getUser();
  
  if (authError || !user) {
    throw new Error("You must be logged in to view poll results");
  }

  try {
    const { data, error } = await supabase
      .rpc('get_poll_results', { poll_uuid: pollId });

    if (error) {
      throw new Error(error.message);
    }

    return data || [];
  } catch (error) {
    console.error("Error fetching poll results:", error);
    throw error;
  }
}
