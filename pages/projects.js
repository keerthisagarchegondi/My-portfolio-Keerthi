import { useEffect } from 'react';
import { useRouter } from 'next/router';
export default function ProjectsPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/#projects'); }, [router]);
  return null;
}
