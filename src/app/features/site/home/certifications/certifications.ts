import { HOME_LINKS } from '../site-home-links';

export type CertificationId = 'safe' | 'aws' | 'psm' | 'toeic';

export const CERTIFICATIONS: readonly { id: CertificationId; verifyUrl?: string }[] = [
  { id: 'safe', verifyUrl: HOME_LINKS.certifications.safe },
  { id: 'aws', verifyUrl: HOME_LINKS.certifications.aws },
  { id: 'psm', verifyUrl: HOME_LINKS.certifications.psm },
  { id: 'toeic' },
];
