import React from "react";
import FuzzyText from "../../SmallComponents/FuzzyText";

const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="space-y-3">
    <h2 className="text-lg font-bold text-emerald-950">{title}</h2>
    <div className="text-sm text-emerald-950 space-y-2 leading-relaxed">
      {children}
    </div>
  </section>
);

const Legal: React.FC = () => {
  return (
    <div className="flex min-h-screen w-screen items-center justify-center bg-emerald-50 px-4 py-10">
      <div className="title w-full max-w-4xl rounded-3xl border-2 border-emerald-950 bg-emerald-50 shadow-xl p-6 md:p-8 overflow-y-auto max-h-[85vh] space-y-10 hidden-scrollbar">
        {/* Header */}
        <div className="text-center text-xl justify-center space-y-2 ">
          Yūgen Studios
          <p className="text-emerald-950 text-sm">
            Terms of Service · Privacy Policy · Copyright / DMCA
          </p>
        </div>

        {/* TERMS OF SERVICE */}
        <Section title="1. Terms of Service">
          <p>
            Yūgen Studios is a video-on-demand and social networking platform
            focused on short films and creative audiovisual works. By accessing
            or using the platform, you agree to these Terms.
          </p>

          <p>
            The platform is available to users aged{" "}
            <strong>13 and older</strong>. Users under 18 are considered minors
            and may be subject to additional safeguards, limitations, or
            enforcement actions.
          </p>

          <p>
            Yūgen Studios does not knowingly permit users under the age of 13.
            Accounts identified as belonging to users under 13 will be removed.
          </p>
        </Section>

        <Section title="2. Content and Platform Nature">
          <p>
            The platform hosts user-generated content, including films, videos,
            and public commentary. Some content may be labeled as intended for
            mature audiences.
          </p>

          <p>
            Content labeled “18+” remains accessible to all users. Labels are
            informational only and do not restrict access. Users acknowledge
            that they may encounter material not suitable for all audiences.
          </p>

          <p>
            Automated systems are used to detect and restrict explicit unlawful
            material. Public comments are not automatically moderated.
          </p>
        </Section>

        <Section title="3. User Conduct">
          <p>
            Users agree not to engage in harassment, abuse, exploitation, or
            unlawful behavior. Sexualization of minors, grooming behavior, and
            predatory conduct are strictly prohibited.
          </p>

          <p>
            Violations may result in content removal, account suspension, or
            permanent termination.
          </p>
        </Section>

        <Section title="4. Minor Accounts">
          <p>
            Users aged 13–17 are subject to enhanced privacy protections and
            data minimization. Monetization and commercial participation are not
            available to minors.
          </p>
        </Section>

        {/* PRIVACY POLICY */}
        <Section title="5. Privacy Policy">
          <p>
            Yūgen Studios respects user privacy and processes personal data in
            accordance with applicable data protection laws, including the EU
            GDPR and UK GDPR.
          </p>

          <p>
            We collect only data necessary to provide platform functionality,
            ensure safety, and maintain service integrity.
          </p>
        </Section>

        <Section title="6. Data Concerning Minors">
          <p>
            We do not knowingly collect personal data from children under 13.
            Users aged 13–17 receive enhanced protections, including:
          </p>
          <ul className="list-disc list-inside">
            <li>Reduced data collection</li>
            <li>No behavioral advertising</li>
            <li>No sale of personal data</li>
            <li>Limited profiling</li>
          </ul>
        </Section>

        <Section title="7. International Data Use">
          <p>
            Data may be processed outside a user’s country of residence. Where
            required, appropriate legal safeguards are applied.
          </p>
        </Section>

        {/* COPYRIGHT / DMCA */}
        <Section title="8. Copyright & DMCA Policy">
          <p>
            Yūgen Studios respects intellectual property rights and expects
            users to do the same.
          </p>

          <p>
            If you believe content on the platform infringes your copyright, you
            may submit a notice including:
          </p>

          <ul className="list-disc list-inside">
            <li>Your contact information</li>
            <li>Identification of the copyrighted work</li>
            <li>Identification of the allegedly infringing content</li>
            <li>
              A statement that you have a good-faith belief the use is not
              authorized
            </li>
            <li>
              A statement made under penalty of perjury that the information is
              accurate
            </li>
          </ul>

          <p>
            Notices may be sent to: <strong>copyright@try-yugen.com</strong>
          </p>

          <p>
            Repeat infringers may have their accounts terminated where required
            by law.
          </p>
        </Section>

        {/* FOOTER */}
        <div className="text-center text-xs text-emerald-950 pt-4">
          © {new Date().getFullYear()} Yūgen Studios · All rights reserved
        </div>
      </div>
    </div>
  );
};

export default Legal;
