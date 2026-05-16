import JoinForm from './_components/join-form';

/**
 * SPA route per the user's directive — server shell that mounts the
 * client form. Marked dynamic so the build doesn't try to statically
 * prerender a page whose UI is fully client-driven.
 */
export const dynamic = 'force-dynamic';

const JoinPage = () => <JoinForm />;

export default JoinPage;
