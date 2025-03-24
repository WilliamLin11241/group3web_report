import clsx from 'clsx';
import Link from '@docusaurus/Link';
import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';

import Heading from '@theme/Heading';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header className={clsx('hero hero--primary', styles.heroBanner)}>
      <div className="container">
      <Heading as="h1" className="hero__title">
        HandsUp Project
      </Heading>
      <p className="hero__subtitle">
        A computer vision-based classroom interaction system.
      </p>

        <div className={styles.buttons}>
          <Link
            className="button button--secondary button--lg"
            to="/docs/intro">
            Docusaurus Tutorial - 5min ⏱️
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="HandsUp Project"
      description="HandsUp - An interactive classroom system based on computer vision">
      <main style={{ padding: '2rem' }}>
        <h1 style={{ textAlign: 'center', fontSize: '3rem' }}>HandsUp</h1>
        <p style={{ fontSize: '1.2rem', lineHeight: '1.8', maxWidth: '800px', margin: '2rem auto 0 auto', textAlign: 'justify' }}>
         <strong>HandsUp Home page</strong>
        </p>
      </main>
    </Layout>
  );
}
