export default function PrivacyPolicyPage() {
  return (
    <div className="w-full flex flex-col bg-brand-sand">
      {/* Heading of the page */}
      <section className="w-full pt-16 pb-10 px-6 sm:px-12 text-center">
        <h1 className="text-3xl sm:text-4xl font-serif font-semibold text-brand-red mb-2">
          Privacy Policy
        </h1>
        <p className="text-stone-500 text-xs sm:text-sm">
          Last updated: October 2026
        </p>
      </section>

      {/* Privacy policy for popia act */}
      <section className="w-full px-6 sm:px-12 border-t border-stone-200/60">
        <div className="max-w-3xl mx-auto py-10 space-y-6 text-left">
          <h2 className="text-2xl font-serif font-semibold text-brand-red">
            POPIA-Compliant Privacy Policy
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            Inflame (&quot;we&quot;, &quot;our&quot; or &quot;us&quot;) is committed to safeguarding your personal information in strict compliance with the Protection of Personal Information Act, 4 of 2013 (POPIA) of South Africa. This Privacy Policy outlines how we collect, process, store, transfer as well as protect your personal data across our public website, room size calculator, contact us forms and our admin systems.
          </p>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              A. Exact Personal Information Collected
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              When you interact with our online platform for example to submit an enquiry, request a quote for a custom product we collect and store the following categories of personal information:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li><strong>Contact &amp; Identity Details:</strong> First name, last name, email address and telephone number.</li>
              <li><strong>Enquiry &amp; Custom Build Specifications:</strong> Message text for general enquiries, selected product choices as well as custom braai or fireplace dimensions (width, height and depth of the custom product).</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              B. Purpose of Data Processing
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              We collect and process your personal information strictly for legitimate, necessary operational and pre contractual purposes, including:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li>Generating estimated quotes for standard stock items and custom braai or fireplace units.</li>
              <li>Dispatching automated email acknowledgements to clients upon form submission and alerting internal staff dashboards.</li>
              <li>Conducting follow up consultations and on site visits.</li>
              <li>Generating and securely storing invoices for transactions that are completed.</li>
              <li>Maintaining customer purchase and service histories for future maintenance, cleaning or upgrade opportunities.</li>
              <li>Logging quote lead data for internal sales analytics, trend analysis as well as business operations.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              C. Third-Party Cloud Operators &amp; Cross-Border Transfers (POPIA Section 72)
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              While Inflame operates locally out of Cape Town, South Africa, our application and database infrastructure utilizes globally distributed cloud services. Under Section 72 of POPIA, we explicitly disclose that your personal information is stored and processed on cross-border cloud servers managed by the following third-party platform operators:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li><strong>Vercel Inc. &amp; Render Services Inc.:</strong> Cloud application platforms hosting our web frontend and secure backend C# .NET Core REST API.</li>
              <li><strong>Supabase Inc.:</strong> Enterprise PostgreSQL database and S3 compatible object storage used to host encrypted client records, enquiry logs, and PDF invoices/photos.</li>
              <li><strong>Upstash:</strong> Serverless Redis caching infrastructure utilized exclusively for caching non-personal, public catalogue items and gallery metadata.</li>
              <li><strong>Cloudflare Inc.:</strong> Content Delivery Network (CDN), Web Application Firewall (WAF) as well as automated bot and DDoS mitigation.</li>
              <li><strong>Transactional Email Service Provider:</strong> Secure SMTP delivery provider for customer communication and automated notifications.</li>
            </ul>
            <p className="text-stone-600 text-sm leading-relaxed">
              <strong>Legal Basis for Cross-Border Transfer:</strong> Personal data is transferred across South African borders only because:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li>It is essential to perform pre-contractual measures requested by you (processing quotes)</li>
              <li>You provide active, explicit consent by submitting an enquiry form</li>
              <li>Every third-party cloud infrastructure operator is bound by strict Data Processing Agreements (DPAs), SOC 2 type II certifications, and advanced encryption standards (TLS 1.3 in transit and AES-256 at rest) that offer a level of data protection comparable to or exceeding POPIA.</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              D. Separation of Cached Public Data vs. Private Customer Data
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              To ensure maximum security and privacy:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li><strong>Edge Logging &amp; Security:</strong> Requests made to our Next.js web application pass through Cloudflare/Vercel edge networks where IP addresses, user agent strings, and timestamps are processed strictly for DDoS prevention, rate limiting, and web security. Anonymous, cookie less performance telemetry may be collected to ensure quick load times.</li>
              <li><strong>Data Isolation:</strong> No personal customer information is stored in our high speed Redis caching layer (Upstash), which caches only public catalogue products. All private personal information and uploaded invoice documents are strictly inside isolated, role-access-controlled Supabase PostgreSQL database tables and private storage buckets.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              E. Project Gallery Photo Consent
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Our administrative staff periodically photograph completed fireplace and braai installations to showcase in our website gallery.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li>Photos taken inside homes or residential properties are published only with the homeowner&apos;s consent.</li>
              <li>Published photos of products and services provided by Inflame will never disclose identifiable personal information, names of the homeowner, house numbers or specific physical street addresses.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              F. Data Subject Rights (Access, Correction &amp; Deletion)
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Under POPIA, you retain the following enforceable rights regarding your personal data:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li><strong>Right of Access:</strong> You may request details of the personal records we hold about you.</li>
              <li><strong>Right to Correction:</strong> You may request that incorrect, outdated, or incomplete details be corrected.</li>
              <li><strong>Right to Deletion:</strong> You may request the permanent removal of your client and enquiry records (which our administrative system is built to execute in order to maintain data compliance). If you would like your personal information deleted then email the Information Officer requesting for your personal information to be deleted.</li>
              <li><strong>Right to Object/Complain:</strong> You have the right to lodge a complaint regarding our data handling with the Information Regulator of South Africa.</li>
            </ul>
            <p className="text-stone-600 text-sm leading-relaxed">
              <strong>Information Regulator Contact Information:</strong>
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li>
                Website:{' '}
                <a
                  href="https://inforegulator.org.za/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-red hover:underline"
                >
                  https://inforegulator.org.za/
                </a>
              </li>
              <li>
                Complaints Email:{' '}
                <a
                  href="mailto:POPIAComplaints@inforegulator.org.za"
                  className="text-brand-red hover:underline"
                >
                  POPIAComplaints@inforegulator.org.za
                </a>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              G. Information Officer Contact Details
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              In accordance with POPIA, Inflame has designated an Information Officer responsible for ensuring data compliance:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li><strong>Information Officer:</strong> Leroy David McClure</li>
              <li><strong>Business Name:</strong> Inflame</li>
              <li><strong>Physical Address:</strong> 31 Honeywell Rd, Retreat, Cape Town, 7945</li>
              <li>
                <strong>Email Contact:</strong>{' '}
                <a href="mailto:leroy@inflame.co.za" className="text-brand-red hover:underline">
                  leroy@inflame.co.za
                </a>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* The terms and conditions */}
      <section className="w-full px-6 sm:px-12 border-t border-stone-200/60">
        <div className="max-w-3xl mx-auto py-10 space-y-6 text-left">
          <h2 className="text-2xl font-serif font-semibold text-brand-red">
            Website Terms &amp; Conditions and Liability Disclaimers
          </h2>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              A. Room Size Calculator Disclaimer (Liability Shield)
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Our online room size calculator provides users with an estimated recommended fireplace size and heat output in kilowatts based on the user entered room dimensions. This information is not stored by us.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li><strong>Mathematical Estimate Notice:</strong> The values provided by the room size calculator are general estimations only. Actual heating requirements should be discussed with Inflame.</li>
              <li><strong>Limitation of Liability:</strong> Inflame accepts no legal or financial liability for improper, insufficient, or excessive unit selection based solely on the room size calculator. Customers should confirm their fireplace heating requirements with an Inflame representative during a consultation either on site, over the phone or at Inflame&apos;s physical address.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              B. Non-Binding Estimated Quotes &amp; Pricing Disclaimer
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li><strong>Estimates Only:</strong> All pricing and items on special do not constitute a legally binding offer or contract of sale as no products can be bought directly from our website.</li>
              <li><strong>Formal Quotations:</strong> A binding agreement is formed only when an authorized Inflame staff member reviews the project requirements, verifies technical feasibility and issues an official formal quote or invoice.</li>
              <li><strong>CPA &amp; Error Clause:</strong> Under the Consumer Protection Act (CPA), Inflame reserves the right to correct manifest pricing errors, typographical oversights, or technical glitches on the website. Prices for imported heating units are subject to adjustment based on foreign exchange rate fluctuations prior to formal invoicing.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              C. Installation, Structural &amp; Fire Safety Disclaimer
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Due to fireplaces, wood burners as well as braais being high heat combustion appliances that operate at high temperatures.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li>
                <strong>Strict Safety Limitation:</strong> Inflame will not be held liable for any property damage, structural degradation, fire hazards, smoke damage, personal injury, or loss of life resulting from:
                <ol className="list-decimal pl-5 mt-1 space-y-1">
                  <li>Self-installation or third party DIY attempts</li>
                  <li>Structural modifications carried out without engineering oversight</li>
                  <li>Burning incorrect, wet, or chemically treated fuel types</li>
                  <li>Installations that fail to adhere strictly to SANS 10400-V (South African National Standard for chimneys and flues) and local municipal fire safety bylaws.</li>
                </ol>
              </li>
              <li>All installations must be commissioned by a recognized, certified installer.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              D. Third-Party Cloud Infrastructure &amp; Downtime Clause
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Our platform operates using modern microservice and cloud architecture such as Vercel, Render, Supabase as well as Upstash.
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li>While Inflame maintains a 99.9% availability target and integrates client side retry logic when submitting forms, we cannot be held legally liable for temporary website downtime, server latency for example this would include backend container cold start spin up delays on Render, delays when sending forms or any failures when delivering emails that are caused by upstream cloud infrastructure outages that are outside of our control.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              E. E-Commerce &amp; Business Disclosures (ECTA Section 43 Compliance)
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              In compliance with Section 43 of the Electronic Communications and Transactions Act (ECTA), we disclose the following legal information about the company:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li><strong>Full Legal Name:</strong> Inflame</li>
              <li><strong>Main Business Activity:</strong> Supply, customization, and installation of premium fireplaces, braais, and heating solutions.</li>
              <li><strong>Physical Address:</strong> 31 Honeywell Rd, Retreat, Cape Town, 7945</li>
              <li>
                <strong>Website Address:</strong>{' '}
                <a
                  href="https://inflame.co.za/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-brand-red hover:underline"
                >
                  https://inflame.co.za/
                </a>
              </li>
              <li><strong>Payment Terms:</strong> Formal quotes specify valid payment channels such as EFT or Card payments and required deposits for provided goods and services.</li>
              <li><strong>Cooling Off and Returns:</strong> Consumer purchases are subject to CPA and ECTA statutory cooling off rights where applicable, excluding custom fabricated units once manufacturing has commenced.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              F. Intellectual Property &amp; Acceptable Use
            </h3>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li><strong>Intellectual Property:</strong> All source code of the website, elements that have been designed, custom fireplace or braai design specifications, catalogue images of the products as well as branding are the exclusive property of Inflame and its technology provider, TCMNL Solutions.</li>
              <li><strong>Acceptable Use:</strong> Users are strictly prohibited from scraping, reverse engineering, launching automated bot attacks, executing SQL injection/XSS scripts or launching Distributed Denial of Service attacks against the site.</li>
            </ul>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              G. Governing Law &amp; Jurisdiction
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              These Terms and Conditions, as well as any disputes arising out of or in connection with the use of this website or our services, shall be governed exclusively by and construed in accordance with the laws of the Republic of South Africa. Users consent to the exclusive jurisdiction of the Western Cape High Court, Cape Town.
            </p>
          </div>
        </div>
      </section>

      {/* the PAIA manual summary */}
      <section className="w-full px-6 sm:px-12 border-t border-stone-200/60">
        <div className="max-w-3xl mx-auto py-10 space-y-6 text-left">
          <h2 className="text-2xl font-serif font-semibold text-brand-red">
            PAIA Manual Summary (Section 51 Disclosure)
          </h2>
          <p className="text-stone-600 text-sm leading-relaxed">
            In accordance with Section 51 of the Promotion of Access to Information Act 2 of 2000 (PAIA), Inflame maintains a formal PAIA Manual.
          </p>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              Summary of Held Records
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Inflame holds records under the following categories for operational and statutory compliance:
            </p>
            <ol className="list-decimal pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li><strong>Client Records:</strong> Contact details and project histories.</li>
              <li><strong>Enquiry Logs:</strong> Online message submissions, custom specs, and quote communications.</li>
              <li><strong>Financial Records:</strong> Invoices, tax records, and transactional receipts.</li>
              <li><strong>Administrative Records:</strong> Staff accounts, supplier contracts, and internal logs.</li>
            </ol>
          </div>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              Requesting Access
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Any person wishing to request access to records held by Inflame under PAIA must complete the prescribed Form 2 request and then submit it to our Information Officer at{' '}
              <a href="mailto:leroy@inflame.co.za" className="text-brand-red hover:underline">
                leroy@inflame.co.za
              </a>{' '}
              as well as pay the prescribed PAIA request fee as stated by the Information Regulator.
            </p>
          </div>
        </div>
      </section>

      {/* the cookie policy and security notice */}
      <section className="w-full pb-10 px-6 sm:px-12 border-t border-stone-200/60">
        <div className="max-w-3xl mx-auto py-10 space-y-6 text-left">
          <h2 className="text-2xl font-serif font-semibold text-brand-red">
            Cookie &amp; Security Notice
          </h2>

          <div className="space-y-3">
            <h3 className="text-lg font-serif font-semibold text-stone-800">
              Essential Cookies &amp; Edge Protection
            </h3>
            <p className="text-stone-600 text-sm leading-relaxed">
              Inflame uses essential cookies and security tokens strictly necessary for the operation, optimization, and security of our website:
            </p>
            <ul className="list-disc pl-5 space-y-1 text-stone-600 text-sm leading-relaxed">
              <li><strong>Security Tokens:</strong> We utilize Cloudflare and Vercel edge security tokens to verify bots, challenge automated attack scripts as well as to prevent malicious DDoS traffic.</li>
              <li><strong>Session Cookies:</strong> Temporary cookies are used to maintain user state when filling out custom quote requests or when using the room size calculator.</li>
            </ul>
            <p className="text-stone-600 text-sm leading-relaxed">
              We do not sell customer data or utilize intrusive third-party cross-site advertising tracking cookies.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
