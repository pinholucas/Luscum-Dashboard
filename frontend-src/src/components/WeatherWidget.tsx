import {
  Flex,
  Popover,
  Image,
  Spinner,
  Text,
  PopoverContent,
  PopoverTrigger,
  PopoverHeader,
  PopoverBody,
  Icon,
} from '@chakra-ui/react';
import { useWeather } from 'hooks/useWeather';
import { locationArrow } from 'utils';

export default function WeatherWidget() {
  const { data, isLoading, isFetching, error } = useWeather();

  return (
    <Flex position="absolute" top={4} left={4} alignItems="center" zIndex="3">
      {isLoading && <Spinner color="white" />}

      {!isLoading && (
        <Popover trigger="hover" placement="bottom-start">
          <PopoverTrigger>
            <Flex alignItems="center" cursor="pointer">
              {isFetching ? (
                <Spinner color="white" size="sm" />
              ) : (
                <>
                  <Image
                    width="28px"
                    marginRight={1}
                    src={`./assets/weather/${data?.icon}.svg`}
                  />
                  <Text color="white" fontSize="2xl" textShadow="0 0 2px black">
                    {error ? '-' : data?.temp}
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
          </PopoverTrigger>
          <PopoverContent
            bgColor="primaryBackground"
            borderColor="secondaryBackground"
            color="gray.200"
          >
            <PopoverHeader
              borderColor="secondaryBackground"
              textAlign="center"
            >{`${data?.sourceData.location.Name}, ${data?.sourceData.location.StateCode}`}</PopoverHeader>
            <PopoverBody>
              <Text>{`Clima: ${data?.caption}`}</Text>
              <Text>{`Sensação térmica: ${data?.feels} °C`}</Text>
              <Text>{`Radiação UV: ${
                data?.uv
              } (${data?.uvDescription.toLowerCase()})`}</Text>
              <Text>{`Umidade: ${data?.umidity}%`}</Text>
              <Text>
                {`Vento: ${data?.windSpeed} km/h`}{' '}
                <Icon
                  boxSize={6}
                  viewBox="0 -5 10 24"
                  transform={`rotate(${Number(data?.windDirection) - 180}deg)`}
                  justifyContent="center"
                >
                  <path d={locationArrow} fill="white" />
                </Icon>
              </Text>
              <Text>{`Ponto de orvalho: ${data?.dewPoint} °C`}</Text>
            </PopoverBody>
          </PopoverContent>
        </Popover>
      )}
    </Flex>
  );
}
