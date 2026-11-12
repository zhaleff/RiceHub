import LegalLayout, { LegalSection, LegalContact } from './LegalLayout'
import { Link } from 'react-router-dom'

export default function Cookies() {
  return (
    <LegalLayout
      title="Cookie"
      accent="Policy"
      seoTitle="Cookie Policy"
      description="What cookies and local storage RiceHub and its providers use, and how to control them."
      url="/legal/cookies"
    >
      <LegalSection number="01" title="The short version">
        <p className="text-lg text-text leading-relaxed">
          RiceHub does not use advertising cookies, tracking pixels, or analytics that follow you across
          websites. There are no cookie banners because there is nothing optional to accept.
        </p>
        <p className="text-base text-text-dim leading-relaxed">
          A small amount of browser storage may still be used for security, bot protection, and admin
          sessions, as described below.
        </p>
      </LegalSection>

      <LegalSection number="02" title="What is a cookie">
        <p className="text-base text-text-dim leading-relaxed">
          Cookies are small text files a website stores in your browser. Similar technologies include
          local storage and session storage, which keep data in the browser without sending it with every
          request. This policy covers all three.
        </p>
      </LegalSection>

      <LegalSection number="03" title="Storage we use">
        <div className="flex flex-col gap-3">
          <div className="p-6 rounded-xl bg-surface-2">
            <p className="text-base font-semibold text-text mb-2">Essential and security</p>
            <p className="text-sm text-text-dim leading-relaxed">
              Supabase authentication stores a session token in local storage when an administrator logs
              in. This keeps the admin signed in and is required for the admin area to work. Regular
              visitors never receive this storage.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-surface-2">
            <p className="text-base font-semibold text-text mb-2">Bot protection</p>
            <p className="text-sm text-text-dim leading-relaxed">
              Cloudflare Turnstile is loaded on the submission form and may set security cookies or use
              browser storage to distinguish humans from automated traffic. It does not use the data for
              advertising.
            </p>
          </div>
          <div className="p-6 rounded-xl bg-surface-2">
            <p className="text-base font-semibold text-text mb-2">Hosting</p>
            <p className="text-sm text-text-dim leading-relaxed">
              Vercel, which serves the site, may use strictly necessary cookies or headers for routing,
              security, and load balancing.
            </p>
          </div>
        </div>
      </LegalSection>

      <LegalSection number="04" title="What we do not use">
        <p className="text-base text-text-dim leading-relaxed">
          We do not use Google Analytics, advertising networks, social media trackers, cross-site
          profiling, or any cookie that exists to build a marketing profile. RiceHub has no accounts for
          regular visitors, so there is no visitor identity to track.
        </p>
      </LegalSection>

      <LegalSection number="05" title="Third-party links">
        <p className="text-base text-text-dim leading-relaxed">
          RiceHub links to external sites such as GitHub, Reddit, ImgBB, and personal dotfile
          repositories. Once you leave RiceHub, those sites apply their own cookie and privacy policies.
          We do not control them.
        </p>
      </LegalSection>

      <LegalSection number="06" title="Managing storage">
        <p className="text-base text-text-dim leading-relaxed">
          You can delete or block cookies and local storage in your browser settings at any time. Blocking
          security storage may prevent submissions from passing bot verification, and clearing admin
          session storage will sign you out of the admin area. Deleting storage does not affect your
          ability to browse the public gallery.
        </p>
      </LegalSection>

      <LegalSection number="07" title="Changes to this policy">
        <p className="text-base text-text-dim leading-relaxed">
          If the storage we use changes, this page will be updated and the revision date above will
          change. For broader details about data handling, see the{' '}
          <Link
            to="/legal/privacy"
            className="text-accent hover:text-accent-dim transition-colors duration-200"
          >
            Privacy Policy
          </Link>.
        </p>
      </LegalSection>

      <LegalContact />
    </LegalLayout>
  )
}
