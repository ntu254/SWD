import { useQuery } from '@tanstack/react-query';
import apiClient from '../../../shared/api/client';
import { Location } from '../ui/components/GreenLoopMap';

interface LocationsResponse {
    data: Location[];
    total: number;
}

async function fetchLocations(): Promise<Location[]> {
    // TODO: Update endpoint to match your backend API
    const response = await apiClient.get<LocationsResponse>('/api/v1/locations');
    return response.data.data;
}

export function useLocations() {
    return useQuery({
        queryKey: ['locations'],
        queryFn: fetchLocations,
        staleTime: 1000 * 60 * 10, // 10 minutes
    });
}

// Mock data for development
export const mockLocations: Location[] = [
    {
        id: '1',
        latitude: 10.8231,
        longitude: 106.6297,
        title: 'Bến Thành Market Collection Point',
        description: 'Public waste collection station',
        type: 'collection',
    },
    {
        id: '2',
        latitude: 10.7769,
        longitude: 106.7009,
        title: 'Smart Bin - District 1',
        description: 'IoT-enabled recycling bin',
        type: 'bin',
    },
    {
        id: '3',
        latitude: 10.8542,
        longitude: 106.6291,
        title: 'GreenTech Enterprise',
        description: 'Waste processing facility',
        type: 'enterprise',
    },
];
