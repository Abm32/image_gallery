import { createClient } from '@supabase/supabase-js';

const SLACK_API_ENDPOINT = 'https://slack.com/api';
const BOT_TOKEN = import.meta.env.VITE_SLACK_BOT_TOKEN;

const supabase = createClient(
  import.meta.env.VITE_SUPABASE_URL,
  import.meta.env.VITE_SUPABASE_ANON_KEY
);

export interface SlackCommunity {
  id: string;
  name: string;
  description: string;
  memberCount: number;
  isPrivate: boolean;
  iconUrl?: string;
  joinUrl?: string;
  platform: 'slack';
}

export async function searchSlackCommunities(query: string): Promise<SlackCommunity[]> {
  if (!query || query.length < 2) {
    return [];
  }

  try {
    const response = await fetch(`${SLACK_API_ENDPOINT}/conversations.list`, {
      headers: {
        'Authorization': `Bearer ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.error || 'Slack API error');
    }

    // Filter channels based on query
    const filteredChannels = data.channels.filter((channel: any) =>
      channel.name.toLowerCase().includes(query.toLowerCase()) ||
      (channel.purpose?.value || '').toLowerCase().includes(query.toLowerCase()) ||
      (channel.topic?.value || '').toLowerCase().includes(query.toLowerCase())
    );

    return filteredChannels.map((channel: any) => ({
      id: channel.id,
      name: channel.name,
      description: channel.purpose?.value || channel.topic?.value || `A Slack channel for ${channel.name}`,
      memberCount: channel.num_members || 0,
      isPrivate: Boolean(channel.is_private),
      iconUrl: channel.icons?.image_original,
      platform: 'slack' as const
    }));
  } catch (error) {
    console.error('Error searching Slack communities:', error);
    return [];
  }
}

export async function joinSlackCommunity(communityId: string): Promise<string | null> {
  try {
    const response = await fetch(`${SLACK_API_ENDPOINT}/conversations.invite`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${BOT_TOKEN}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        channel: communityId,
        users: [] // Add user IDs here
      })
    });

    const data = await response.json();
    
    if (!data.ok) {
      throw new Error(data.error || 'Failed to join channel');
    }

    return data.channel?.id || null;
  } catch (error) {
    console.error('Error joining Slack community:', error);
    return null;
  }
}