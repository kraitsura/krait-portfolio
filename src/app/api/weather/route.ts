import { NextResponse } from 'next/server';

interface WeatherData {
  city: string;
  temp: number;
  description: string;
  time: string;
}

const CITIES = [
  { name: 'Seattle', country: 'US' },
  { name: 'New York', country: 'US' },
  { name: 'Hyderabad', country: 'IN' },
  { name: 'San Francisco', country: 'US' },
];

// Cache weather data for 10 minutes
let cachedData: { weather: WeatherData[], timestamp: number } | null = null;
const CACHE_DURATION = 10 * 60 * 1000; // 10 minutes

// Helper function to format time in 12-hour format with AM/PM
function formatTime(timezoneOffset: number): string {
  const now = new Date();
  const utcTime = now.getTime() + (now.getTimezoneOffset() * 60000);
  const cityTime = new Date(utcTime + (timezoneOffset * 1000));

  let hours = cityTime.getUTCHours();
  const minutes = cityTime.getUTCMinutes();
  const ampm = hours >= 12 ? 'PM' : 'AM';

  hours = hours % 12;
  hours = hours ? hours : 12; // Convert 0 to 12
  const minutesStr = minutes < 10 ? '0' + minutes : minutes;

  return `${hours}:${minutesStr} ${ampm}`;
}

export async function GET() {
  // Return cached data if still valid
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION) {
    return NextResponse.json({ weather: cachedData.weather });
  }

  const apiKey = process.env.OPENWEATHERMAP_API_KEY;

  if (!apiKey) {
    console.error('OPENWEATHERMAP_API_KEY is not set');
    return NextResponse.json({
      error: 'Weather API key not configured',
      weather: CITIES.map(city => ({
        city: city.name,
        temp: 0,
        description: 'unavailable',
        time: '--:-- --'
      }))
    }, { status: 500 });
  }

  try {
    const weatherPromises = CITIES.map(async (city) => {
      const url = `https://api.openweathermap.org/data/2.5/weather?q=${city.name},${city.country}&appid=${apiKey}&units=imperial`;

      try {
        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          console.error(`Weather API error for ${city.name}:`, {
            status: response.status,
            statusText: response.statusText,
            body: errorText
          });

          return {
            city: city.name,
            temp: 0,
            description: 'unavailable',
            time: '--:-- --',
          };
        }

        const data = await response.json();
        return {
          city: city.name,
          temp: Math.round(data.main.temp),
          description: data.weather[0].main,
          time: formatTime(data.timezone),
        };
      } catch (cityError) {
        console.error(`Error fetching weather for ${city.name}:`, cityError);
        return {
          city: city.name,
          temp: 0,
          description: 'unavailable',
          time: '--:-- --',
        };
      }
    });

    const results = await Promise.allSettled(weatherPromises);

    const weather = results.map((result, index) => {
      if (result.status === 'fulfilled') {
        return result.value;
      } else {
        console.error(`Promise rejected for ${CITIES[index].name}:`, result.reason);
        return {
          city: CITIES[index].name,
          temp: 0,
          description: 'unavailable',
          time: '--:-- --',
        };
      }
    });

    // Update cache only if at least one city succeeded
    const hasValidData = weather.some(w => w.description !== 'unavailable');
    if (hasValidData) {
      cachedData = {
        weather,
        timestamp: Date.now(),
      };
    }

    return NextResponse.json({ weather });
  } catch (error) {
    console.error('Unexpected error fetching weather:', error);
    return NextResponse.json({
      error: 'Failed to fetch weather data',
      weather: CITIES.map(city => ({
        city: city.name,
        temp: 0,
        description: 'unavailable',
        time: '--:-- --'
      }))
    }, { status: 500 });
  }
}
