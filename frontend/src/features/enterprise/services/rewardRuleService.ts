import apiClient from '@shared/services/api/client';
import type { RewardRuleResponse, CreateRewardRuleRequest } from '../types';

const BASE = '/rewards/rules';

export const getAllRules = (): Promise<{ data: RewardRuleResponse[] }> =>
    apiClient.get(BASE);

export const getActiveRules = (): Promise<{ data: RewardRuleResponse[] }> =>
    apiClient.get(`${BASE}/active`);

export const getRuleById = (id: string): Promise<{ data: RewardRuleResponse }> =>
    apiClient.get(`${BASE}/${id}`);

export const createRule = (
    data: CreateRewardRuleRequest
): Promise<{ data: RewardRuleResponse }> =>
    apiClient.post(BASE, data);

export const updateRule = (
    id: string,
    data: CreateRewardRuleRequest
): Promise<{ data: RewardRuleResponse }> =>
    apiClient.put(`${BASE}/${id}`, data);

export const activateRule = (id: string): Promise<void> =>
    apiClient.patch(`${BASE}/${id}/activate`);

export const deactivateRule = (id: string): Promise<void> =>
    apiClient.patch(`${BASE}/${id}/deactivate`);

export const deleteRule = (id: string): Promise<void> =>
    apiClient.delete(`${BASE}/${id}`);
