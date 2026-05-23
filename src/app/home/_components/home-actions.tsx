'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { GlassButton } from '@/components/glass';
import { notify } from '@/components/notify';
import { confirm } from '@/components/modal/modal-store';
import { useCreateRoom } from '@/use-cases/use-create-room';
import { useLogout } from '@/use-cases/use-logout';
import { errorMessageKey } from '@/adapters/error-message';

interface HomeActionsProps {
  isAdmin: boolean;
}

/**
 * Sticky-footer CTAs for the home page.
 *
 * - Create: POST /rooms → seed snapshot cache → push to /room/[code].
 * - Join:   client navigation to /join (PIN form lives there).
 */
const HomeActions = ({ isAdmin }: HomeActionsProps) => {
  const router = useRouter();
  const t = useTranslations('home');
  const tErrors = useTranslations('errors');
  const createRoom = useCreateRoom();

  const handleCreate = async () => {
    try {
      const snapshot = await createRoom.mutateAsync();
      router.push(`/room/${snapshot.code}`);
    } catch (error) {
      notify.error(tErrors(errorMessageKey(error)));
    }
  };

  const handleJoin = () => {
    router.push('/join');
  };

  const handleBackoffice = () => {
    router.push('/backoffice');
  };

  return (
    <>
      <GlassButton
        glassVariant="primary"
        sx={{ py: 1.5 }}
        onClick={handleCreate}
        loading={createRoom.isPending}
      >
        {createRoom.isPending ? t('creating') : t('createRoom')}
      </GlassButton>
      <GlassButton glassVariant="secondary" sx={{ py: 1.3 }} onClick={handleJoin}>
        {t('joinRoom')}
      </GlassButton>
      {isAdmin && (
        <GlassButton
          glassVariant="ghost"
          sx={{ py: 1.1, fontSize: '0.9rem' }}
          onClick={handleBackoffice}
        >
          {t('backoffice')}
        </GlassButton>
      )}
    </>
  );
};

/**
 * Trailing slot in the app-bar — confirms then logs out via the BE.
 */
export const HomeLogoutButton = () => {
  const router = useRouter();
  const t = useTranslations('home');
  const tErrors = useTranslations('errors');
  const logout = useLogout();

  const handleLogout = async () => {
    const ok = await confirm({
      title: t('logoutConfirm'),
      message: t('logoutConfirmHint'),
      confirmLabel: t('logout'),
      confirmColor: 'error',
    });
    if (!ok) return;

    try {
      await logout.mutateAsync();
    } catch {
      notify.error(tErrors('generic'));
      return;
    }

    router.replace('/start');
    router.refresh();
  };

  return (
    <GlassButton
      glassVariant="ghost"
      sx={{ minWidth: 0, px: 1.5, py: 0.8, fontSize: '0.9rem' }}
      onClick={handleLogout}
      loading={logout.isPending}
    >
      {t('logout')}
    </GlassButton>
  );
};

export default HomeActions;
