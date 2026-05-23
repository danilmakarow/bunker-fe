'use client';

import { Avatar, Box, Stack, Switch, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import {
  GlassAlert,
  GlassCard,
  GlassSpinner,
} from '@/components/glass';
import { notify } from '@/components/notify';
import { errorMessageKey } from '@/adapters/error-message';
import {
  useBackofficeUsers,
  useSetUserAdmin,
} from '@/use-cases/use-backoffice';

interface UsersListProps {
  currentUserId: string;
}

const UsersList = ({ currentUserId }: UsersListProps) => {
  const t = useTranslations('backoffice');
  const tErrors = useTranslations('errors');
  const { data, isLoading, error } = useBackofficeUsers();
  const setAdmin = useSetUserAdmin();

  const handleToggle = async (id: string, isAdmin: boolean) => {
    try {
      await setAdmin.mutateAsync({ id, isAdmin });
      notify.success(t('common.saved'));
    } catch (mutationError) {
      notify.error(tErrors(errorMessageKey(mutationError)));
    }
  };

  if (isLoading) {
    return <GlassSpinner />;
  }

  if (error) {
    return <GlassAlert severity="error">{tErrors(errorMessageKey(error))}</GlassAlert>;
  }

  const users = data ?? [];

  return (
    <Stack spacing={2}>
      <Typography sx={{ fontSize: '0.85rem', color: 'rgba(0,0,0,0.55)' }}>
        {t('common.total', { count: users.length })}
      </Typography>

      <Stack spacing={1.5}>
        {users.map((user) => {
          const isSelf = user.id === currentUserId;
          const initial = user.name.charAt(0).toUpperCase() || '?';

          return (
            <GlassCard key={user.id} sx={{ p: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                <Avatar
                  src={user.avatarUrl ?? undefined}
                  alt={user.name}
                  sx={{
                    width: 40,
                    height: 40,
                    fontSize: '1rem',
                    bgcolor: 'rgba(0,122,255,0.14)',
                    color: 'rgba(0,122,255,0.95)',
                  }}
                >
                  {initial}
                </Avatar>

                <Box sx={{ flex: 1, minWidth: 0 }}>
                  <Typography
                    sx={{
                      fontSize: '0.95rem',
                      fontWeight: 600,
                      color: 'rgba(0,0,0,0.88)',
                      letterSpacing: '-0.01em',
                      wordBreak: 'break-word',
                    }}
                  >
                    {user.name}
                    {isSelf && (
                      <Box
                        component="span"
                        sx={{
                          ml: 1,
                          fontSize: '0.7rem',
                          fontWeight: 500,
                          color: 'rgba(0,122,255,0.85)',
                          textTransform: 'uppercase',
                          letterSpacing: '0.05em',
                        }}
                      >
                        {t('users.you')}
                      </Box>
                    )}
                  </Typography>
                  <Typography
                    sx={{
                      fontSize: '0.78rem',
                      color: 'rgba(0,0,0,0.55)',
                      wordBreak: 'break-all',
                    }}
                  >
                    {user.email}
                  </Typography>
                </Box>

                <Box sx={{ textAlign: 'right' }}>
                  <Typography
                    sx={{
                      fontSize: '0.7rem',
                      color: 'rgba(0,0,0,0.5)',
                      mb: 0.3,
                    }}
                  >
                    {t('users.isAdmin')}
                  </Typography>
                  <Switch
                    checked={user.isAdmin}
                    disabled={setAdmin.isPending || isSelf}
                    onChange={(event) =>
                      handleToggle(user.id, event.target.checked)
                    }
                    size="small"
                  />
                </Box>
              </Box>
            </GlassCard>
          );
        })}
      </Stack>
    </Stack>
  );
};

export default UsersList;
