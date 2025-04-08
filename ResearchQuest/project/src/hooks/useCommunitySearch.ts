import { useState, useEffect, useCallback } from 'react';
import { searchDiscordCommunities, DiscordCommunity } from '../api/discord';
import { searchSlackCommunities, SlackCommunity } from '../api/slack';
import { searchRedditCommunities, RedditCommunity } from '../api/reddit';

export type Platform = 'discord' | 'slack' | 'reddit';
export type Community = DiscordCommunity | SlackCommunity | RedditCommunity;

interface SearchError {
  platform: Platform;
  message: string;
}

export function useCommunitySearch(
  query: string, 
  platforms: Platform[] = ['discord', 'slack', 'reddit']
) {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<SearchError[]>([]);

  const searchPlatform = useCallback(async (platform: Platform, query: string) => {
    try {
      switch (platform) {
        case 'discord':
          return await searchDiscordCommunities(query);
        case 'slack':
          return await searchSlackCommunities(query);
        case 'reddit':
          return await searchRedditCommunities(query);
        default:
          return [];
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      throw new Error(`${platform} search failed: ${errorMessage}`);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    const minQueryLength = 2;

    async function searchCommunities() {
      if (!query || query.length < minQueryLength) {
        setCommunities([]);
        setErrors([]);
        return;
      }

      setLoading(true);
      setErrors([]);

      const results: Community[] = [];
      const newErrors: SearchError[] = [];

      await Promise.all(
        platforms.map(async (platform) => {
          try {
            const platformResults = await searchPlatform(platform, query);
            if (isMounted && Array.isArray(platformResults)) {
              results.push(...platformResults);
            }
          } catch (err) {
            const message = err instanceof Error ? err.message : 'Unknown error';
            newErrors.push({ platform, message });
          }
        })
      );

      if (isMounted) {
        setCommunities(results);
        setErrors(newErrors);
        setLoading(false);
      }
    }

    const debounceTimeout = setTimeout(searchCommunities, 300);

    return () => {
      isMounted = false;
      clearTimeout(debounceTimeout);
    };
  }, [query, platforms.join(','), searchPlatform]);

  const error = errors.length > 0 
    ? errors.map(err => err.message).join('; ')
    : null;

  return { 
    communities, 
    loading, 
    error,
    errors
  };
}