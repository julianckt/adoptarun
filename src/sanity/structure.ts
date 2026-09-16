import type { StructureResolver } from 'sanity/structure';
import { CogIcon } from '@sanity/icons/Cog';
import { DocumentTextIcon } from '@sanity/icons/DocumentText';
import { PinIcon } from '@sanity/icons/Pin';
import { HeartIcon } from '@sanity/icons/Heart';

export const structure: StructureResolver = (S) =>
  S.list()
    .title('Adopt A Run Content')
    .items([
      // 1. Singletons: Site Settings & Site Copy
      S.listItem()
        .title('Site Settings')
        .id('settingsSingleton')
        .icon(CogIcon)
        .child(
          S.document()
            .schemaType('settings')
            .documentId('settings')
            .title('Site Settings')
        ),

      S.listItem()
        .title('Site Copy')
        .id('siteCopySingleton')
        .icon(DocumentTextIcon)
        .child(
          S.document()
            .schemaType('siteCopy')
            .documentId('siteCopy')
            .title('Site Copy')
        ),

      S.divider(),

      // 2. Repeatable Documents
      S.documentTypeListItem('route').title('Routes').icon(PinIcon),
      S.documentTypeListItem('charity').title('Charity Partners').icon(HeartIcon),
    ]);
