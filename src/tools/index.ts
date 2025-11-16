import { zoomToHome, zoomToHomeSchema } from './zoomToHome';
import { zoomToLocation, zoomToLocationSchema } from './zoomToLocation';
import { lookupAirport, lookupAirportSchema } from './lookupAirport';
import { lookupRiverLake, lookupRiverLakeSchema } from './lookupRiverLake';
import { drawWktGeometry, drawWktGeometrySchema } from './drawWktGeometry';
import { addCartoMap, addCartoMapSchema } from './addCartoMap';
import { applyPostProcessEffect, applyPostProcessEffectSchema } from './applyPostProcessEffect';
import { createBuffer, createBufferSchema } from './createBuffer';
import { ToolFunction } from './types';

export const tools: Record<string, ToolFunction> = {
  zoomToHome,
  zoomToLocation,
  lookupAirport,
  lookupRiverLake,
  drawWktGeometry,
  addCartoMap,
  applyPostProcessEffect,
  createBuffer
};

export const localToolSchemas: Record<string, any> = {
  zoomToHome: zoomToHomeSchema,
  zoomToLocation: zoomToLocationSchema,
  lookupAirport: lookupAirportSchema,
  lookupRiverLake: lookupRiverLakeSchema,
  drawWktGeometry: drawWktGeometrySchema,
  addCartoMap: addCartoMapSchema,
  applyPostProcessEffect: applyPostProcessEffectSchema,
  createBuffer: createBufferSchema
};

export type ToolName = keyof typeof tools;
export * from './types';