import { getTranslations } from 'next-intl/server';
import PageShell from '@/components/page-shell';
import { requireAdmin } from '../_components/backoffice-guard';
import UsersList from './_components/users-list';

const UsersPage = async () => {
  const user = await requireAdmin();
  const t = await getTranslations('backoffice');

  return (
    <PageShell
      appBar={{ title: t('users.title'), back: { href: '/backoffice' } }}
    >
      <UsersList currentUserId={user.id} />
    </PageShell>
  );
};

export default UsersPage;
