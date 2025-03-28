import { PrismaClient } from '@prisma/client';
import type { RequestHandler } from './$types';
import prisma from '$lib/utils/prisma';
import { exception } from '$lib/utils/response';
import { MESSAGE } from '$lib/app/api/constants';
import { configs } from '$lib/app/api/models/_index';

export const POST: RequestHandler = async ({ request }) => {
	try {
		const body = await request.json();
		const { model, data } = body;

		if (!configs[`./${model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND)
		if (!prisma[model as keyof typeof prisma]) throw Error(MESSAGE.MODEL.NOT_FOUND)
		const config: ModelConfig<Record<string, any>> = (await configs[`./${model}.ts`]() as any).default
		if (!config.reorder?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN)

		if (
			!model ||
			!data ||
			!data.id ||
			typeof data.order !== 'number' ||
			typeof data.display_order !== 'number'
		) return new Response(JSON.stringify({ error: 'Invalid payload' }), { status: 400 });
		

		const { id, order: currentOrder, display_order: newOrder } = data;

		if (currentOrder === newOrder) return new Response(JSON.stringify({ message: 'No changes in order' }), { status: 200 })

		const table = prisma[model as keyof PrismaClient];

		if (!table) return new Response(JSON.stringify({ error: 'Invalid model' }), { status: 400 })

		// Build group condition based on config
		const groupConditions: Record<string, any> = {};
		if (config.reorder.by) {
				for (const field of config.reorder.by) {
						if (data[field] !== undefined) {
								groupConditions[field] = data[field];
						}
				}
		}

		// Start a transaction to reorder entries
		await prisma.$transaction(async (tx) => {
				// Adjust orders of affected rows
				if (currentOrder < newOrder) {
						// Moving down in the order
						await (tx[model] as any).updateMany({
								where: {
										...groupConditions,
										order: {
												gt: currentOrder,
												lte: newOrder,
										},
								},
								data: {
										order: {
												decrement: 1,
										},
								},
						});
				} else {
						// Moving up in the order
						await (tx[model] as any).updateMany({
								where: {
										...groupConditions,
										order: {
												gte: newOrder,
												lt: currentOrder,
										},
								},
								data: {
										order: {
												increment: 1,
										},
								},
						});
				}

				// Update the order of the current item
				await (tx[model] as any).update({
						where: { id, ...groupConditions },
						data: { order: newOrder },
				});
		});

		return new Response(JSON.stringify({ message: 'Order updated successfully' }), { status: 200 });
	} catch (error) {
		console.error('Error reordering:', error);
		return exception(String(error));
	}
};