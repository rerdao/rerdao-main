'use client'

import styles from './index.module.scss'

export default function ScrollButton() {
  return (
    <span className={styles['scroll-btn']}>
      <p>
        <span className={styles['mouse']}>
          <span />
        </span>
      </p>
      <p className={styles['action-btn']}>scroll me</p>
    </span>
  )
}
