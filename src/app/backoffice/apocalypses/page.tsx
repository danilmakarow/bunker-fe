import { getTranslations } from 'next-intl/server';
import PageShell from '@/components/page-shell';
import { requireAdmin } from '../_components/backoffice-guard';
import ApocalypsesList from './_components/apocalypses-list';

const ApocalypsesPage = async () => {
  await requireAdmin();
  const t = await getTranslations('backoffice');

  return (
    <PageShell
      appBar={{ title: t('apocalypses.title'), back: { href: '/backoffice' } }}
    >
      <ApocalypsesList />
    </PageShell>
  );
};

export default ApocalypsesPage;
