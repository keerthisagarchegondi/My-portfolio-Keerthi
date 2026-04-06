import { useEffect } from 'react';
import { useRouter } from 'next/router';
export default function ContactPage() {
  const router = useRouter();
  useEffect(() => { router.replace('/#contact'); }, [router]);
  return null;
}
