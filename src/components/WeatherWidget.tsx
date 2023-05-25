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
  Editable,
  EditableInput,
  EditablePreview,
  Tooltip,
  ListItem,
  List,
  useEditableControls,
  Box,
} from '@chakra-ui/react';
import { useState } from 'react';
import { useWeather } from 'hooks/useWeather';
import { FiEdit2 } from 'react-icons/fi';

import { LocationType } from 'entities';
import {
  getPlacesData,
  getWeatherLocation,
  locationArrow,
  weatherAlert,
} from 'utils';
import { WeatherAlertContent } from './WeatherAlertContent';
import { IoMdInformationCircleOutline } from 'react-icons/io';

function EditableControls() {
  const { getEditButtonProps } = useEditableControls();

  return (
    <Box
      position="absolute"
      visibility="collapse"
      alignSelf="center"
      justifySelf="center"
      {...getEditButtonProps()}
    >
      <FiEdit2 size="18" />
    </Box>
  );
}

export default function WeatherWidget() {
  const { data, isLoading, isFetching, error, refetch } = useWeather();

  const [locationEditMode, setLocationEditMode] = useState(false);
  const [locationsList, setLocationsList] = useState<LocationType[]>([]);
  const [locationName, setLocationName] = useState(() => {
    return getActualLocationName();
  });

  function getActualLocationName() {
    const actualLocationData = getWeatherLocation();

    return actualLocationData.name;
  }

  async function getCitiesList(query: string) {
    const response = await fetch(getPlacesData(query)!);
    const data = await response.json();

    setLocationsList([]);

    data.value.forEach((city: any) => {
      setLocationsList((prevState) => [
        ...prevState,
        {
          name: city.address.text,
          lat: city.geo.latitude,
          lon: city.geo.longitude,
        },
      ]);
    });

    return data;
  }

  function setWeatherLocation(location: LocationType) {
    localStorage.setItem('weatherLocation', JSON.stringify(location));

    setLocationName(location.name);
    setLocationEditMode(false);

    refetch();
  }

  function handleInputChange(event: React.ChangeEvent<HTMLInputElement>) {
    const { value } = event.currentTarget;

    getCitiesList(value);
    setLocationName(value);
  }

  function handleInputCancelChange() {
    const actualLocaltionName = getActualLocationName();

    setLocationName(actualLocaltionName);
    setLocationEditMode(false);
  }

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
                <WeatherAlertContent data={data!} />
              </PopoverContent>
            </Popover>
          )}

          <Popover
            trigger="hover"
            placement="bottom-start"
            onClose={handleInputCancelChange}
          >
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
              display="grid"
              gridTemplateRows="max-content auto"
              minHeight="235px"
              minWidth="400px"
              maxWidth="400px"
              bgColor="background.600"
              backdropFilter="blur(4px)"
              borderColor="secondaryBackground"
              color="gray.200"
              _focus={{
                outline: 'none',
              }}
            >
              <PopoverHeader
                position="relative"
                display="flex"
                alignItems="center"
                justifyContent="center"
                borderColor="secondaryBackground"
                backgroundColor="rgba(50,50,50,.2)"
                textAlign="center"
                userSelect="none"
                cursor="pointer"
                _hover={{
                  bgColor: 'background.500',
                  '& span': {
                    filter: !locationEditMode ? 'blur(3px)' : 'none',
                  },
                  '& svg': {
                    visibility: !locationEditMode ? 'visible' : 'collapse',
                  },
                }}
                onClick={() => {
                  setLocationEditMode(true);
                }}
              >
                {!isFetching && (
                  <Editable width="100%" value={locationName} display="grid">
                    <Tooltip label="Clique para alterar">
                      <Flex alignItems="center" justifyContent="center">
                        <EditablePreview width="100%" cursor="pointer" />
                        <EditableControls />
                      </Flex>
                    </Tooltip>

                    <EditableInput
                      cursor="pointer"
                      onChange={handleInputChange}
                      onKeyDown={(e) => {
                        e.key === 'Escape' && handleInputCancelChange();
                      }}
                    />
                  </Editable>
                )}
              </PopoverHeader>
              <PopoverBody display="grid">
                {isFetching ? (
                  <Spinner
                    alignSelf="center"
                    justifySelf="center"
                    color="white"
                  />
                ) : !locationEditMode ? (
                  <>
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

                    {data?.nowCasting && (
                      <>
                        <Divider my={2} borderColor="secondaryBackground" />

                        <Flex
                          alignItems="center"
                          gap={2}
                          overflow="hidden"
                          overflowWrap="break-word"
                        >
                          <IoMdInformationCircleOutline />
                          <Text>{`${data?.nowCasting}`}</Text>
                        </Flex>
                      </>
                    )}
                  </>
                ) : locationsList.length > 0 ? (
                  <List>
                    {locationsList.map((location: LocationType) => (
                      <ListItem
                        key={location.name}
                        p={1}
                        userSelect="none"
                        cursor="pointer"
                        _hover={{
                          bgColor: 'background.500',
                        }}
                        onClick={() => setWeatherLocation(location)}
                      >
                        {location.name}
                      </ListItem>
                    ))}
                  </List>
                ) : (
                  <Text alignSelf="center" justifySelf="center">
                    Nenhum resultado encontrado
                  </Text>
                )}
              </PopoverBody>
            </PopoverContent>
          </Popover>
        </>
      )}
    </Flex>
  );
}
