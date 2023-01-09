import { LocationType, SettingsType } from 'entities';

const defaultSettings: SettingsType = {
  adaptTopSitesWidth: true,
  columns: 7,
  appID: 'EDEC3CB74CF190BBBE26DF7938F3D961E925F593',
  apikey: 'UhJ4G66OjyLbn9mXARgajXLiLw6V75sHnfpU60aJBB',
};

export const mainConfigURL =
  'https://ntp.msn.com/resolver/api/resolve/v3/config/?expType=AppConfig&apptype=edgeChromium&v=20230106.366&targetScope={"audienceMode":"adult","browser":{"version":"110","ismobile":"false"},"locale":{"content":{"language":"pt","market":"br"},"display":{"language":"pt","market":"br"}}}';

export const backgroundDataURL =
  'https://raw.githubusercontent.com/pinholucas/Luscum-Dashboard/master/api.json';

export const locationArrow = 'M5 0L9.66895 14L5 9.33105L0.331055 14L5 0Z';
export const weatherAlert = [
  'M14.08 1.54a1 1 0 0 1 1.74 0l11.23 19.84a1 1 0 0 1-.87 1.5H3.72a1 1 0 0 1-.87-1.5L14.08 1.54Z',
  'm15.9 8.8-.3 7.72h-2l-.29-7.72h2.6Zm-1.28 11.38c-.41 0-.76-.13-1.03-.38s-.4-.56-.4-.92c0-.37.13-.68.4-.92.28-.24.62-.36 1.04-.36.41 0 .75.12 1.02.37.26.24.4.54.4.91 0 .38-.14.69-.4.93-.26.25-.6.37-1.03.37Z',
];

export function randomNumber(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}
export function allOrigins(url: string) {
  return `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`;
}

export function getIconURL(url: string) {
  return `https://t2.gstatic.com/faviconV2?client=SOCIAL&type=FAVICON&fallback_opts=TYPE,SIZE,URL&url=${url}&size=256`;
}

export function getSettingsData(): SettingsType {
  if (!localStorage.getItem('settings')) {
    localStorage.setItem('settings', JSON.stringify(defaultSettings));
  }

  let localStorageSettings = JSON.parse(localStorage.getItem('settings')!);

  for (const [key, value] of Object.entries(defaultSettings)) {
    if (localStorageSettings[key] === undefined) {
      localStorageSettings[key] = value;
    }
  }

  localStorage.setItem('settings', JSON.stringify(localStorageSettings));

  return JSON.parse(localStorage.getItem('settings')!);
}

export function getWeatherURL() {
  const settingsData = getSettingsData();
  const location = getWeatherLocation();
  const sillymagic = randomNumber(1, 1000);

  return `https://assets.msn.com/service/weather/overview?apikey=${settingsData.apikey}&ocid=weather-peregrine&market=BR&scn=APP_ANON&units=C&wrapodata=false&includemapsmetadata=true&cuthour=true&filterRule=card&includenowcasting=true&nowcastingapi=2&distanceinkm=10&regionDataCount=20&orderby=distance&days=5&pageOcid=anaheim-ntp-peregrine&source=undefined_csr&hours=13&inclup=1&region=br&locale=pt-br&lat=${location.lat}&lon=${location.lon}&sillymagic=${sillymagic}`;
}

export function getWeatherLocation(): LocationType {
  return (
    JSON.parse(localStorage.getItem('weatherLocation')!) ?? {
      name: 'São Paulo, São Paulo',
      lat: -23.5489,
      lon: -46.6388,
    }
  );
}

export function getPlacesData(query: string) {
  const settingsData = getSettingsData();

  if (settingsData.appID) {
    return `https://www.bing.com/api/v6/Places/AutoSuggest?appid=${settingsData.appID}&q=${query}&setmkt=pt-br&setlang=pt-br&types=Place&abbrtext=1&structuredaddress=true&strucaddrread=1`;
  }
}
