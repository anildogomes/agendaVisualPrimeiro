
import React, { useState, useEffect } from 'react';

// SHARED UTILITY FUNCTIONS
export const timeToMinutes = (time: string): number => {
    if (!time) return 0;
    const [hours, minutes] = time.split(':').map(Number);
    return hours * 60 + minutes;
};

// ICONS
export const IconCalendar = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M8 2v4"/><path d="M16 2v4"/><rect width="18" height="18" x="3" y="4" rx="2"/><path d="M3 10h18"/></svg>
);
export const IconSettings = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 0 2l-.15.08a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.38a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1 0 2l.15-.08a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0 2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z"/><circle cx="12" cy="12" r="3"/></svg>
);
export const IconExternalLink = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M15 3h6v6"/><path d="M10 14 21 3"/><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"/></svg>
);
export const IconLogout = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" x2="9" y1="12" y2="12"/></svg>
);
export const IconChevronLeft = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m15 18-6-6 6-6"/></svg>
);
export const IconChevronRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m9 18 6-6-6-6"/></svg>
);
export const IconChevronsLeft = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m11 17-5-5 5-5"/><path d="m18 17-5-5 5-5"/></svg>
);
export const IconChevronDown = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m6 9 6 6 6-6"/></svg>
);
export const IconCheck = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 6 9 17l-5-5"/></svg>
);
export const IconUsers = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
);
export const IconBell = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>
);
export const IconChart = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 3v18h18"/><path d="m19 9-5 5-4-4-3 3"/></svg>
);
export const IconTrendingUp = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>
);
export const IconGlobe = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20"/><path d="M2 12h20"/></svg>
);

export const IconHome = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
);
export const IconStore = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="m2 7 4.41-4.41A2 2 0 0 1 7.83 2h8.34a2 2 0 0 1 1.42.59L22 7"/><path d="M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8"/><path d="M15 22v-4a2 2 0 0 0-2-2h-2a2 2 0 0 0-2 2v4"/><path d="M2 7h20"/><path d="M22 7v3a2 2 0 0 1-2 2v0a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 16 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 12 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 8 12a2.7 2.7 0 0 1-1.59-.63.7.7 0 0 0-.82 0A2.7 2.7 0 0 1 4 12v0a2 2 0 0 1-2-2V7"/></svg>
);
export const IconScissors = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><line x1="20" x2="8.12" y1="4" y2="15.88"/><line x1="14.47" x2="20" y1="14.48" y2="20"/><line x1="8.12" x2="12" y1="8.12" y2="12"/></svg>
);
export const IconBriefcase = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="7" rx="2" ry="2"/><path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"/></svg>
);
export const IconDollarSign = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="12" x2="12" y1="2" y2="22"/><path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/></svg>
);
export const IconClock = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
);
export const IconPlus = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M5 12h14"/><path d="M12 5v14"/></svg>
);
export const IconEdit = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
);
export const IconX = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
);
export const IconMenu = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="18" x2="21" y2="18"/></svg>
);
export const IconBlock = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="m4.9 4.9 14.2 14.2"/></svg>
);
export const IconDownload = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" x2="12" y1="15" y2="3"/></svg>
);
export const IconMessageSquare = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>
);
export const IconShare = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><line x1="8.59" x2="15.42" y1="13.51" y2="17.49"/><line x1="15.41" x2="8.59" y1="6.51" y2="10.49"/></svg>
);
export const IconSun = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m4.93 17.66 1.41-1.41"/><path d="m17.66 4.93 1.41-1.41"/></svg>
);

export const IconMoon = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 3a6 6 0 0 0 9 9 9 9 0 1 1-9-9Z"/></svg>
);

export const IconInstagram = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
);

export const IconWhatsApp = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" /><path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1a5 5 0 0 0 5 5h1a.5.5 0 0 0 0-1h-1a.5.5 0 0 0 0 1" /></svg>
);

export const IconAlertTriangle = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" x2="12" y1="9" y2="13"/><line x1="12" x2="12.01" y1="17" y2="17"/></svg>
);

export const IconMapPin = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z"/><circle cx="12" cy="10" r="3"/></svg>
);

export const IconPhone = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
);

export const IconCamera = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
);

export const IconActivity = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
);

export const IconCreditCard = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="20" height="14" x="2" y="5" rx="2"/><line x1="2" x2="22" y1="10" y2="10"/></svg>
);
export const IconList = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><line x1="8" x2="21" y1="6" y2="6"/><line x1="8" x2="21" y1="12" y2="12"/><line x1="8" x2="21" y1="18" y2="18"/><line x1="3" x2="3.01" y1="6" y2="6"/><line x1="3" x2="3.01" y1="12" y2="12"/><line x1="3" x2="3.01" y1="18" y2="18"/></svg>
);
export const IconStar = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
);

export const IconUser = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
);

export const IconUserX = (props: React.SVGProps<SVGSVGElement>) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="17" x2="22" y1="8" y2="13"/><line x1="22" x2="17" y1="8" y2="13"/></svg>
);

export const IconInfo = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
);

export const IconTrash = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
);

export const IconSearch = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
);

export const IconFilter = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
);

export const IconMoreVertical = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/></svg>
);

export const IconCopy = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>
);

export const IconSave = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M19 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11l5 5v11a2 2 0 0 1-2 2z"/><polyline points="17 21 17 13 7 13 7 21"/><polyline points="7 3 7 8 15 8"/></svg>
);

export const IconShield = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10"/></svg>
);

export const IconSmartphone = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><rect width="14" height="20" x="5" y="2" rx="2" ry="2"/><path d="M12 18h.01"/></svg>
);

export const IconLink = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71"/><path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71"/></svg>
);

// PHONE INPUT COMPONENT
const COUNTRY_CODES = [
    { code: '+55', country: 'BR', flag: '🇧🇷', mask: '(##) #####-####' },
    { code: '+1', country: 'US', flag: '🇺🇸', mask: '(###) ###-####' },
    { code: '+351', country: 'PT', flag: '🇵🇹', mask: '### ### ###' },
    { code: '+44', country: 'UK', flag: '🇬🇧', mask: '#### ###### ' },
    { code: '+34', country: 'ES', flag: '🇪🇸', mask: '### ### ###' },
    { code: '+33', country: 'FR', flag: '🇫🇷', mask: '## ## ## ## ##' },
    { code: '+49', country: 'DE', flag: '🇩🇪', mask: '#### #######' },
    { code: '+39', country: 'IT', flag: '🇮🇹', mask: '### #######' },
    { code: '+81', country: 'JP', flag: '🇯🇵', mask: '## #### ####' },
    { code: '+86', country: 'CN', flag: '🇨🇳', mask: '### #### ####' },
];

interface PhoneInputProps {
    value: string;
    onChange: (value: string) => void;
    id?: string;
    label?: string;
    placeholder?: string;
    required?: boolean;
}

export const PhoneInput: React.FC<PhoneInputProps> = ({ value, onChange, id, label, placeholder, required = false }) => {
    const [selectedCountry, setSelectedCountry] = useState(COUNTRY_CODES[0]);
    const [localNumber, setLocalNumber] = useState('');

    // Initialize state from incoming value
    useEffect(() => {
        if (!value) {
            setLocalNumber('');
            return;
        }

        // Try to find the country code in the value
        const foundCountry = COUNTRY_CODES.find(c => value.startsWith(c.code));
        if (foundCountry) {
            setSelectedCountry(foundCountry);
            setLocalNumber(value.replace(foundCountry.code, '').trim());
        } else {
             // If no known code found, try to remove +55 default or just show as is
             // This handles potential legacy data or user entered formats
             const cleanVal = value.replace('+55', '').replace(selectedCountry.code, '').trim();
             setLocalNumber(cleanVal);
        }
    }, [value]); 

    const handleCountryChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const newCode = e.target.value;
        const country = COUNTRY_CODES.find(c => c.code === newCode) || COUNTRY_CODES[0];
        setSelectedCountry(country);
        onChange(`${country.code} ${localNumber}`);
    };

    const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        let input = e.target.value;
        setLocalNumber(input);
        onChange(`${selectedCountry.code} ${input}`);
    };
    
    const currentPlaceholder = placeholder || selectedCountry.mask || 'Digite o número';

    return (
        <div className="w-full">
            {label && <label htmlFor={id} className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">{label}</label>}
            
            <div className="flex items-center rounded-lg border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 shadow-sm focus-within:ring-2 focus-within:ring-gold-500 focus-within:border-gold-500 focus-within:ring-offset-0 overflow-hidden transition-all">
                
                {/* Country Select Area */}
                <div className="relative flex items-center border-r border-slate-300 dark:border-slate-600 bg-slate-50 dark:bg-slate-800/50 min-w-[90px] sm:min-w-[100px]">
                    <select
                        id={`${id}-country`}
                        name="country"
                        className="w-full appearance-none bg-transparent py-3 pl-3 pr-8 text-sm text-slate-700 dark:text-slate-200 focus:outline-none cursor-pointer z-10 relative"
                        value={selectedCountry.code}
                        onChange={handleCountryChange}
                    >
                        {COUNTRY_CODES.map((country) => (
                            <option key={country.code} value={country.code} className="text-slate-900 bg-white dark:bg-slate-800 dark:text-slate-100">
                                {country.flag} {country.code}
                            </option>
                        ))}
                    </select>
                    {/* Custom Chevron to replace native select arrow */}
                    <div className="absolute right-2 pointer-events-none text-slate-400 z-0">
                        <IconChevronDown className="w-3 h-3" />
                    </div>
                </div>

                {/* Number Input Area */}
                <input
                    type="tel"
                    name={id}
                    id={id}
                    className="flex-1 appearance-none border-none bg-transparent py-3 px-3 text-slate-900 placeholder-slate-400 focus:ring-0 sm:text-sm dark:text-slate-100 w-full min-w-0"
                    placeholder={currentPlaceholder}
                    value={localNumber}
                    onChange={handleNumberChange}
                    required={required}
                />
            </div>
             <p className="mt-1 text-[10px] text-slate-400 pl-1">
                Ex: {selectedCountry.mask}
             </p>
        </div>
    );
};


// SHARED COMPONENTS
type ConfirmationModalProps = {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => void;
    title: string;
    message: string;
    confirmButtonText?: string;
};

export const ConfirmationModal: React.FC<ConfirmationModalProps> = ({ isOpen, onClose, onConfirm, title, message, confirmButtonText = 'Confirmar' }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-[100] flex justify-center items-center p-4 backdrop-blur-sm">
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-2xl p-6 w-full max-w-sm transform transition-all scale-100 animate-fade-in-down border border-slate-200 dark:border-slate-700">
                <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 mb-2">{title}</h3>
                <p className="text-slate-600 dark:text-slate-400 mb-6 text-sm leading-relaxed">{message}</p>
                <div className="flex justify-end space-x-3">
                    <button 
                        onClick={onClose} 
                        className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 dark:bg-slate-700 dark:text-slate-300 dark:hover:bg-slate-600 transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                        onClick={onConfirm} 
                        className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-lg hover:bg-red-700 shadow-lg shadow-red-600/20 transition-colors"
                    >
                        {confirmButtonText}
                    </button>
                </div>
            </div>
        </div>
    );
};

interface StatCardProps {
    icon: React.ReactNode;
    title: string;
    value: string | number;
    change?: string;
    isPositive?: boolean;
    color?: 'gold' | 'primary' | 'emerald' | 'indigo';
}

export const StatCard: React.FC<StatCardProps> = ({ icon, title, value, change, isPositive, color = 'gold' }) => {
    const colorClasses = {
        gold: 'bg-gold-100 text-gold-600 dark:bg-gold-900/20 dark:text-gold-400',
        primary: 'bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400',
        emerald: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400',
        indigo: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-900/20 dark:text-indigo-400',
    };

    return (
        <div className="bg-white dark:bg-slate-800 p-5 rounded-xl shadow-sm border border-slate-100 dark:border-slate-700 flex items-center justify-between transition-all hover:shadow-md">
            <div className="flex items-center">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color]}`}>
                    {icon}
                </div>
                <div className="ml-4">
                    <p className="text-xs font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wider">{title}</p>
                    <p className="text-2xl font-bold text-slate-900 dark:text-slate-100 font-serif mt-0.5">{value}</p>
                </div>
            </div>
             {change && (
                <div className={`flex items-center text-xs font-bold px-2 py-1 rounded-full ${isPositive ? 'bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400' : 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'}`}>
                    {isPositive ? '↑' : '↓'} {change}
                </div>
            )}
        </div>
    );
};

// --- CHARTS ---

export const BarChart: React.FC<{
    data: { label: string; value: number }[];
    barColorClass?: string;
    labelValue?: (value: number) => string;
    height?: number;
}> = ({ data, barColorClass = 'bg-indigo-500 dark:bg-indigo-400', labelValue = (v) => v.toString(), height = 64 }) => {
    if (!data || data.length === 0) {
        return <div className={`text-center h-${height} flex items-center justify-center text-slate-500 dark:text-slate-400`}>Nenhum dado para exibir.</div>;
    }
    const maxValue = Math.max(...data.map(d => d.value), 1);

    return (
        <div className={`h-${height} flex items-end justify-around gap-2 sm:gap-3 pt-6 pb-2`}>
            {data.map((item, i) => (
                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                    <div className="relative w-full flex items-end h-full justify-center">
                         {/* Tooltip */}
                         <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-slate-800 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none whitespace-nowrap z-10">
                            {item.label}: {labelValue(item.value)}
                        </div>
                        <div
                            className={`w-full max-w-[40px] ${barColorClass} rounded-t-sm opacity-80 group-hover:opacity-100 transition-all duration-500 ease-out`}
                            style={{ height: `${(item.value / maxValue) * 100}%`, minHeight: '4px' }}
                        />
                    </div>
                    <span className="text-[10px] font-medium text-slate-400 dark:text-slate-500 truncate w-full text-center">{item.label}</span>
                </div>
            ))}
        </div>
    );
};

export const LineChart: React.FC<{
    data: { label: string; value: number }[];
    color?: string;
    height?: number;
}> = ({ data, color = '#6366f1', height = 64 }) => {
    if (!data || data.length < 2) return null;

    const maxValue = Math.max(...data.map(d => d.value)) * 1.1; // +10% padding
    const minValue = 0;
    const points = data.map((d, i) => {
        const x = (i / (data.length - 1)) * 100;
        const y = 100 - ((d.value - minValue) / (maxValue - minValue)) * 100;
        return `${x},${y}`;
    }).join(' ');

    return (
        <div className={`h-${height} w-full relative pt-4`}>
             <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="w-full h-full overflow-visible">
                {/* Grid lines */}
                <line x1="0" y1="0" x2="100" y2="0" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                <line x1="0" y1="50" x2="100" y2="50" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                <line x1="0" y1="100" x2="100" y2="100" stroke="currentColor" className="text-slate-100 dark:text-slate-700" strokeWidth="0.5" vectorEffect="non-scaling-stroke" />
                
                {/* The Line */}
                <polyline
                    fill="none"
                    stroke={color}
                    strokeWidth="2"
                    points={points}
                    vectorEffect="non-scaling-stroke"
                    className="drop-shadow-md"
                />
                
                {/* Area under line (optional, simplistic) */}
                <polygon
                    fill={color}
                    fillOpacity="0.1"
                    points={`0,100 ${points} 100,100`}
                    vectorEffect="non-scaling-stroke"
                />
            </svg>
             <div className="flex justify-between mt-2 text-[10px] text-slate-400">
                {data.filter((_, i) => i % Math.ceil(data.length / 6) === 0).map((d, i) => (
                    <span key={i}>{d.label}</span>
                ))}
            </div>
        </div>
    );
};

export const DonutChart: React.FC<{
    data: { label: string; value: number; color: string }[];
    size?: number;
}> = ({ data, size = 120 }) => {
    const total = data.reduce((acc, curr) => acc + curr.value, 0);
    let currentAngle = 0;

    if (total === 0) return <div className="w-full text-center text-xs text-slate-400">Sem dados</div>;

    return (
        <div className="flex items-center gap-6">
            <div className="relative flex-shrink-0" style={{ width: size, height: size }}>
                <svg viewBox="0 0 100 100" className="transform -rotate-90 w-full h-full">
                    {data.map((slice, i) => {
                        const percentage = slice.value / total;
                        const dashArray = percentage * 100 * Math.PI; // Circumference is ~314
                        const dashOffset = 0; // We rotate the circle instead
                        
                        // Calculation for path drawing is complex in raw SVG without path commands. 
                        // Using stroke-dasharray on circles is easier.
                        // C = 2 * PI * r. Let r = 15.9155 => C = 100.
                        
                        const r = 15.9155;
                        const cx = 50;
                        const cy = 50;
                        
                        const segment = (
                            <circle
                                key={i}
                                r={r}
                                cx={cx}
                                cy={cy}
                                fill="transparent"
                                stroke={slice.color}
                                strokeWidth="10" // Thickness
                                strokeDasharray={`${slice.value / total * 100} 100`}
                                strokeDashoffset={-currentAngle}
                                className="transition-all duration-500"
                            />
                        );
                        currentAngle += (slice.value / total) * 100;
                        return segment;
                    })}
                    {/* Inner circle for donut effect */}
                    <circle r="10" cx="50" cy="50" fill="transparent" /> 
                </svg>
                <div className="absolute inset-0 flex items-center justify-center flex-col">
                    <span className="text-xs font-bold text-slate-700 dark:text-slate-200">{total}</span>
                    <span className="text-[8px] text-slate-500 uppercase">Total</span>
                </div>
            </div>
            <div className="flex flex-col gap-2">
                {data.map((item, i) => (
                    <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }}></span>
                        <span className="text-slate-600 dark:text-slate-300">{item.label}</span>
                        <span className="font-bold text-slate-800 dark:text-slate-100 ml-auto">
                            {Math.round((item.value / total) * 100)}%
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};


export const Pagination: React.FC<{
    currentPage: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    totalItems: number;
    itemsPerPage: number;
}> = ({ currentPage, totalPages, onPageChange, totalItems, itemsPerPage }) => {
    if (totalPages <= 1) return null;

    const startItem = (currentPage - 1) * itemsPerPage + 1;
    const endItem = Math.min(currentPage * itemsPerPage, totalItems);

    return (
        <div className="bg-slate-50 dark:bg-slate-800/50 px-4 py-3 flex items-center justify-between border-t border-slate-200 dark:border-slate-700 sm:px-6 mt-auto">
            <div className="flex-1 flex justify-between sm:hidden">
                <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Anterior</button>
                <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="ml-3 relative inline-flex items-center px-4 py-2 border border-slate-300 text-sm font-medium rounded-md text-slate-700 bg-white hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200 dark:hover:bg-slate-700">Próximo</button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                    <p className="text-sm text-slate-700 dark:text-slate-300">
                        Mostrando <span className="font-medium">{startItem}</span> a <span className="font-medium">{endItem}</span> de <span className="font-medium">{totalItems}</span> resultados
                    </p>
                </div>
                <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                        <button onClick={() => onPageChange(currentPage - 1)} disabled={currentPage === 1} className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                            <span className="sr-only">Anterior</span>
                            <IconChevronLeft className="h-5 w-5" aria-hidden="true" />
                        </button>
                        <span className="relative inline-flex items-center px-4 py-2 border border-slate-300 bg-white text-sm font-medium text-slate-700 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-200">
                            Página {currentPage} de {totalPages}
                        </span>
                        <button onClick={() => onPageChange(currentPage + 1)} disabled={currentPage === totalPages} className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-slate-300 bg-white text-sm font-medium text-slate-500 hover:bg-slate-50 disabled:opacity-50 dark:bg-slate-800 dark:border-slate-600 dark:text-slate-300 dark:hover:bg-slate-700">
                            <span className="sr-only">Próximo</span>
                            <IconChevronRight className="h-5 w-5" aria-hidden="true" />
                        </button>
                    </nav>
                </div>
            </div>
        </div>
    );
};