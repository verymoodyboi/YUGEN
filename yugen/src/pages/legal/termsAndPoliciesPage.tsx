import React from "react";
const Section: React.FC<{ title: string; children: React.ReactNode }> = ({
  title,
  children,
}) => (
  <section className="space-y-3">
    <h2 className="text-lg title font-bold text-emerald-950">{title}</h2>
    <div className="text-sm text-emerald-950 space-y-2 leading-relaxed">
      {children}
    </div>
  </section>
);

const Legal: React.FC = () => {
  return (
    <>
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
          focused on short films and creative audiovisual works. By accessing or
          using the platform, you agree to these Terms.
        </p>

        <p>
          The platform is available to users aged <strong>13 and older</strong>.
          Users under 18 are considered minors and may be subject to additional
          safeguards, limitations, or enforcement actions.
        </p>

        <p>
          Yūgen Studios does not knowingly permit users under the age of 13.
          Accounts identified as belonging to users under 13 will be removed.
        </p>
      </Section>

      <Section title="2. Content and Platform Nature">
        <p>
          The platform hosts user-generated content, including films, videos,
          and public commentary. Some content may not be appropriate for all
          audiences.
        </p>

        <p>
          Content labeled “18+” remains accessible to all users. Labels are
          informational only and do not restrict access. Users acknowledge that
          they may encounter material not suitable for all audiences.
        </p>

        <p>
          Automated systems are used to detect and restrict explicit unlawful
          material. Public comments are not automatically moderated.
        </p>
      </Section>

      <Section title="3. User Conduct">
        <p>
          Users agree not to engage in harassment, abuse, exploitation, or
          unlawful behavior. Violations may result in content removal, account
          suspension, or permanent termination.
        </p>
      </Section>

      <Section title="4. Age Restrcitions">
        <p>
          Users aged 13–17 are subject to enhanced privacy protections and data
          minimization. Monetization and commercial participation are not
          available to minors.
        </p>
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

      {/* PRIVACY POLICY */}
      <Section title="5. Privacy Policy">
        <p>
          Yūgen Studios respects user privacy and processes personal data in
          accordance with applicable data protection laws, including the EU GDPR
          and UK GDPR.
        </p>

        <p>
          {" "}
          to read our full Privacy Policy please click{" "}
          <a href="/Yugen-Privacy-Policy-1.pdf" target="_blank" rel="noopener">
            <strong>here.</strong>
          </a>
        </p>
      </Section>

      <Section title="7. International Data Use">
        <p>
          Data may be processed outside a user’s country of residence. Where
          required, appropriate legal safeguards are applied.
        </p>
      </Section>

      {/* COPYRIGHT / DMCA */}
      <Section title="Privacy Policy">
        {`Privacy Policy of www.try-yugen.com
Last updated: January 2nd 2026
WeareYugenStudios. This privacy policy outlines how we collect, use, and protect your
personal information when you use our services.
You can contact us at support@try-yugen.com.
Table of contents
 Introduction
 Contactinformation
 Typesofdatacollected
 Modeandplaceofprocessing personal data
 Detailedinformation on the processing of personal data
 Furtherinformation
 Yourrights based on the General Data Protection Regulation (GDPR)
 Furtherinformation if you reside in Switzerland
 Furtherinformation if you reside in Brazil
 Furtherinformation if you reside in California
 Furtherinformation if you reside in Virginia
 Furtherinformation if you reside in Colorado
 Furtherinformation if you reside in Connecticut
 Furtherinformation if you reside in Utah
 Additional information about data collection and processing
 Definitions and legal references
Introduction
Whatis this policy about?
This document explains how this website collects, uses, and protects your personal data to
achieve the purposes outlined in this document.
Whatis personal data?
Personal data refers to information that can be used to identify you directly or indirectly. This
includes details such as first name, last name, email address, tracking technologies (like cookies
or tracking pixels), user activity, and device information. You can find detailed information on
each type of personal data collected in dedicated sections of this privacy policy or in text shown
before data is collected.
This document was generated with the use of the privacy policy template.
Contact Information
Email: support@try-yugen.com
Types of data collected
The types of personal data that this website collects, by itself or through third parties, may
include:
 first name;
 lastname;
 emailaddress;
 Trackers;
 SharedContent: Reviews, Videos, Images, etc…
 Usagedata
Complete details on each type of personal data collected are provided in the dedicated sections
of this privacy policy or by specific explanation texts displayed prior to the data
collection. personal data may be freely provided by you, or, in case of Usage data, collected
automatically when using this website. Unless specified otherwise, all data requested by this
website is mandatory and failure to provide this data may make it impossible for this website to
provide its services.
In cases where this website specifically states that some personal data is not mandatory, you
are free not to communicate this data without consequences to the availability or the
functioning of the service.
Any use of cookies– or of other tracking tools — by this website or by the owners of third-party
services used by this website serves the purpose of providing the service required by you, in
addition to any other purposes described in the present document.
You are responsible for any third-party personal data obtained, published or shared through
this website.
Mode and place of processing personal data
Methods of processing
Wetakeappropriate security measures to prevent unauthorized access, disclosure,
modification, or unauthorized destruction of the data. The data processing is carried out using
computers and/or IT enabled tools, following organizational procedures and modes strictly
related to the purposes indicated.
In addition to ourselves, in some cases, the data may be accessible to certain types of persons
in charge, involved with the operation of this website (e.g. administration, sales
team, marketing team, legal team).
The data mayalso be accessible to external parties appointed, if necessary, as data processors
by us.
The updated list of these parties may be requested from us at any time by contacting us at the
contact details provided in this document.
Place
The data is processed at our operating offices and in any other places where the parties
involved in the processing are located. Depending on your location, data transfers may involve
transferring your data to a country other than your own. To find out more about the place of
processing of such transferred data, you can check the section containing details about the
processing of personal data.
Retention time
Unless specified otherwise in this document, personal data shall be processed and stored for as
long as required by the purpose they have been collected for and may be retained for longer
due to applicable legal obligation or based on your consent.
Detailed information on the processing of personal data
Your personal data is collected to allow us to provide our service, comply with our legal
obligations, respond to enforcement requests, protect our rights and interests (or yours or
those of third parties), detect any malicious or fraudulent activity, as well as the purposes set
out below:
Analytics
The services contained in this section enable us to monitor and analyze web traffic and can be
used to keep track of your behavior.
Google Analytics (Universal Analytics) (Google LLC)
Google Analytics (Universal Analytics) is a web analysis service provided by Google LLC
(“Google”). Google utilizes the data collected to track and examine the use of this website, to
prepare reports on its activities and share them with other Google services. Google may use the
data collected to contextualize and personalize the ads of its own advertising network.
To understand Google's use of data, consult Google's partner policy
page
.
Personal data processed: Trackers; Usage data
Place of processing: United States
Privacy policy: https://business.safety.google/privacy/
Opt-out link: https://tools.google.com/dlpage/gaoptout
and their Business data
Category of personal information collected according to the CCPA: internet or other electronic
network activity information. This processing constitutes a sale according to the CCPA, VCDPA,
CPA, CTDPA and UCPA
Displaying content from external platforms
This type of service allows you to view content hosted on external platforms directly from the
pages of this website and interact with them. Such services are often referred to as widgets,
which are small elements placed on a website or app. They provide specific information or
perform a particular function and often allow for user interaction.This type of service might still
collect web traffic data for the pages where the service is installed, even when you do not use it.
Google Fonts (Google LLC)
Google Fonts is a typeface visualization service provided by Google LLC that allows this website
to incorporate content of this kind on its pages.
To understand Google's use of data, consult Google's partner policy
page
.
Personal data processed: Trackers; Usage data
Place of processing: United States
Privacy policy: https://business.safety.google/privacy/
Opt-out link: https://tools.google.com/dlpage/gaoptout
and their Business data
Category of Personal Information collected according to the CCPA: internet or other electronic
network activity information.
Contacting you
Contact form (this website)
By filling in the contact form with your data, you authorize this website to use these details to
reply to your requests for information, quotes or any other kind of request as indicated by the
form’s header.
Personal data processed: email address; first name; last name
Category of personal information collected according to the CCPA: identifiers. This processing
constitutes: a sale according to the CCPA, VCDPA, CPA, CTDPA and UCPA
Further information
Legal basis of processing
 Wemayprocesspersonaldatarelating to you if you have given your consent or for one
or more specific purposes: provision of data is necessary for the performance of an
agreement with you and/or for any pre-contractual obligations thereof;
 processing is necessary for compliance with a legal obligation to which we are subject;
 processing is related to a task that is carried out in the public interest or in the exercise
of official authority vested in us;
 processing is necessary for the purposes of the legitimate interests pursued by us or by
a third party.
In any case, we will gladly help to clarify the specific legal basis that applies to the processing,
and whether the provision of personal data is a statutory or contractual requirement, or a
requirement necessary to enter into a contract.
Understanding how long we keep your information
Whenwecollect your personal information, we keep it for as long as required for the purposes
wecollected for. Sometimes, we might need to keep your personal information longer due to a
legal obligation or based on your consent.
Here’s what that means in more detail. We will keep your personal information based on the
purposes and reasons set out below:
 forcontractual purposes: If we have concluded a contract with you, then we'll keep
your information until the contract has been performed in full.
 forourlegitimate interests: If we're using your personal information for purposes that
are necessary and relevant to our business operations, we'll keep it as long as we need it
for those purposes. You can learn more about these purposes within the relevant
sections of this document or by contacting us.
 withyourconsent: Wemaybeallowedto retainpersonal data for a longer period
whenever you have given consent to such processing, unless you withdraw your
consent.
 legal obligations: we may be obliged to retain personal data for a longer period
whenever required to fulfill a legal obligation or upon order of an authority.
Once the retention period expires, your personal data will be deleted. Therefore, the right of
access, the right to erasure, the right to rectification and the right to data portability cannot be
enforced after expiration of the retention period.
Information about this document
This document was generated with the use of the privacy policy template.
Your rights based on the General Data Protection Regulation (GDPR)
You mayexercise certain rights regarding your data processed by us. In particular, you have the
right to do the following, to the extent permitted by law:
 Withdrawyourconsentat any time. You have the right towithdraw consent where
they have previously given your consent to the processing of your personal data.
 Objecttoprocessing of your data. You have the right to object to the processing of your
data if the processing is carried out on a legal basis other than consent.
o Ifyourpersonal data is processed for public interest, by an official authority, or
for our legitimate business interests, you can object by providing a reason
related to your particular situation.
o However,if yourpersonal data is being processed for direct marketing purposes,
you can object at any time, free of charge, and without any reason. If you do, we
will stop using your personal data for marketing. To find out if we are using your
data for direct marketing, please refer to the relevant sections of this document.
 Accessyourdata. You have the right to learn if data is being processed by us, obtain
disclosure regarding certain aspects of the processing and obtain a copy of the data
undergoing processing.
 Verifyandseek rectification. You have the right to verify the accuracy of your data and
ask for it to be updated or corrected.
 Restrict the processing of your data. You have the right to restrict the processing of
your data. In this case, we will not process your data for any purpose other than storing
it.
 Haveyourpersonal datadeleted orotherwise removed. You have the right to obtain
the erasure of your data from us.
 Receiveyourdata andhave ittransferred to another controller. You have the right to
receive your data in a structured, commonly used and machine-readable format and, if
technically feasible, to have it transmitted to another controller without any hindrance.
 Lodgeacomplaint. Youhave the right to bring a claim before your competent data
protection authority.
 Learnaboutthereason fordata transfers. You are also entitled to learn about the legal
basis for data transfers abroad, including to any international organization governed by
public international law or set up by two or more countries, such as the UN.
 Knowaboutsecuritymeasures. You have the right to know about the security
measures we take to safeguard your data.
How to exercise these rights
Any requests to exercise your rights can be directed to us. Our full contact details can be found
at the start of this document.
Such requests are free of charge and will be answered by us as early as possible, providing you
with the information required by law.
Any rectification or erasure of personal data or restriction of processing will be communicated
by us toeach recipient, if any, to whom the personal data has been disclosed unless this proves
impossible or involves disproportionate effort. At your request, we will inform you about those
recipients.
How to exercise your rights
 Toexercise the rights described above, you need to submit your request to us by
contacting us via the contact details provided at the start of this document.
 Forustorespondtoyourrequest, we needto know whoyou areandwhich rightyou
wish to exercise.
 Wewillnotrespondtoanyrequest if we are unable to verify your identity using
commercially reasonable efforts and therefore confirm that the personal data in our
possession actually relate to you. In such cases, we may request that you provide
additional information which is reasonably necessary to authenticate you and your
request. We may retain your email address to respond to your request.
 Ifyouareanadult,you can make a request on behalf of a child under your parental
authority.
How andwhenweareexpected to handle your request
 Wewillrespondtoyourrequest without undue delay, but in all cases and at the latest
within 45 days of its receipt. Should we need more time, we will explain to you the
reasons why, and how much moretime weneed. In this regard, please note that we
maytake upto 90daysto fulfill your request.
 Shouldwedenyyourrequest, we will explain to you the reasons behind our denial
without undue delay, but in all cases and at the latest within 45 days of receipt of the
request.
 Wedonotchargeafeetorespondtoyourrequest, for up to one request per year.
Information about this document
This document was made with the use of a privacy policy template from iubenda.com.
Additional information about data collection and processing
Legal action
Your personal data may be used for legal purposes by us in Court or in the stages leading to
possible legal action arising from improper use of this website or the related services. You
declare to be aware that we may be required to reveal personal data upon request of public
authorities.
Additional information about your personal data
In addition to the information contained in this privacy policy, this website may provide you
with additional and contextual information concerning particular services or the collection and
processing of personal data upon request.
System logs and maintenance
For operation and maintenance purposes, this website and any third-party services may collect
files that record interaction with this website (System logs) or use other personal data (such as
the IP Address) for this purpose.
Information not contained in this policy
Moredetails concerning the collection or processing of personal data may be requested from
us at any time. Please see the contact information at the start of this document.
Changes to this privacy policy
Wereserve the right to make changes to this privacy policy at any time by notifying you on this
page and possibly within this website and/or- as far as technically and legally feasible- sending
a notice to you via any contact information available to us. It is strongly recommended to check
this page often, referring to the date of the last modification listed at the bottom. Should the
changes affect processing activities performed based on your consent, we shall collect new
consent from you, where required.
Definitions and legal references
Personal data (or data)
Any information that directly, indirectly, or in connection with other information — including a
personal identification number— allows for the identification or identifiability of a natural
person (in other words, you).
Usage data
Usage data is information automatically collected through this website or third-party services,
including your IP address, browser type, operating system, time and method of requests,
response status, visit duration, page sequence, and device-specific details.
This website
The meansby which your personal data is collected and processed.
Service
The service provided by this website as described in the Terms of Service and on this site.
European Union (or EU)
Unless otherwise specified, all references made within this document to the European Union
include all current member states to the European Union and the European Economic Area.
Cookie
Cookies are trackers consisting of small sets of data stored in your browser.
Tracker
Tracker indicates any technology- e.g. cookies, unique identifiers, web beacons, embedded
scripts, e-tags and fingerprinting- that enables the tracking of you, for example by accessing or
storing information on your device.
Legal information
This privacy statement has been prepared based on provisions of multiple legislations. This
privacy policy relates solely to this website, if not stated otherwise within this document.`}
      </Section>
      {/* FOOTER */}
      <div className="text-center text-xs text-emerald-950 pt-4">
        © {new Date().getFullYear()} Yūgen Studios · All rights reserved
      </div>
    </>
  );
};

export default Legal;
