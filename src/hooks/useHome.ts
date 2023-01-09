import { NTPType } from 'entities';
import { useQuery } from 'react-query';
import { backgroundDataURL } from 'utils';

export async function getHomeData(): Promise<NTPType> {
  const response = await fetch(backgroundDataURL);
  const data = await response.json();

  return data;
}

export function useHome() {
  return useQuery('home', getHomeData, {
    staleTime: 1000 * 60 * 60 * 24, // 24 hours
  });
}
