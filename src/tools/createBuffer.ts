import { useMapStore } from '@/store/mapStore';
import { ToolFunction, ToolCall } from './types';
import { z } from 'zod';
// @ts-ignore - Turf types are not properly exported
import { buffer } from '@turf/buffer';
// @ts-ignore - Turf types are not properly exported
import { point } from '@turf/helpers';

export const createBufferSchema = {
  description:
    "Create a buffer zone around a geographic feature. You can buffer around a point (using lat/lng coordinates) or an airport from the dataset. The buffer distance is specified in kilometers.",
  inputSchema: z.object({
    bufferType: z
      .enum(['point', 'airport'])
      .describe(
        'Type of feature to buffer: "point" for lat/lng coordinates, "airport" for an airport by IATA code'
      ),
    latitude: z
      .number()
      .optional()
      .describe('Latitude coordinate (required when bufferType is "point")'),
    longitude: z
      .number()
      .optional()
      .describe('Longitude coordinate (required when bufferType is "point")'),
    iataCode: z
      .string()
      .optional()
      .describe('IATA airport code (required when bufferType is "airport")'),
    distance: z
      .number()
      .positive()
      .describe('Buffer distance in kilometers (e.g., 5 for 5km buffer)'),
    name: z
      .string()
      .optional()
      .describe('Optional name for the buffer zone (defaults to "Buffer Zone")')
  }).refine((data) => {
    if (data.bufferType === 'point') {
      return data.latitude !== undefined && data.longitude !== undefined;
    }
    if (data.bufferType === 'airport') {
      return data.iataCode !== undefined;
    }
    return true;
  }, {
    message: "Missing required fields: latitude/longitude for point buffer, or iataCode for airport buffer"
  })
};

export const createBuffer: ToolFunction = (toolCall: ToolCall): string => {
  console.log('[createBuffer] Executing tool client-side');
  
  try {
    const { bufferType, latitude, longitude, iataCode, distance, name } = createBufferSchema.inputSchema.parse(toolCall.input);

    let sourceFeature: any = null;
    let bufferName = name || 'Buffer Zone';

    // Determine the source feature based on buffer type
    if (bufferType === 'point') {
      if (latitude === undefined || longitude === undefined) {
        return 'Latitude and longitude are required for point buffer.';
      }
      sourceFeature = point([longitude, latitude]);
      bufferName = name || `Buffer around (${latitude.toFixed(4)}, ${longitude.toFixed(4)})`;
    } else if (bufferType === 'airport') {
      if (iataCode === undefined) {
        return 'IATA code is required for airport buffer.';
      }
      
      const airportData = useMapStore.getState().airportData;
      if (!airportData?.features) {
        return 'No airport data available. Please wait for the map to load.';
      }

      const airport = airportData.features.find(feature =>
        feature.properties.iata_code === iataCode.toUpperCase()
      );

      if (!airport) {
        return `No airport found with IATA code: ${iataCode}`;
      }

      sourceFeature = airport;
      bufferName = name || `Buffer around ${airport.properties.name || iataCode} Airport`;
    }

    if (!sourceFeature) {
      return 'Could not determine source feature for buffering.';
    }

    // Create the buffer
    const bufferedFeature = buffer(sourceFeature, distance, { units: 'kilometers' });

    if (!bufferedFeature) {
      return 'Error creating buffer zone.';
    }

    // Convert to WKT format for display
    const coordinates = bufferedFeature.geometry.coordinates[0];
    const wktCoords = coordinates
      .map((coord: number[]) => `${coord[0]} ${coord[1]}`)
      .join(', ');
    const wkt = `POLYGON((${wktCoords}))`;

    // Store the buffer in the map store
    useMapStore.getState().setWktGeometry({
      wkt: wkt,
      name: bufferName,
      color: [255, 165, 0, 120] // Orange with transparency
    });

    return `Created ${distance}km buffer zone: "${bufferName}". The buffer has been added to the map as an orange polygon.`;

  } catch (error) {
    console.error('[createBuffer] Error:', error);
    return `Error creating buffer: ${error instanceof Error ? error.message : 'Unknown error'}`;
  }
};