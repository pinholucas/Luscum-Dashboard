import { Flex, Spinner, Text } from '@chakra-ui/react';
import { useWeather } from 'hooks/useWeather';
import { useEffect, useState } from 'react';

type weatherData = {
  temp: number;
  feels: number;
  cloudCover: number;
  uv: number;
  uvDescription: string;
  caption: string;
};

export default function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<weatherData>();

  const { data, isLoading, isFetching, error } = useWeather();

  useEffect(() => {
    if (data) {
      const weather = data.responses[0].weather[0].current;

      setWeatherData({
        temp: weather.temp,
        feels: weather.feels,
        cloudCover: weather.cloudCover,
        uv: weather.uv,
        uvDescription: weather.uvDesc,
        caption: weather.caption,
      });
    }
  }, [isLoading, data]);

  return (
    <Flex position="absolute" top={4} left={4} alignItems="center">
      {isLoading && <Spinner color="white" />}

      {!isLoading && (
        <Flex alignItems="center">
          {isFetching ? (
            <Spinner color="white" size="sm" />
          ) : (
            <Text color="white" fontSize="2xl">
              {error ? '-' : weatherData?.temp}
            </Text>
          )}

          <Text mt="2px" alignSelf="flex-start" color="white" fontSize="lg">
            {' '}
            °C
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
