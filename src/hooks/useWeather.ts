import { useQuery } from 'react-query';
import { allOrigins, getWeatherURL } from 'utils';

type alertType = {
  title: string;
  event: string;
  abbreviation: string[];
  desc: string;
  shortCap: string;
  severity: string;
  safetyGuide: string;
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

export type weatherType = {
  alerts: alertType[];
  temp: number;
  feels: number;
  cloudCover: number;
  visibility: number;
  umidity: number;
  dewPoint: number;
  uv: number;
  uvDescription: string;
  windSpeed: number;
  windDirection: number;
  caption: string;
  icon: string;
  nowCasting: string;
  sourceData: sourceType;
};

function getWeatherIcon(iconID: number) {
  switch (iconID) {
    // Day
    case 1:
      return 'SunnyDayV3';
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
    case 19: // day
    case 46: // night
      return 'LightRainV3';
    case 22: // day
    case 49: // night
      return 'ModerateRainV2';
    case 27:
      return 'ThunderstormV3';

    default:
      return 'CloudyV3';
  }
}

function formatDate(date: string) {
  return new Date(date).toLocaleDateString('pt-BR', {
    weekday: 'long',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export async function getWeatherData(): Promise<weatherType> {
  const response = await fetch(allOrigins(getWeatherURL()));
  const data = await response.json();

  const weather = data.responses[0].weather[0];
  const source = data.responses[0].source;

  const alerts = weather.alerts.map((alert: alertType) => {
    return {
      title: alert.title,
      event: alert.event,
      abbreviation: alert.abbreviation,
      desc: alert.desc,
      shortCap: alert.shortCap,
      severity: alert.severity,
      credit: alert.credit,
      safetyGuide: alert.safetyGuide,
      start: formatDate(alert.start),
      end: formatDate(alert.end),
    };
  });

  const weatherData: weatherType = {
    alerts: alerts,
    temp: weather.current.temp,
    feels: weather.current.feels,
    cloudCover: weather.current.cloudCover,
    visibility: weather.current.vis,
    umidity: weather.current.rh,
    dewPoint: weather.current.dewPt,
    uv: weather.current.uv,
    uvDescription: weather.current.uvDesc,
    windSpeed: weather.current.windSpd,
    windDirection: weather.current.windDir,
    caption: weather.current.cap,
    icon: getWeatherIcon(weather.current.icon),
    nowCasting: weather.nowcasting.summary,
    sourceData: source,
  };

  return weatherData;
}

export function useWeather() {
  return useQuery('weather', getWeatherData, {
    staleTime: 1000 * 60 * 15, // 15 min
  });
}
