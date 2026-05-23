import { getTranslations } from 'next-intl/server';
import PageShell from '@/components/page-shell';
import { requireAdmin } from '../_components/backoffice-guard';
import SheltersList from './_components/shelters-list';

const SheltersPage = async () => {
  await requireAdmin();
  const t = await getTranslations('backoffice');

  return (
    <PageShell
      appBar={{ title: t('shelters.title'), back: { href: '/backoffice' } }}
    >
      <SheltersList />
    </PageShell>
  );
};

export default SheltersPage;
