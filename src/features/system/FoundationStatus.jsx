import { hasFirebaseConfig } from '../../services/firebase/client.js'

function FoundationStatus() {
  return (
    <article className="foundation-card">
      <h2>System Check</h2>
      <ul className="foundation-card__list">
        <li>
          <strong>Frontend:</strong> React 19 + Vite 8 initialized.
        </li>
        <li>
          <strong>Backend SDK:</strong> Firebase client package installed.
        </li>
        <li>
          <strong>Environment:</strong>{' '}
          {hasFirebaseConfig
            ? 'Firebase keys detected.'
            : 'Add your Firebase keys in .env.local.'}
        </li>
        <li>
          <strong>Architecture:</strong> components, features, services, and utils
          folders are in place.
        </li>
      </ul>
    </article>
  )
}

export default FoundationStatus