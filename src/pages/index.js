import clsx from 'clsx';
import Link from '@docusaurus/Link';
import React from 'react';
import useDocusaurusContext from '@docusaurus/useDocusaurusContext';
import Layout from '@theme/Layout';
import Heading from '@theme/Heading';

import styles from './index.module.css';

function HomepageHeader() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <header
      className={clsx('hero hero--primary', styles.heroBanner)}
      style={{
        padding: '12rem 0',
        backgroundImage: 'url(/img/hero-banner.png)',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundRepeat: 'no-repeat',
      }}>
      <div className="container" style={{ textAlign: 'center' }}>
        <Heading as="h1" className="hero__title" style={{ fontSize: '6rem', color: 'white' }}>
          Welcome to HandsUp!
        </Heading>
        <p className="hero__subtitle" style={{ fontSize: '1.8rem', color: 'white' }}>
          A computer vision-based classroom interaction system.
        </p>
      </div>
    </header>
  );
}

export default function Home() {
  const {siteConfig} = useDocusaurusContext();
  return (
    <Layout
      title="HandsUp! Project"
      description="HandsUp! - An interactive classroom system based on computer vision">
      <HomepageHeader />
      <main style={{ padding: '2rem' }}>
        <section style={{ maxWidth: '800px', margin: '0 auto', lineHeight: '1.8' }}>
          <h2>Abstract</h2>
          <p>
          Teachers often struggle to determine real-time student engagement and understanding in traditional classroom settings. Many students may feel hesitant or anxious about raising their hands due to various factors, and it becomes especially difficult to monitor individual responses in large or fast-paced classes.This lack of immediate and inclusive feedback can hinder effective classroom interaction and reduce opportunities for timely support.
          </p>
          <p>
          To address this issue, we developed HandsUp! - an intelligent classroom system based on computer vision. The system enables students to raise color cards or their hands, which are detected using a YOLO-based object detection model integrated with OpenVINO for real-time performance. It processes video input, counts the detected responses, and provides instant feedback to the teacher, enhancing communication efficiency and student engagement during lessons.
          </p>
          <p>
          HandsUp has demonstrated strong usability and adaptability across various classroom environments. It enhances inclusivity by enabling even shy or hesitant students to participate effortlessly. Through successful testing sessions and presentations, the system was proven to improve classroom flow, increase student interaction, and reduce teacher workload in managing responses. To ensure the system is practical in real-world school environments, especially those with limited computational resources, we integrated OpenVINO to optimise inference performance. This allows HandsUp to run smoothly on a wider range of hardware, making it more scalable and accessible to a broader user community.


          </p>
        </section>

        <section style={{ maxWidth: '800px', margin: '2rem auto' }}>
          <h2>Demo Video</h2>
          <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden' }}>
            <iframe
              src="https://www.youtube.com/embed/your-video-id"
              title="Project Demo Video"
              frameBorder="0"
              allowFullScreen
              style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%' }}
            ></iframe>
          </div>
        </section>

        <section style={{ maxWidth: '1100px', margin: '2rem auto' }}>
          <h2 style={{ textAlign: 'center' }}>Development Team</h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '2rem', justifyItems: 'center' }}>
            {[
              { name: 'Aishani', role: 'Roles', email: '@example.com', img: '/img/team1.jpg' },
              { name: 'Kerish', role: 'Roles', email: '@example.com', img: '/img/team2.jpg' },
              { name: 'Misha', role: 'Roles', email: '@example.com', img: '/img/team3.jpg' },
              { name: 'William', role: 'Roles', email: '@example.com', img: '/img/team4.jpg' },
            ].map((member, index) => (
              <div key={index} style={{ textAlign: 'center', width: '220px' }}>
                <img
                  src={member.img}
                  alt={member.name}
                  style={{
                    width: '150px',
                    height: '150px',
                    borderRadius: '10px',
                    objectFit: 'cover',
                    boxShadow: '0 2px 10px rgba(0,0,0,0.2)',
                    marginBottom: '1rem'
                  }}
                />
                <h4>{member.name}</h4>
                <p style={{ fontSize: '0.9rem', color: '#666' }}>{member.role}</p>
                <p style={{ fontSize: '0.85rem', color: '#999' }}>{member.email}</p>
              </div>
            ))}
          </div>
        </section>

        <section style={{ maxWidth: '800px', margin: '2rem auto' }}>
          <h2>Gantt Chart</h2>
          <img src="/img/gantt_chart.png" alt="Gantt Chart" loading="eager" style={{ width: '100%', borderRadius: '0.5rem' }} />
          <p style={{ textAlign: 'center', fontStyle: 'italic' }}>From October 21, 2024 to March 28, 2025</p>
        </section>
      </main>
    </Layout>
  );
}
