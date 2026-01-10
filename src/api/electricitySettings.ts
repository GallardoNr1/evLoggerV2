// apps/mobile/src/api/electricitySettings.ts
import { request } from './http';
import type { SocialBonusType, SocialBonusValue } from '@/types/shared';

// modo de visualización en la app
export type CostViewMode = 'simple' | 'with_breakdown';

// tipo de contrato en el front
export type ContractType = 'PVPC' | 'FIXED_SINGLE';

export interface ElectricitySettings {
  hasSocialBonus: boolean;
  socialBonusType: SocialBonusType;
  discountPercent: number;
  costViewMode: CostViewMode;
  contractType: ContractType;
  fixedPricePerKwh: number | null;
}

// tipos de la API (en mayúsculas / enums de backend)
type SocialBonusTypeApi =
  | 'NONE'
  | 'VULNERABLE'
  | 'VULNERABLE_SEVERE'
  | 'EXCLUSION_RISK';

type CostViewModeApi = 'SIMPLE' | 'WITH_BREAKDOWN';

// enum de Prisma / DTO
type ContractTypeApi = 'PVPC' | 'FIXED_SINGLE';

type ElectricitySettingsApi = {
  hasSocialBonus: boolean;
  socialBonusType: SocialBonusTypeApi;
  socialBonusDiscountPercent: number;
  costViewMode: CostViewModeApi;
  contractType: ContractTypeApi;
  fixedPricePerKwh: number | null;
};

const toApiSocialBonusType = (
  type: SocialBonusValue['socialBonusType'],
): SocialBonusTypeApi => {
  switch (type) {
    case 'vulnerable':
      return 'VULNERABLE';
    case 'vulnerable_severe':
      return 'VULNERABLE_SEVERE';
    case 'exclusion_risk':
      return 'EXCLUSION_RISK';
    case 'none':
    default:
      return 'NONE';
  }
};

const fromApiSocialBonusType = (
  type: SocialBonusTypeApi,
): SocialBonusValue['socialBonusType'] => {
  switch (type) {
    case 'VULNERABLE':
      return 'vulnerable';
    case 'VULNERABLE_SEVERE':
      return 'vulnerable_severe';
    case 'EXCLUSION_RISK':
      return 'exclusion_risk';
    case 'NONE':
    default:
      return 'none';
  }
};

const toApiCostViewMode = (mode: CostViewMode): CostViewModeApi =>
  mode === 'with_breakdown' ? 'WITH_BREAKDOWN' : 'SIMPLE';

const fromApiCostViewMode = (mode: CostViewModeApi): CostViewMode =>
  mode === 'WITH_BREAKDOWN' ? 'with_breakdown' : 'simple';

// mapeo contrato front ↔ API (aquí coinciden los literales, pero lo dejamos explícito)
const toApiContractType = (type: ContractType): ContractTypeApi => type;

const fromApiContractType = (type: ContractTypeApi): ContractType => type;

export async function getElectricitySettings(): Promise<ElectricitySettings> {
  const data = await request<ElectricitySettingsApi>('/settings/electricity');

  return {
    hasSocialBonus: data.hasSocialBonus,
    socialBonusType: fromApiSocialBonusType(data.socialBonusType),
    discountPercent: data.socialBonusDiscountPercent,
    costViewMode: fromApiCostViewMode(data.costViewMode),
    contractType: fromApiContractType(data.contractType),
    fixedPricePerKwh: data.fixedPricePerKwh,
  };
}

export async function updateElectricitySettings(
  value: ElectricitySettings,
): Promise<void> {
  const payload: ElectricitySettingsApi = {
    hasSocialBonus: value.hasSocialBonus,
    socialBonusType: toApiSocialBonusType(value.socialBonusType),
    socialBonusDiscountPercent: value.discountPercent,
    costViewMode: toApiCostViewMode(value.costViewMode),
    contractType: toApiContractType(value.contractType),
    fixedPricePerKwh: value.fixedPricePerKwh,
  };

  await request('/settings/electricity', {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
}
