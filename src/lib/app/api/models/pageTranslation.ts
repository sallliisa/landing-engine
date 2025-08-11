import type { PageTranslation } from '@prisma/client';
import prisma from '$lib/utils/prisma';

export default {
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
				const { action } = body;

				if (!where) throw new Error('A "where" clause must be provided for this operation.');

				if (action === 'APPROVE') {
					const record = await prisma.pageTranslation.findUnique({ where: where as any });
					if (!record) throw new Error('Record not found.');

					if (!record.live_for_id) {
						// Not linked to a published page, just promote this draft
						return await prisma.pageTranslation.update({
							where: where as any,
							data: {
								status_code: 'PUBLISHED',
								live_for_id: null
							}
						});
					}

					// Linked to a published page, do the full swap
					return await prisma.$transaction(async (tx) => {
						await tx.pageTranslation.delete({ where: { id: record.live_for_id! } });
						return await tx.pageTranslation.update({
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
					const record = await prisma.pageTranslation.findUnique({ where: where as any });
					if (!record) throw new Error('Record not found');
					return record;
				}

				return {};
			}
		}
	}
} satisfies ModelConfig<PageTranslation>; 