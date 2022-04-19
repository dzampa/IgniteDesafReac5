import Link from 'next/link'
import styles from './header.module.scss'

export default function Header() {
  // TODO
  return (
    <header className={styles.headerSpacing}>
      <Link href="/">
        <a>
          <img src="/logo.svg" alt="logo" />
        </a>
      </Link>
    </header>
  )
}
