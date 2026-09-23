export interface LegalSection {
  heading: string;
  body: string[];
}

export interface LegalDoc {
  title: string;
  effectiveDate: string;
  intro: string[];
  sections: LegalSection[];
}

export const PRIVACY_DOC: LegalDoc = {
  title: 'Privacy Policy',
  effectiveDate: '[EFFECTIVE DATE]',
  intro: [
    'Viora is a peer-to-peer screen-sharing desktop application operated by the developer, an individual developer in Ontario, Canada.',
    'In short: no accounts, no recording of your sessions, no analytics or advertising trackers. Your display name and settings stay on your device. Connection setup necessarily exposes your IP address to peers and to the signaling, STUN, and TURN servers that establish your calls.',
  ],
  sections: [
    {
      heading: 'Legal framework',
      body: [
        'This policy follows the ten fair information principles in Schedule 1 of Canada’s Personal Information Protection and Electronic Documents Act (PIPEDA): accountability, identifying purposes, consent, limiting collection, limiting use/disclosure/retention, accuracy, safeguards, openness, individual access, and challenging compliance.',
        'If you are in Alberta or British Columbia, the substantially similar provincial PIPA statutes apply. If you are in Quebec, the Act respecting the protection of personal information in the private sector (as amended by Law 25) applies, including its rules on consent and parental consent for minors under 14. Users in the EU/UK and California have the additional rights described in section 11.',
      ],
    },
    {
      heading: 'Data we process',
      body: [
        'IP addresses (yours and your peers’) — to establish WebRTC connections via signaling, STUN, and TURN. Shared with the signaling server, STUN/TURN servers, and the other peers in your session. Kept in server logs for [SIGNALING LOG RETENTION], then deleted.',
        'Room code, peer IDs, join/leave timestamps — to create rooms and route connection setup. Kept for [SIGNALING LOG RETENTION].',
        'Display name you enter — to identify you to other participants. Stored locally on your device; shared with session peers.',
        'Live media (screen, camera, microphone, system audio) — transmitted peer-to-peer, encrypted in transit with DTLS-SRTP. Never recorded or stored by us. When a direct connection fails, encrypted packets are relayed through our TURN server, which forwards ciphertext only and cannot view the content.',
        'Device labels and connection statistics (bitrate, latency, resolution) — shown to you in the app; session only.',
        'App settings (resolution, device selections) — stored on your device only (viora-settings); never uploaded.',
        'Update check data (IP address, app version, OS/architecture, timestamp) — to check for and deliver app updates. Kept for [UPDATE LOG RETENTION].',
      ],
    },
    {
      heading: 'What we do not collect',
      body: [
        'No email addresses, phone numbers, or contact lists. No account or profile information. No recordings, transcripts, screenshots, or thumbnails of your sessions. No analytics events, crash reports, advertising identifiers, or third-party tracking cookies.',
      ],
    },
    {
      heading: 'Service providers',
      body: [
        'Signaling ([SIGNALING PROVIDER]): room setup messages, IPs, timestamps. STUN ([STUN PROVIDER]): helps peers discover their public IP; sees IPs. TURN relay ([TURN PROVIDER]): relays encrypted media when direct connection fails; sees IPs and traffic metadata, not content. Update distribution ([UPDATE ENDPOINT]): version checks and downloads; sees IP, version, OS/architecture.',
      ],
    },
    {
      heading: 'Consent and withdrawal',
      body: [
        'Joining or creating a session and entering a display name is consent to process the data above for that session. Granting camera, microphone, and screen-capture permission — and pressing “share” — is consent to transmit that media to participants. Withdraw at any time by stopping sharing, muting, leaving the session, or revoking the OS permission.',
      ],
    },
    {
      heading: 'Retention, accuracy, and safeguards',
      body: [
        'We collect only what is needed to run your sessions and keep the app updated. Server logs are kept only for the periods stated above, then deleted or anonymized. Media is encrypted in transit (DTLS-SRTP); signaling uses TLS. If a breach creates a real risk of significant harm, we will report it to the Office of the Privacy Commissioner of Canada and notify affected individuals as PIPEDA requires.',
      ],
    },
    {
      heading: 'Legal disclosures',
      body: [
        'We may disclose personal information where required by valid Canadian legal process, to enforce our Terms of Service, or to protect the safety of users or the public — disclosing no more than is legally required.',
      ],
    },
    {
      heading: 'Children',
      body: [
        'Viora is not directed at children. We do not knowingly collect personal information from children; if we learn that we have, we will delete it.',
      ],
    },
    {
      heading: 'International transfers',
      body: [
        'Our providers may operate servers outside Canada. Transferred information becomes subject to the laws of that jurisdiction. We limit transfers to what is required and use contractual protections with our providers.',
      ],
    },
    {
      heading: 'Changes to this policy',
      body: [
        'If we make material changes, we will update the effective date and notify you in the app or on our download page before the changes take effect. Continued use after the effective date constitutes acceptance.',
      ],
    },
    {
      heading: 'Your rights',
      body: [
        'Under PIPEDA and applicable provincial statutes you may request access to your information, request corrections, withdraw consent (subject to legal restrictions), and challenge our compliance — including by complaining to the Office of the Privacy Commissioner of Canada (opc-privacy.gc.ca). EU/UK users have GDPR rights of access, rectification, erasure, restriction, portability, and objection. California users have CCPA/CPRA rights to know, delete, and correct; we do not sell or share personal information.',
      ],
    },
  ],
};

export const TERMS_DOC: LegalDoc = {
  title: 'Terms of Service',
  effectiveDate: '[EFFECTIVE DATE]',
  intro: [
    'By downloading, installing, or using Viora (the “Service”), you agree to these Terms and to our Privacy Policy. If you do not agree, do not use the Service.',
    'Viora is experimental software operated by the developer, an individual developer in Ontario, Canada. Features may change, break, or be removed at any time; we make no commitment regarding uptime or continued development.',
  ],
  sections: [
    {
      heading: 'How sessions work',
      body: [
        'Room codes are the only access control: anyone who knows or guesses your 6-character code may join. Share codes only with people you trust, through a private channel.',
        'Display names are self-declared and not verified — a name is not proof of identity.',
        'Peers receive everything you share live. Viora cannot prevent another participant from recording or re-sharing what you broadcast on their own device. Close or hide anything you do not intend to show before sharing.',
      ],
    },
    {
      heading: 'Recording and consent — your responsibility',
      body: [
        'You are solely responsible for complying with all recording, interception, and privacy laws that apply to you and every participant. Under section 184 of Canada’s Criminal Code, intercepting a private communication without the consent of at least one party is a criminal offence; in Quebec, the consent of all parties is required. Many other jurisdictions require all-party consent. The conservative practice is to announce sharing/recording and proceed only with everyone’s agreement.',
      ],
    },
    {
      heading: 'Not for emergencies',
      body: [
        'Viora is not a telephone service and cannot place emergency calls. Do not rely on it to contact police, fire, ambulance, or other emergency services.',
      ],
    },
    {
      heading: 'Intellectual property',
      body: [
        'Your content stays yours. Because Viora is peer-to-peer and we do not store your media, you grant us no ongoing license in it. Viora’s source code is open source: you may use, copy, modify, redistribute, and fork it under the terms of its license. If you fork or redistribute it, you are responsible for your version and must comply with the license.',
      ],
    },
    {
      heading: 'Privacy',
      body: [
        'Our handling of personal information is described in the Privacy Policy. WebRTC calling necessarily exposes your IP address to peers and to the signaling/STUN/TURN servers that establish your connection.',
      ],
    },
    {
      heading: 'Disclaimers and liability',
      body: [
        'THE SERVICE IS PROVIDED “AS IS” AND “AS AVAILABLE”, WITHOUT WARRANTIES OF ANY KIND. To the maximum extent permitted by law, the developer is not liable for indirect, incidental, special, consequential, or punitive damages, or loss of data, profits, or revenue — including from content shared, recorded, or re-distributed by participants. Total liability is limited to amounts you paid for the Service. Nothing here limits liability where prohibited by your province’s consumer protection legislation. You agree to indemnify the developer against claims arising from your use, your violations of these Terms, or content you shared or recorded without required rights or consents.',
      ],
    },
    {
      heading: 'Governing law and disputes',
      body: [
        'These Terms are governed by the laws of Ontario, Canada, and applicable federal laws, without regard to conflict-of-laws rules. Disputes go exclusively before the courts of Ontario, Canada. Consumer protection legislation in your province granting additional forum or remedy rights prevails.',
      ],
    },
    {
      heading: 'Assumption of risk',
      body: [
        'You use Viora entirely at your own risk, with all faults. You are solely responsible for your conduct and for everything that happens through your use of the Service, including the content you share, receive, record, or redistribute, the people you invite, and your compliance with every law that applies to you.',
        'Risks inherent to peer-to-peer screen sharing include, without limitation: other participants recording or re-sharing what you broadcast; room codes being shared, guessed, or reused; your IP address being exposed to peers and to the signaling, STUN, and TURN providers; and defects, interruptions, or data loss in experimental software. You accept these risks.',
        'We do not monitor or control what users share and are not responsible for any user’s conduct. To the extent permitted by law, you release the developer from any claim arising from your use of the Service or another user’s conduct. Nothing in these Terms excludes liability that cannot be excluded under applicable law, including the Civil Code of Québec.',
      ],
    },
    {
      heading: 'General',
      body: [
        'These Terms plus the Privacy Policy are the entire agreement regarding the Service. Unenforceable provisions are severed; the rest continues. Failure to enforce a provision is not a waiver. You may not assign these Terms without our consent.',
      ],
    },
  ],
};
