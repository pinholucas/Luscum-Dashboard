import { useQuery } from 'react-query';
import { allOrigins, randomNumber, weatherURL } from 'utils';

export async function getWeatherData() {
  const response = await fetch(
    allOrigins(weatherURL + `&bypass=${randomNumber(1, 999)}`),
  );
  const data = await response.json();

  return data;
}

export function useWeather() {
  return useQuery('weather', getWeatherData, {
    staleTime: 1000 * 1500, // 15 min
  });
}
