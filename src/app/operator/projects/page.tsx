import { redirect } from 'next/navigation';

/** Sites list lives on /operator — keep this route as an alias. */
export default function ProjectsPage() {
  redirect('/operator');
}
