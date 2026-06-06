import axios from 'axios';
import { NominatimResult, Location } from '../types';

const NOMINATIM_URL = 'https://nominatim.openstreetmap.org';

export const searchLocation = async (query: string): Promise<Location[]> => {
  if (!query || query.length < 3) {
    return [];
  }

  try {
    const response = await axios.get<NominatimResult[]>(`${NOMINATIM_URL}/search`, {
      params: {
        q: query,
        format: 'json',
        limit: 5,
        addressdetails: 1,
      },
      headers: {
        'User-Agent': 'SafeMap/1.0',
      },
    });

    return response.data.map((result) => ({
      lat: parseFloat(result.lat),
      lng: parseFloat(result.lon),
      display_name: result.display_name,
    }));
  } catch (error) {
    console.error('Location search error:', error);
    return [];
  }
};
