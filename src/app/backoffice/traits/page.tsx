import { getTranslations } from 'next-intl/server';
import PageShell from '@/components/page-shell';
import { requireAdmin } from '../_components/backoffice-guard';
import TraitsList from './_components/traits-list';

const TraitsPage = async () => {
  await requireAdmin();
  const t = await getTranslations('backoffice');

  return (
    <PageShell
      appBar={{ title: t('traits.title'), back: { href: '/backoffice' } }}
    >
      <TraitsList />
    </PageShell>
  );
};

export default TraitsPage;
