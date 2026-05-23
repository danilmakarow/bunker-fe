import { notFound } from 'next/navigation';
import { getTranslations } from 'next-intl/server';
import PageShell from '@/components/page-shell';
import type { BiologyAxisSlug } from '@/entities';
import { requireAdmin } from '../../_components/backoffice-guard';
import BiologyList from './_components/biology-list';
import BiologyAxisTabs from './_components/biology-axis-tabs';

const AXES: readonly BiologyAxisSlug[] = [
  'ages',
  'weights',
  'sexes',
  'genders',
  'races',
];

const isAxis = (value: string): value is BiologyAxisSlug =>
  (AXES as readonly string[]).includes(value);

interface BiologyPageProps {
  params: Promise<{ axis: string }>;
}

const BiologyPage = async ({ params }: BiologyPageProps) => {
  await requireAdmin();
  const { axis } = await params;

  if (!isAxis(axis)) {
    notFound();
  }

  const t = await getTranslations('backoffice');

  return (
    <PageShell
      appBar={{
        title: `${t('sections.biology')} · ${t(`biologyAxis.${axis}`)}`,
        back: { href: '/backoffice' },
      }}
    >
      <BiologyAxisTabs current={axis} />
      <BiologyList axis={axis} />
    </PageShell>
  );
};

export default BiologyPage;
