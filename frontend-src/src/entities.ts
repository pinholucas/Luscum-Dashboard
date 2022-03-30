export type frameResolution = 'i1080' | 'i1440' | 'i2160';
export type videoResolution = 'v1080' | 'v1440' | 'v2160';

export type videoData = {
  firstFrame: {
    [key in frameResolution]: string;
  };
  video: {
    [key in videoResolution]: string;
  };
  attribution: string;
};

export type BackgroundImageType = {
  properties: {
    video: {
      data: videoData[];
    };
    localizedStrings: {
      video_titles: {
        [video: string]: string;
      };
    };
  };
};

export type NTPType = {
  configs: {
    'BackgroundImageWC/default': BackgroundImageType;
  };
};

export type WebsiteDataType = {
  id: string;
  title?: string;
  icon?: string | null;
  url?: string;
};

export type LocationType = {
  lat: number;
  lon: number;
  name: string;
};

export type SettingsType = {
  columns: number;
  appID: string;
  apikey: string;
};
