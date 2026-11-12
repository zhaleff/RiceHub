import LegalLayout, { LegalSection, LegalContact } from './LegalLayout'
import { Link } from 'react-router-dom'

const SERVICES = [
  { name: 'Supabase', detail: 'Stores rice submissions, votes, and admin authentication' },
  { name: 'ImgBB', detail: 'Hosts submitted screenshots' },
  { name: 'Cloudflare Turnstile', detail: 'Verifies submissions are not automated' },
  { name: 'Vercel', detail: 'Hosts and serves the website' },
]

export default function Privacy() {
  return (
    <LegalLayout
      title="Privacy"
      accent="Policy"
      seoTitle="Privacy Policy"
      description="How RiceHub collects, uses, and protects data submitted to the community."
      url="/legal/privacy"
    >
      <LegalSection number="01" title="What we collect">
        <p className="text-lg text-text leading-relaxed">
          When you submit a rice, we store the information you provide: title, description, screenshot,
          window manager, distro, license, and an optional link to your dotfiles. Submissions do not
          require an account or a real name.
        </p>
        <p className="text-base text-text-dim leading-relaxed">
          To prevent spam, we record a one-way cryptographic hash of your IP address at the time of
          submission. This hash cannot be reversed back into your original IP address, and it is only
          used to enforce a submission rate limit.
        </p>
      </LegalSection>

      <LegalSection number="02" title="How we use it">
        <p className="text-lg text-text leading-relaxed">
          Submitted content is reviewed manually before it appears publicly. Approved rices are shown
          to every visitor. We do not sell data, run ads, or share submissions with advertisers.
        </p>
        <p className="text-base text-text-dim leading-relaxed">
          Data is used only to operate RiceHub: displaying approved submissions, counting votes,
          preventing abuse, and keeping the service available.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Third-party services">
        <p className="text-base text-text-dim leading-relaxed mb-2">
          RiceHub relies on a small number of external services to operate:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {SERVICES.map(({ name, detail }) => (
            <div key={name} className="flex flex-col gap-2 p-6 rounded-xl bg-surface-2">
              <p className="text-base font-semibold text-text">{name}</p>
              <p className="text-sm text-text-dim">{detail}</p>
            </div>
          ))}
        </div>
        <p className="text-base text-text-dim leading-relaxed">
          These providers process data under their own privacy policies. We only share what is needed
          for the service to work.
        </p>
      </LegalSection>

      <LegalSection number="04" title="Cookies and local storage">
        <p className="text-lg text-text leading-relaxed">
          RiceHub does not use tracking or advertising cookies. See the{' '}
          <Link
            to="/legal/cookies"
            className="text-accent hover:text-accent-dim transition-colors duration-200"
          >
            Cookie Policy
          </Link>{' '}
          for details about the limited storage used by the site and its providers.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Data removal">
        <p className="text-lg text-text leading-relaxed">
          You can request removal of a submission you made, including its screenshot and any associated
          metadata, at any time. No account or proof of ownership beyond a reasonable description of the
          submission is required. Removal requests are typically processed within a few days.
        </p>
        <p className="text-base text-text-dim leading-relaxed">
          Note that content already shared publicly or indexed by search engines may remain in caches
          controlled by third parties after removal from RiceHub.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Your rights">
        <p className="text-base text-text-dim leading-relaxed">
          You may ask what data we hold about you, request a correction, or request deletion. Because we
          do not require accounts, we may need enough information to identify the specific submission.
          Requests are handled in good faith and without charge.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Changes to this policy">
        <p className="text-base text-text-dim leading-relaxed">
          This policy may be updated as RiceHub changes. The date at the top of this page shows the most
          recent revision. Continued use of the site after an update means you accept the revised policy.
        </p>
      </LegalSection>

      <LegalContact />
    </LegalLayout>
  )
}
