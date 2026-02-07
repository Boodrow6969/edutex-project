import { FormErrorBoundary } from '@/components/stakeholder-form/FormErrorBoundary';
import { StakeholderForm } from '@/components/stakeholder-form/StakeholderForm';

export const dynamic = 'force-dynamic';

interface PageProps {
  params: Promise<{ token: string }>;
}

export default async function StakeholderFormPage({ params }: PageProps) {
  const { token } = await params;

  return (
    <FormErrorBoundary>
      <StakeholderForm token={token} />
    </FormErrorBoundary>
  );
}
