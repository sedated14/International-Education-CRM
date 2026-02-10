import React from 'react';
import { notFound } from 'next/navigation';
import PublicStudentForm from '../../../../components/public/PublicStudentForm';
import { FormConfig } from '../../../../types';

// Since this is a server component, we can fetch data directly (in a real app)
// But since we are using JSON file as DB provided via API, we'll client fetch or use a helper.
// For simplicity and consistency with the API routes, let's do Client Side Rendering wrapper or fetch in a Server Component if possible.
// Given the file/API structure, fetching via absolute URL in SC might be flaky in dev. 
// Let's use a Client Component wrapper approach or just fetch data in the component if we were using a real DB.
// Actually, I can allow the page to be a client component for simplicity of fetching from our own API.
// OR better yet, let's make it a client component that fetches on mount, matching the rest of the app pattern.

import ClientPublicFormPage from './ClientPublicFormPage';

export default function Page({ params }: { params: Promise<{ id: string }> }) {
    // Awaiting params in Next.js 15+
    const { id } = React.use(params);

    return <ClientPublicFormPage formId={id} />;
}
