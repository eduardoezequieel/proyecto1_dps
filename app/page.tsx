/** Página de inicio: redirige al dashboard. */
import { redirect } from 'next/navigation';

type HomePageProps = { params?: Promise<Record<string, string | string[]>> };

export default async function Home({ params }: HomePageProps) {
  if (params) await params;
  redirect('/dashboard');
}
