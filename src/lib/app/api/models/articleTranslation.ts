import { parseSlug } from "$lib/utils/common";
import type { ArticleTranslation } from "@prisma/client";
import prisma from '$lib/utils/prisma';
import { ensureArticleDraftState } from '$lib/utils/article';

export default {
  allow: true,
  // fields: ['id', 'article_id', 'language', 'title'],

  create: {
    allow: false,
  },

  update: {
    by: ['id'],
    fields: ['title', 'slug', 'content', 'excerpt', 'thumbnail', 'status_code'],
    validation: {
      title: [
        {
          validator: (value: string) => value && value.length > 0,
          message: 'Title is required'
        }
      ]
    },
    lifecycle: {
      async pre(body) {
        if (body.title) {
          body.slug = parseSlug(body.title);
        }
        // Ensure draft state if updating a published translation
        if (body.id) {
          const { translation, created } = await ensureArticleDraftState(body.id);
          if (created) {
            // If a draft was created, update the body to use the draft's id
            body.id = translation.id;
          }
        }
        return body;
      }
    },
  },

  delete: {
    by: ['id']
  },

  detail: {
    by: ['article_id', 'language'],
    lifecycle: {
      async main(where) {
        console.log('[ArticleTranslation.detail] where:', where);
        // Try to find a draft first
        const draft = await prisma.articleTranslation.findFirst({
          where: { ...where, status_code: 'DRAFT' }
        });
        console.log('[ArticleTranslation.detail] draft:', draft);
        if (draft) return draft;

        // If no draft, try to find published
        const published = await prisma.articleTranslation.findFirst({
          where: { ...where, status_code: 'PUBLISHED' }
        });
        console.log('[ArticleTranslation.detail] published:', published);
        if (published) return published;

        console.log('[ArticleTranslation.detail] No draft or published translation found for:', where);
        throw new Error('No draft or published translation found for this article/language.');
      }
    }
  },

  verify: {
    allow: true,
    by: 'id',
    stateField: 'status_code',
    initialState: 'DRAFT',
    states: ['DRAFT', 'PUBLISHED'],
    transitions: {
      APPROVE: {
        from: 'DRAFT',
        to: 'PUBLISHED'
      },
      REVISE: {
        from: 'DRAFT',
        to: 'DRAFT'
      }
    },
    lifecycle: {
      async main(body, locals, where) {
        const { id, action } = body;

        if (!where) throw new Error('A "where" clause must be provided for this operation.');

        if (action === 'APPROVE') {
          const record = await prisma.articleTranslation.findUnique({ where: where as any });
          if (!record) throw new Error('Record not found.');

          if (!record.live_for_id) {
            // Not linked to a published article, just promote this draft
            return await prisma.articleTranslation.update({
              where: where as any,
              data: {
                status_code: 'PUBLISHED',
                live_for_id: null
              }
            });
          }

          // Linked to a published article, do the full swap
          return await prisma.$transaction(async (tx) => {
            await tx.articleTranslation.delete({ where: { id: record.live_for_id! } });
            return await tx.articleTranslation.update({
              where: where as any,
              data: {
                status_code: 'PUBLISHED',
                live_for_id: null
              }
            });
          });
        } else if (action === 'REVISE') {
          // For revision, we just return the record unchanged.
          // The log with the description is created by the generic handler.
          const record = await prisma.articleTranslation.findUnique({ where: where as any });
          if (!record) throw new Error('Record not found');
          return record;
        }
        
        return {};
      }
    }
  }
} as ModelConfig<ArticleTranslation>;