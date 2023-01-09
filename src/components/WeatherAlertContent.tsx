import { Divider, Flex, PopoverBody, Text } from '@chakra-ui/react';
import { weatherType } from 'hooks/useWeather';

interface WeatherAlertContentProps {
  data: weatherType;
}

export function WeatherAlertContent({ data }: WeatherAlertContentProps) {
  return (
    <>
      {data.alerts.map((alert, index) => (
        <>
          <Flex
            paddingY={2}
            justifyContent="center"
            borderTop={index > 0 ? '1px solid' : ''}
            borderBottom="1px solid"
            borderColor="secondaryBackground"
            color="alert"
            fontWeight="bold"
            textAlign="center"
            textTransform="uppercase"
            textShadow="0 0 2px black"
            backgroundColor="rgba(50,50,50,.2)"
          >
            {alert.title}
          </Flex>
          <PopoverBody>
            <Text>{`De: ${alert.start}`}</Text>
            <Text>{`Até: ${alert.end}`}</Text>

            <Divider my={2} borderColor="secondaryBackground" />

            <Text>{`${alert.desc ?? alert.safetyGuide}`}</Text>
          </PopoverBody>
        </>
      ))}
    </>
  );
}
