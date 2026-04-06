import '../styles/globals.css';
import Head from 'next/head';
import { useEffect } from 'react';

export default function App({ Component, pageProps }) {
  useEffect(() => {
    if ('scrollRestoration' in window.history)
      window.history.scrollRestoration = 'manual';
  }, []);

  return (
    <>
      <Head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#fafbfc" />
        <title>Keerthi Sagar | Enterprise Analytics Leader</title>
        <meta
          name="description"
          content="Keerthi Sagar Chegondi — Enterprise Analytics Manager. 6+ years turning data into strategic decisions across retail, edtech & manufacturing."
        />
        <meta name="keywords" content="Keerthi Sagar, Analytics, Data Science, Power BI, Snowflake, Python" />
        <meta name="author" content="Keerthi Sagar Chegondi" />
        <meta name="robots" content="index, follow" />
        <meta property="og:type" content="website" />
        <meta property="og:title" content="Keerthi Sagar | Enterprise Analytics Leader" />
        <meta property="og:description" content="Data → Decisions → Impact. Enterprise analytics portfolio." />
        <link rel="canonical" href="https://keerthisagar.vercel.app" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Component {...pageProps} />
    </>
  );
}
