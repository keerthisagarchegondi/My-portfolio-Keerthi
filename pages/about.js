import { useEffect } from 'react';
import { useRouter } from 'next/router';
export default function AboutPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/#about'); }, [router]);
  return null;
}
