import { Box, chakra, Flex, Text } from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { useQuery } from "react-query";
import { NTPType } from "../entities";
import { allOrigins, mainConfigURL } from "../utils";

type videoType = {
  firstFrame: string;
  videoUrl: string;
  copyright: string;
  description: string;
};

export default function Home() {
  const [videoData, setVideoData] = useState<videoType>();

  function randomNumber(min: number, max: number) {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  const { data, isLoading, error } = useQuery<NTPType>("home", async () => {
    const response = await fetch(allOrigins(mainConfigURL));
    const data = await response.json();

    return data;
  });

  useEffect(() => {
    if (data) {
      const videos =
        data.configs["BackgroundImageWC/default"].properties.video.data;

      const videoIndex = randomNumber(0, videos.length - 1);
      const videoDescription =
        data.configs["BackgroundImageWC/default"].properties.localizedStrings
          .video_titles["video" + videoIndex];

      setVideoData({
        firstFrame: videos[videoIndex].firstFrame.i2160,
        videoUrl: videos[videoIndex].video.v1080,
        copyright: videos[videoIndex].attribution,
        description: videoDescription,
      });
    }
  }, [isLoading, data]);

  return (
    <Flex width="100vw" height="100vh">
      {error && <Text>Problema no vídeo!</Text>}

      {!isLoading && (
        <Flex>
          <chakra.video
            width="100%"
            height="100%"
            objectFit="cover"
            autoPlay
            loop
            muted
            src={videoData?.videoUrl}
          />

          <Box position="absolute" width="100%" height="100%" />

          <Text
            position="absolute"
            bottom={0}
            right={0}
            px={4}
            py={1}
            m={2}
            border="1px solid"
            borderColor="gray.600"
            borderRadius={8}
            backgroundColor="primaryBackground"
            backdropFilter="blur(3px)"
            color="gray.300"
            fontSize="xs"
          >
            {videoData?.copyright}
          </Text>
        </Flex>
      )}
    </Flex>
  );
}
