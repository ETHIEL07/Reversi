import { BackButton } from '../components/BackButton'

type PlaceholderScreenProps = {
  title: string
  scope: string
  onBack: () => void
}

/** Screen whose content lands later. The navigation exists, the content is announced. */
export function PlaceholderScreen({ title, scope, onBack }: PlaceholderScreenProps) {
  return (
    <section className="screen" data-testid={`${scope}-view-container`}>
      <div className="screen__bar">
        <BackButton onClick={onBack} testId={`${scope}-btn-retour`} />
      </div>

      <div className="screen__body screen--centered">
        <h2 className="screen__title" data-testid={`${scope}-text-title`}>
          {title}
        </h2>
        <p className="screen__lead" data-testid={`${scope}-text-placeholder`}>
          Contenu bientôt disponible.
        </p>
      </div>
    </section>
  )
}
