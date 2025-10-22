import React from 'react';
import { MirageLogo } from './logos/mirage-logo';

export const MirageLogoHeader = () => (
  <div className="flex items-center gap-2 my-1.5">
    <MirageLogo className="size-6.5" />
    <h2 className="text-xl font-normal font-be-vietnam-pro text-foreground dark:text-foreground">Mirage</h2>
  </div>
);
