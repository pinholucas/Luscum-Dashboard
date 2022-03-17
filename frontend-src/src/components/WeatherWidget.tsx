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
  Divider,
} from '@chakra-ui/react';
import { useWeather } from 'hooks/useWeather';
import { locationArrow, weatherAlert } from 'utils';

export default function WeatherWidget() {
  const { data, isLoading, isFetching, error } = useWeather();

  return (
    <Flex position="absolute" top={4} left={4} alignItems="center" zIndex="3">
      {isLoading && <Spinner color="white" />}

      {!isLoading && (
        <>
          {data!.alerts?.length > 0 && (
            <Popover trigger="hover" placement="bottom-start">
              <PopoverTrigger>
                <Icon
                  marginRight={1}
                  boxSize={6}
                  viewBox="0 0 30 22"
                  cursor="pointer"
                >
                  <path d={weatherAlert[0]} fill="#E67E22" />
                  <path d={weatherAlert[1]} fill="white" />
                </Icon>
              </PopoverTrigger>
              <PopoverContent
                bgColor="background.600"
                backdropFilter="blur(4px)"
                borderColor="secondaryBackground"
                color="gray.200"
              >
                <PopoverHeader
                  borderColor="secondaryBackground"
                  color="alert"
                  fontWeight="bold"
                  textAlign="center"
                  textTransform="uppercase"
                  textShadow="0 0 2px black"
                >
                  {data?.alerts[0].title}
                </PopoverHeader>
                <PopoverBody>
                  <Text>{`De: ${data?.alerts[0].start}`}</Text>
                  <Text>{`Até: ${data?.alerts[0].end}`}</Text>

                  <Divider my={2} borderColor="secondaryBackground" />

                  <Text>{`${data?.alerts[0].desc}`}</Text>
                </PopoverBody>
              </PopoverContent>
            </Popover>
          )}

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
                    <Text
                      color="white"
                      fontSize="2xl"
                      textShadow="0 0 2px black"
                    >
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
              bgColor="background.600"
              backdropFilter="blur(4px)"
              borderColor="secondaryBackground"
              color="gray.200"
            >
              <PopoverHeader
                borderColor="secondaryBackground"
                textAlign="center"
              >
                {`${data?.sourceData.location.Name}, ${data?.sourceData.location.StateCode}`}
              </PopoverHeader>
              <PopoverBody>
                <Text>{`Clima: ${data?.caption}`}</Text>
                <Text>{`Sensação térmica: ${data?.feels} °C`}</Text>
                <Text>{`Radiação UV: ${
                  data?.uv
                } (${data?.uvDescription.toLowerCase()})`}</Text>
                <Text>{`Umidade: ${data?.umidity}%`}</Text>
                <Text>{`Visibilidade: ${data?.visibility} km`}</Text>
                <Text>
                  {`Vento: ${data?.windSpeed} km/h`}
                  <Icon
                    marginLeft={1}
                    boxSize={6}
                    viewBox="0 -5 10 24"
                    transform={`rotate(${
                      Number(data?.windDirection) - 180
                    }deg)`}
                  >
                    <path d={locationArrow} fill="white" />
                  </Icon>
                </Text>
                <Text>{`Ponto de orvalho: ${data?.dewPoint} °C`}</Text>
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </>
      )}
    </Flex>
  );
}
