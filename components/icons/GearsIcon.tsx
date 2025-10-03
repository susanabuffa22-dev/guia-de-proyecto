
import React from 'react';

export const GearsIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 3v3m0 12v3m9-9h-3M6 12H3m7.05-7.05-2.12 2.12M19.07 19.07l-2.12-2.12M7.05 16.95l2.12-2.12M16.95 7.05l-2.12 2.12" />
    <circle cx="6" cy="6" r="3" />
    <path d="M6 3v3m0 6V9m4.95-4.95-2.12 2.12M11.07 11.07l-2.12-2.12" />
    <circle cx="18" cy="18" r="3" />
    <path d="M18 15v3m0 6v-3m4.95-4.95-2.12 2.12M23.07 23.07l-2.12-2.12" />
  </svg>
);
