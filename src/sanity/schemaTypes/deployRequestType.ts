import { defineField, defineType } from 'sanity';

/**
 * Written by the Studio "Deploy" tool. A Sanity webhook (create trigger, filter
 * `_type == "deployRequest"`) forwards each new document to the Cloudflare Workers
 * Builds Deploy Hook. The documents double as the shared cooldown/audit log.
 */
export const deployRequestType = defineType({
  name: 'deployRequest',
  title: 'Deploy Request',
  type: 'document',
  readOnly: true,
  fields: [
    defineField({ name: 'requestedAt', title: 'Requested at', type: 'datetime' }),
    defineField({ name: 'requestedBy', title: 'Requested by', type: 'string' }),
  ],
});
