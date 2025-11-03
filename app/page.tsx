'use client'

import MapComponent from '@/components/MapComponent'
import Chatbot from '@/components/Chatbot'
import styles from './page.module.css'

export default function Home() {
  return (
    <main className={styles.main}>
      <div className={styles.mapContainer}>
        <MapComponent />
      </div>
      <div className={styles.chatContainer}>
        <Chatbot />
      </div>
    </main>
  )
}

