import { Flex, Image, Spinner, Text } from '@chakra-ui/react';
import { useWeather } from 'hooks/useWeather';
import { useEffect, useState } from 'react';

type alertType = {
  title: string;
  event: string;
  abbreviation: string[];
  desc: string;
  shortCap: string;
  severity: string;
  credit: string;
  start: string;
  end: string;
};

type sourceType = {
  coordinates: {
    lat: number;
    lon: number;
  };
  location: {
    Name: string;
    StateCode: string;
    CountryCode: string;
  };
};

type weatherData = {
  alerts: alertType[];
  temp: number;
  feels: number;
  cloudCover: number;
  uv: number;
  uvDescription: string;
  caption: string;
  icon: string;
  sourceData: sourceType;
};

export default function WeatherWidget() {
  const [weatherData, setWeatherData] = useState<weatherData>();

  const { data, isLoading, isFetching, error } = useWeather();

  function getWeatherIcon(iconID: number) {
    switch (iconID) {
      // Day
      case 1:
        return 'SunnyNightV3';
      case 2:
        return 'MostlySunnyDay';
      case 3:
        return 'PartlyCloudyDayV3';
      case 4:
        return 'MostlyCloudyDayV2';
      case 23:
        return 'RainShowersDayV2';

      // Night
      case 28:
        return 'ClearNightV3';
      case 29:
        return 'MostlyClearNight';
      case 31:
        return 'MostlyCloudyNightV2';
      case 50:
        return 'RainShowersNightV2';

      // Rain & Cloudy
      case 5:
        return 'CloudyV3';
      case 19 || 46: // 19 day, 46 night
        return 'LightRainV3';
      case 22 || 49: // 22 day, 49 night
        return 'ModerateRainV2';
      case 27:
        return 'ThunderstormV3';

      default:
        return 'CloudyV3';
    }
  }

  useEffect(() => {
    if (data) {
      const weather = data.responses[0].weather[0];
      const source = data.responses[0].source;

      setWeatherData({
        alerts: weather.alerts,
        temp: weather.current.temp,
        feels: weather.current.feels,
        cloudCover: weather.current.cloudCover,
        uv: weather.current.uv,
        uvDescription: weather.current.uvDesc,
        caption: weather.current.cap,
        icon: getWeatherIcon(weather.current.icon),
        sourceData: source,
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
            <>
              <Image
                width="28px"
                marginRight={1}
                src={`./assets/weather/${weatherData?.icon}.svg`}
              />
              <Text color="white" fontSize="2xl" textShadow="0 0 2px black">
                {error ? '-' : weatherData?.temp}
              </Text>
            </>
          )}

          <Text
            mt="2px"
            alignSelf="flex-start"
            color="white"
            fontSize="lg"
            textShadow="0 0 2px black"
          >
            {' '}
            °C
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
