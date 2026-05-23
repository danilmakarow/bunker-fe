'use client';

import {
  useMutation,
  useQuery,
  useQueryClient,
  type UseQueryResult,
} from '@tanstack/react-query';
import { apiRequest } from '@/infrastructure/http/api-client';
import type {
  BackofficeApocalypse,
  BackofficeBiologyRow,
  BackofficeShelter,
  BackofficeTrait,
  BackofficeUser,
  BiologyAxisSlug,
} from '@/entities';
import { DEFAULT_STALE_TIME_MS } from '@/shared/timing';
import { queryKeys } from './query-keys';

/* ─── Users ─────────────────────────────────────────────────────────────── */

export const useBackofficeUsers = (): UseQueryResult<BackofficeUser[]> =>
  useQuery<BackofficeUser[]>({
    queryKey: queryKeys.backoffice.users(),
    queryFn: () => apiRequest<BackofficeUser[]>('/backoffice/users'),
    staleTime: DEFAULT_STALE_TIME_MS,
  });

export const useSetUserAdmin = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isAdmin }: { id: string; isAdmin: boolean }) =>
      apiRequest<BackofficeUser>(`/backoffice/users/${id}`, {
        method: 'PATCH',
        body: { isAdmin },
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.backoffice.users() });
    },
  });
};

/* ─── Apocalypses ───────────────────────────────────────────────────────── */

export const useBackofficeApocalypses = (): UseQueryResult<
  BackofficeApocalypse[]
> =>
  useQuery<BackofficeApocalypse[]>({
    queryKey: queryKeys.backoffice.apocalypses(),
    queryFn: () =>
      apiRequest<BackofficeApocalypse[]>('/backoffice/apocalypses'),
    staleTime: DEFAULT_STALE_TIME_MS,
  });

export const useCreateApocalypse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<BackofficeApocalypse>) =>
      apiRequest<BackofficeApocalypse>('/backoffice/apocalypses', {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backoffice.apocalypses(),
      });
    },
  });
};

export const useUpdateApocalypse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<BackofficeApocalypse>;
    }) =>
      apiRequest<BackofficeApocalypse>(`/backoffice/apocalypses/${id}`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backoffice.apocalypses(),
      });
    },
  });
};

export const useDeleteApocalypse = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/backoffice/apocalypses/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backoffice.apocalypses(),
      });
    },
  });
};

/* ─── Shelters ──────────────────────────────────────────────────────────── */

export const useBackofficeShelters = (): UseQueryResult<BackofficeShelter[]> =>
  useQuery<BackofficeShelter[]>({
    queryKey: queryKeys.backoffice.shelters(),
    queryFn: () => apiRequest<BackofficeShelter[]>('/backoffice/shelters'),
    staleTime: DEFAULT_STALE_TIME_MS,
  });

export const useCreateShelter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<BackofficeShelter>) =>
      apiRequest<BackofficeShelter>('/backoffice/shelters', {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backoffice.shelters(),
      });
    },
  });
};

export const useUpdateShelter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<BackofficeShelter>;
    }) =>
      apiRequest<BackofficeShelter>(`/backoffice/shelters/${id}`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backoffice.shelters(),
      });
    },
  });
};

export const useDeleteShelter = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/backoffice/shelters/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backoffice.shelters(),
      });
    },
  });
};

/* ─── Traits ────────────────────────────────────────────────────────────── */

export const useBackofficeTraits = (): UseQueryResult<BackofficeTrait[]> =>
  useQuery<BackofficeTrait[]>({
    queryKey: queryKeys.backoffice.traits(),
    queryFn: () => apiRequest<BackofficeTrait[]>('/backoffice/traits'),
    staleTime: DEFAULT_STALE_TIME_MS,
  });

export const useCreateTrait = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<BackofficeTrait>) =>
      apiRequest<BackofficeTrait>('/backoffice/traits', {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backoffice.traits(),
      });
    },
  });
};

export const useUpdateTrait = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<BackofficeTrait>;
    }) =>
      apiRequest<BackofficeTrait>(`/backoffice/traits/${id}`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backoffice.traits(),
      });
    },
  });
};

export const useDeleteTrait = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/backoffice/traits/${id}`, { method: 'DELETE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backoffice.traits(),
      });
    },
  });
};

/* ─── Biology (axis-scoped) ─────────────────────────────────────────────── */

export const useBackofficeBiology = (
  axis: BiologyAxisSlug,
): UseQueryResult<BackofficeBiologyRow[]> =>
  useQuery<BackofficeBiologyRow[]>({
    queryKey: queryKeys.backoffice.biology(axis),
    queryFn: () =>
      apiRequest<BackofficeBiologyRow[]>(`/backoffice/biology/${axis}`),
    staleTime: DEFAULT_STALE_TIME_MS,
  });

export const useCreateBiology = (axis: BiologyAxisSlug) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: Partial<BackofficeBiologyRow>) =>
      apiRequest<BackofficeBiologyRow>(`/backoffice/biology/${axis}`, {
        method: 'POST',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backoffice.biology(axis),
      });
    },
  });
};

export const useUpdateBiology = (axis: BiologyAxisSlug) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      id,
      body,
    }: {
      id: string;
      body: Partial<BackofficeBiologyRow>;
    }) =>
      apiRequest<BackofficeBiologyRow>(`/backoffice/biology/${axis}/${id}`, {
        method: 'PATCH',
        body,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backoffice.biology(axis),
      });
    },
  });
};

export const useDeleteBiology = (axis: BiologyAxisSlug) => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) =>
      apiRequest<void>(`/backoffice/biology/${axis}/${id}`, {
        method: 'DELETE',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: queryKeys.backoffice.biology(axis),
      });
    },
  });
};
