# Viora — Privacy Policy

> **Placeholders.** Replace every `[BRACKETED]` token before launch:
> `[DEVELOPER NAME]` · `[PROVINCE]` · `[EFFECTIVE DATE]` ·
> `[MIN AGE]` · `[SIGNALING LOG RETENTION]` · `[UPDATE LOG RETENTION]` ·
> `[SIGNALING PROVIDER]` · `[STUN PROVIDER]` · `[TURN PROVIDER]` · `[UPDATE ENDPOINT]`
>
> **Not legal advice.** This draft is structured around Canada's PIPEDA with
> notes for provincial regimes and foreign users. Have it reviewed by a
> Canadian privacy lawyer before launch.

**Effective date:** `[EFFECTIVE DATE]`
**Operator:** `[DEVELOPER NAME]`, an individual developer in `[PROVINCE]`, Canada

## 1. Summary

Viora is a peer-to-peer screen-sharing desktop application. It is designed to
collect as little personal information as possible:

- **No accounts.** We do not ask for your email address, phone number, or any
  login credentials.
- **No recording.** Your screen, camera, microphone, and system audio are
  transmitted live to the people in your session. They are **never recorded,
  stored, or monitored** by us.
- **No analytics or advertising trackers.** The only network contacts outside
  your sessions are the signaling/STUN/TURN servers needed to establish calls
  and the update endpoint that checks for new versions.
- **Your settings stay on your device.** Your display name and preferences are
  stored in local storage on your computer and are never uploaded to us.

This summary is not a substitute for the details below.

## 2. Legal framework

Viora is operated from Canada. This policy is structured around the ten fair
information principles in Schedule 1 of the federal *Personal Information
Protection and Electronic Documents Act* (PIPEDA): accountability, identifying
purposes, consent, limiting collection, limiting use/disclosure/retention,
accuracy, safeguards, openness, individual access, and challenging compliance.

Provincial notes:

- If you are in Alberta or British Columbia, the substantially similar
  provincial private-sector privacy statutes (PIPA) apply to the collection,
  use, and disclosure of your personal information there.
- If you are in Quebec, the *Act respecting the protection of personal
  information in the private sector* (as amended by Law 25) applies, including
  its rules on consent, privacy by default, the role of the person responsible
  for personal information protection, and parental consent for minors under
  14.
- Where you are located outside Canada, the rights described in Section 13 may
  give you additional protections (EU/UK GDPR, California CCPA/CPRA).

## 3. Personal information we process

| Data | Purpose | Legal basis (PIPEDA / GDPR) | Where it goes | Retention |
|---|---|---|---|---|
| IP address (yours and your peers') | Establish WebRTC connections (ICE negotiation) via signaling, STUN, and TURN servers | Necessary to provide the service you requested (legitimate interest) | Signaling server (`[SIGNALING PROVIDER]`), STUN (`[STUN PROVIDER]`), TURN (`[TURN PROVIDER]`), and the other peers in your session | Session only; server logs kept for `[SIGNALING LOG RETENTION]` |
| Room code, peer IDs, join/leave timestamps | Create rooms and route connection setup messages | Necessary to provide the service (legitimate interest) | Signaling server (`[SIGNALING PROVIDER]`) | `[SIGNALING LOG RETENTION]`, then deleted |
| Display name you enter | Identify you to other participants in the session | Your consent (entering the name) | Stored locally on your device; shared with session peers to display; passed through signaling to join the room | On your device until you clear it; on servers only inside logs per above |
| Live media: screen content, camera video, microphone audio, system audio | Real-time sharing with session participants | Your consent (granting OS/browser capture permission and starting sharing) | Directly to peers over encrypted WebRTC; relayed as undecryptable ciphertext through TURN when direct connection fails — see Section 4 | **Never recorded or stored by us** |
| Device labels (camera/microphone/speaker names) and connection statistics (bitrate, latency, resolution) | Show you device and quality information in the app | Necessary to provide the service (legitimate interest) | Your device only; quality statistics may pass through signaling for call setup | Session only |
| App settings (theme, resolution, device selections) | Remember your preferences | n/a (local only) | Your device only (`viora-settings`) | Until you clear app data |
| Update check data (IP address, app version, operating system/architecture, timestamp) | Check for and deliver app updates | Necessary for security and maintenance (legitimate interest) | Update endpoint (`[UPDATE ENDPOINT]`) | `[UPDATE LOG RETENTION]` |

### What we do NOT collect

- No email addresses, phone numbers, or contact lists.
- No account or profile information.
- No recordings, transcripts, screenshots, or thumbnails of your sessions.
- No analytics events, crash reports, advertising identifiers, or third-party
  tracking cookies. (If this changes, this policy will be updated first — see
  Section 14.)

## 4. How live media is handled

1. **Peer-to-peer by design.** Audio, video, and screen content travel directly
   between participants over WebRTC, encrypted in transit with DTLS-SRTP.
2. **TURN relay.** When a direct connection cannot be established (e.g., strict
   firewalls or symmetric NATs), encrypted packets are relayed through our TURN
   server (`[TURN PROVIDER]`). The relay forwards ciphertext only: it can see
   your IP address and traffic volume/timing, but it **cannot decrypt or view
   the content** of your screen, audio, or video.
3. **No server-side recording.** No component of our infrastructure records,
   transcribes, or stores media content at any point.
4. **Peers can see and hear you.** Anyone in your session receives your live
   media. Viora cannot prevent another participant from recording on their own
   device — share only with people you trust and obtain any legally required
   consent before sharing (see the Terms of Service).

## 5. Service providers (sub-processors)

We rely on the following providers to operate Viora. Each processes only the
data listed in Section 3 and only for the stated purpose:

- **Signaling** — `[SIGNALING PROVIDER]`: room setup messages, IPs, timestamps.
- **STUN** — `[STUN PROVIDER]`: helps peers discover their public IP for
  direct connection; sees IPs.
- **TURN relay** — `[TURN PROVIDER]`: relays encrypted media when direct
  connection fails; sees IPs and traffic metadata, not content.
- **Update distribution** — `[UPDATE ENDPOINT]`: version checks and downloads;
  sees IP, version, OS/architecture.

We will update the list above before adding or replacing any provider.

## 6. Consent and how to withdraw it

- Joining or creating a session and entering a display name is consent to
  process the data in Section 3 for that session.
- Granting camera, microphone, and screen-capture permission — and pressing
  "share" — is consent to transmit that media to session participants.
- **Withdrawal:** stop sharing, mute, leave the session, or revoke the OS
   permission at any time. Withdrawing consent stops future processing but does
   not retroactively erase data already transmitted to peers or delete server
   logs before their retention expiry.

## 7. Limiting collection, use, disclosure, and retention

We collect only what is needed to establish and maintain your sessions and to
keep the app updated (Section 3). We do not use personal information for
advertising, profiling, or any purpose other than operating Viora. We disclose
personal information only to the providers in Section 5, to peers you choose
to connect with, or where required by law (Section 10). Server logs are kept
only for the retention periods stated above and are then deleted or
anonymized.

## 8. Accuracy

Because we hold almost no information about you, accuracy risks are minimal.
Your display name and settings are stored locally and you can correct them in
the app at any time.

## 9. Safeguards

- Media is encrypted in transit (DTLS-SRTP); signaling uses TLS.
- TURN credentials are short-lived and scoped per session where supported.
- Server access is restricted to what is needed to operate the service.
- No security measure is perfect. If a breach creates a real risk of
  significant harm, we will report it to the Office of the Privacy
  Commissioner of Canada and notify affected individuals as PIPEDA requires.

## 10. Legal disclosures

We may disclose personal information where required by valid Canadian legal
process (e.g., court order or warrant), to enforce our Terms of Service, or to
protect the safety of users or the public. We will disclose no more than is
legally required.

## 11. Children

Viora is not directed at children. You must be at least `[MIN AGE]` years old
to use Viora (`[MIN AGE]` is 13 generally, and 14 in Quebec). We do not
knowingly collect personal information from anyone below that age; if we learn
otherwise, we will delete it.

## 12. International transfers

Our providers may operate servers outside Canada and outside your province or
country. Where personal information is transferred across borders, it becomes
subject to the laws of that jurisdiction. We limit transfers to what Section
3 requires and use contractual protections with our providers.

## 13. Your rights

Under PIPEDA (and the applicable provincial statutes) you may:

- Request access to the personal information we hold about you.
- Request correction of inaccurate information.
- Withdraw consent, subject to legal or contractual restrictions and
  reasonable notice (Section 6).
- Challenge our compliance and file a complaint with the Office of the
  Privacy Commissioner of Canada (opc-privacy.gc.ca) or your provincial
  commissioner.

Additional rights by region:

- **EU/UK (GDPR):** access, rectification, erasure, restriction, portability,
  objection, and the right to lodge a complaint with your supervisory
  authority. Our legal bases are listed in Section 3.
- **California (CCPA/CPRA):** the right to know, delete, and correct personal
  information; we do not sell or share personal information as those terms are
   defined.

We will respond to rights requests within the
time the applicable law requires (generally 30 days under PIPEDA) and we will
never discriminate against you for exercising your rights.

## 14. Changes to this policy

If we make material changes, we will update the effective date above and
notify you in the app or on our download page before the changes take effect.
Continued use after the effective date constitutes acceptance.
