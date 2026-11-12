import LegalLayout, { LegalSection, LegalContact } from './LegalLayout'
import { Link } from 'react-router-dom'

const RULES = [
  'Submit only setups and screenshots you created or have permission to share.',
  'Credit the original author when a configuration is based on someone else\'s work.',
  'Keep titles, descriptions, and images free of harassment, hate, and NSFW material.',
  'Do not upload malware, phishing links, or deceptive download links.',
  'Do not attempt to break, overload, scrape aggressively, or bypass rate limits and bot checks.',
]

export default function Terms() {
  return (
    <LegalLayout
      title="Terms of"
      accent="Use"
      seoTitle="Terms of Use"
      description="The rules for using RiceHub, submitting content, and how moderation works."
      url="/legal/terms"
    >
      <LegalSection number="01" title="Acceptance">
        <p className="text-lg text-text leading-relaxed">
          By using RiceHub you agree to these terms. If you do not agree, please do not use the site. The
          terms apply to every visitor, including people who only browse and people who submit content.
        </p>
      </LegalSection>

      <LegalSection number="02" title="What RiceHub is">
        <p className="text-base text-text-dim leading-relaxed">
          RiceHub is a free community gallery for Linux desktop configurations and dotfiles. It is a
          showcase, not a file host, marketplace, or support service. We may add, change, or remove
          features at any time.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Acceptable use">
        <p className="text-base text-text-dim leading-relaxed mb-2">
          You agree not to misuse the site. In particular:
        </p>
        <ul className="flex flex-col gap-3">
          {RULES.map((rule) => (
            <li key={rule} className="flex gap-3 text-base text-text-dim leading-relaxed">
              <span className="text-accent">—</span>
              <span>{rule}</span>
            </li>
          ))}
        </ul>
      </LegalSection>

      <LegalSection number="04" title="Your submissions">
        <p className="text-base text-text-dim leading-relaxed">
          You keep ownership of the content you submit. By submitting, you give RiceHub a non-exclusive,
          worldwide, royalty-free license to display, resize, and distribute that content as part of the
          site and its previews. This license ends when the submission is removed, except for copies
          already cached or shared by third parties.
        </p>
        <p className="text-base text-text-dim leading-relaxed">
          You confirm that you have the right to share everything you submit, including screenshots,
          wallpapers, and links. Do not submit personal information you do not want to be public.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Moderation">
        <p className="text-base text-text-dim leading-relaxed">
          Every submission is reviewed manually. We may reject, edit, hide, or remove any content at our
          discretion, with or without notice, if it breaks these terms or does not fit the gallery. We are
          not obliged to publish any submission.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Copyright">
        <p className="text-base text-text-dim leading-relaxed">
          If you believe content on RiceHub infringes your copyright, email us with the link to the
          submission, a description of the work, and a statement that you own it or are authorized to act
          for the owner. Valid requests are handled by removing or crediting the content.
        </p>
      </LegalSection>

      <LegalSection number="07" title="External links">
        <p className="text-base text-text-dim leading-relaxed">
          Submissions may link to external repositories and websites. We do not control those sites and
          are not responsible for their content, availability, licenses, or security. Downloading and using
          shared dotfiles is at your own risk.
        </p>
      </LegalSection>

      <LegalSection number="08" title="Availability and liability">
        <p className="text-base text-text-dim leading-relaxed">
          RiceHub is provided as is and without warranties of any kind. We do not guarantee that the site
          will be available, error-free, or that data will never be lost. To the maximum extent permitted
          by law, RiceHub and its operator are not liable for indirect or consequential damages arising
          from use of the site.
        </p>
      </LegalSection>

      <LegalSection number="09" title="Changes to these terms">
        <p className="text-base text-text-dim leading-relaxed">
          These terms may be updated as the site evolves. The date at the top of this page shows the most
          recent revision. Continuing to use RiceHub after a change means you accept the updated terms. For
          how data is handled, see the{' '}
          <Link
            to="/legal/privacy"
            className="text-accent hover:text-accent-dim transition-colors duration-200"
          >
            Privacy Policy
          </Link>{' '}
          and the{' '}
          <Link
            to="/legal/cookies"
            className="text-accent hover:text-accent-dim transition-colors duration-200"
          >
            Cookie Policy
          </Link>.
        </p>
      </LegalSection>

      <LegalContact />
    </LegalLayout>
  )
}
