import { Link } from "react-router-dom"

function Privacy() {
  return (
    <main className="page">
      <h1>Privacy Policy</h1>
      <p>Last updated: October 20, 2026</p>

      <p>
        HotPDF provides online tools for working with PDF documents and a
        feedback form for contacting the website author. This policy explains
        how information is handled when you use these features.
      </p>

      <h2>PDF files and processing</h2>
      <p>
        When you upload a PDF, its contents are sent to the HotPDF backend to
        perform the operation you request, such as splitting, merging,
        compressing, converting, or editing. Uploaded files and generated
        results are stored temporarily on the backend hosting service. HotPDF
        does not offer permanent document storage or a document library.
      </p>
      <p>
        Temporary files are generally eligible for automatic removal around
        60 minutes after their last access. A periodic cleanup task removes
        expired files while the backend is running; actual deletion may occur
        later, and hosting restarts may remove files earlier. Download your
        results promptly. We do not sell uploaded documents or use their
        contents for advertising.
      </p>

      <h2>File access and security</h2>
      <p>
        Temporary file names use randomly generated identifiers. Download
        links are not tied to individual user accounts, so someone with a
        valid file identifier may be able to access that file while it remains
        available. Avoid uploading highly confidential information. No online
        service can guarantee absolute security.
      </p>

      <h2>Feedback and contact information</h2>
      <p>
        If you submit feedback, HotPDF collects the name and message you
        provide, plus your email address if you choose to include one.
        Feedback is stored in a backend database so the website author can
        review, manage, and respond to messages. The database may also store
        the submission time, review status, reply content, reply time, and
        an email message identifier when a reply is sent.
      </p>
      <p>
        Providing an email address is optional. If you provide one, the
        author may use it to reply to your feedback. Please do not submit
        passwords, payment details, or other sensitive personal information.
        Feedback records are not subject to the temporary PDF-file cleanup
        schedule; they may remain in the database until removed by the
        website operator.
      </p>

      <h2>How Gmail API is used</h2>
      <p>
        HotPDF uses Google's Gmail API solely to send responses from the
        website author's own Gmail account to people who provided an email
        address with their feedback. Website visitors do not need to sign in
        with Google or grant HotPDF access to their Google accounts.
      </p>
      <p>
        For an email reply, the recipient address, email subject, and reply
        content are transmitted to Google to deliver the message. The
        backend uses an OAuth authorization granted by the website author
        for the Gmail send permission. The application does not request
        permission to read visitors' Gmail messages. Google processes
        outgoing messages under its own applicable policies.
      </p>
      <p>
        Information obtained through Google APIs is used only to provide
        the email-reply functionality described here and is not sold or used
        for advertising. HotPDF's use and transfer of information received
        from Google APIs adheres to the Google API Services User Data Policy,
        including its Limited Use requirements.
      </p>

      <h2>Analytics and service providers</h2>
      <p>
        HotPDF uses Cloudflare for website delivery and web analytics,
        Render for backend processing, and a hosted database service for
        feedback storage. Cloudflare Web Analytics helps us understand
        aggregate website visits and performance; PDF contents are not
        intentionally sent to analytics. Service providers may process
        information necessary to operate their respective services.
      </p>

      <h2>Contact and privacy requests</h2>
      <p>
        For questions about this policy or requests concerning feedback
        you submitted, contact the website author using the{" "}
        <Link to="/feedback">feedback form</Link>. If you request deletion
        of feedback, include enough information for the author to locate
        your submission, but do not include passwords or sensitive details.
      </p>

      <h2>Changes to this policy</h2>
      <p>
        This policy may change as HotPDF features or data practices change.
        The updated version will appear here with a revised date.
      </p>
    </main>
  )
}

export default Privacy
