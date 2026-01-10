import type { ChargeSessionDto, VehicleDto, VehicleType } from '@/types/shared';
import { API_BASE_URL, request } from './http';

type ElectricityPriceDto = {
  id: string;
  startsAt: string;
  endsAt: string;
  pricePerKwh: number;
};

export type GetElectricityPricesParams = {
  from?: string;
  to?: string;
  zone?: string;
};

export async function getElectricityPrices(
  params: GetElectricityPricesParams = {},
): Promise<ElectricityPriceDto[]> {
  const search = new URLSearchParams();
  if (params.from) search.set('from', params.from);
  if (params.to) search.set('to', params.to);
  if (params.zone) search.set('zone', params.zone);

  const qs = search.toString();
  const url = `${API_BASE_URL}/electricity-prices${qs ? `?${qs}` : ''}`;

  const res = await fetch(url);
  if (!res.ok) {
    throw new Error(`Error fetching electricity prices: ${res.statusText}`);
  }

  return res.json();
}

export const syncElectricityPrices = async () => {
  await request<void>('/electricity-prices/esios/sync-today', {
    method: 'POST',
  });
};

export function getChargeSessions() {
  return request<Array<ChargeSessionDto>>('/charges');
}

export function createChargeSession(payload: {
  vehicleId: string;
  startedAt: string;
  endedAt: string;
  kWh: number;
}) {
  return request('/charges', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function getVehicles() {
  return request<Array<VehicleDto>>('/vehicles');
}

export function createVehicle(payload: {
  name: string;
  type: VehicleType;
  consumption: number;
}) {
  return request<VehicleDto>('/vehicles', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function setFavoriteVehicle(id: string) {
  return request(`/vehicles/${id}/favorite`, {
    method: 'PATCH',
  });
}

export async function deleteVehicle(id: string): Promise<void> {
  await request<void>(`/vehicles/${id}`, {
    method: 'DELETE',
  });
}

export async function deleteChargeSession(id: string): Promise<void> {
  await request<void>(`/charges/${id}`, {
    method: 'DELETE',
  });
}
