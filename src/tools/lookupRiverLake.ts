import { useMapStore } from '@/store/mapStore';
import { ToolFunction, ToolCall } from './types';
import { z } from 'zod';

export const lookupRiverLakeSchema = {
  description:
    "Look up detailed information about a river or lake by its name from the loaded dataset. Use this tool whenever users ask for information about any river or lake.",
  inputSchema: z.object({
    name: z
      .string()
      .describe(
        'Name of the river or lake (e.g. "Amazon", "Nile", "Mississippi")'
      ),
  }),
};

export const lookupRiverLake: ToolFunction = (toolCall: ToolCall): string => {
  console.log('[lookupRiverLake] Executing tool client-side');
  const { name } = lookupRiverLakeSchema.inputSchema.parse(toolCall.input);

  const data = useMapStore.getState().riversLakesData;

  if (!data?.features) {
    return 'No rivers/lakes data available. Please wait for the map to load.';
  }

  // Search for exact match first, then partial match
  let riverLake = data.features.find(feature =>
    feature.properties.name?.toLowerCase() === name.toLowerCase()
  );

  if (!riverLake) {
    riverLake = data.features.find(feature =>
      feature.properties.name?.toLowerCase().includes(name.toLowerCase())
    );
  }

  if (!riverLake) {
    const availableNames = data.features
      .map(f => f.properties.name)
      .filter(Boolean)
      .slice(0, 10)
      .join(', ');
    return `No river or lake found with name: "${name}". Available options include: ${availableNames}`;
  }

  return `River/Lake information for ${name}:\n\`\`\`json\n${JSON.stringify(riverLake.properties, null, 2)}\n\`\`\``;
};