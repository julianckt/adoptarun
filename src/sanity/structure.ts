import type { StructureResolver } from 'sanity/structure';
import { CogIcon } from '@sanity/icons/Cog';
import { PinIcon } from '@sanity/icons/Pin';
import { HeartIcon } from '@sanity/icons/Heart';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Adopt A Run Content')
    .items([
      // 1. Singleton: Site Copy & Global Settings at the top
      S.listItem()
        .title('Site Copy & Settings')
        .id('siteCopySingleton')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('siteCopy')
            .documentId('siteCopy')
            .title('Site Copy & Global Settings')
        ),

      S.divider(),

      // 2. Repeatable Documents
      S.documentTypeListItem('route').title('Routes').icon(PinIcon),
      S.documentTypeListItem('charity').title('Charity Partners').icon(HeartIcon),
    ]);
