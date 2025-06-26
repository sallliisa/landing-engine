import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { PrismaClient } from '@prisma/client';
import { exception, success } from '$lib/utils/response';

const prisma = new PrismaClient();

export const GET: RequestHandler = async ({ url }) => {
	const startMonth = url.searchParams.get('start_month');
	const endMonth = url.searchParams.get('end_month');
	const eventType = url.searchParams.get('event_type');

	if (!startMonth || !endMonth || !eventType) {
		return exception('Missing required query parameters: start_month, end_month, event_type');
	}

	try {
		const startDate = new Date(startMonth);
		const tempEndDate = new Date(endMonth);
		// To include the entire end month, we set the date to the first day of the *next* month.
		const endDate = new Date(tempEndDate.getFullYear(), tempEndDate.getMonth() + 1, 1);

		if (isNaN(startDate.getTime()) || isNaN(tempEndDate.getTime())) {
			return exception('Invalid date format. Use YYYY-MM-01.');
		}

		let data;

		if (eventType === 'website_visit') {
			// For website_visit, we group by month using a raw query for efficiency.
			const result: { month: string; count: bigint }[] = await prisma.$queryRaw`
                SELECT TO_CHAR(timestamp, 'YYYY-MM') as month, COUNT(*) as count
                FROM "AnalyticsEvent"
                WHERE type = ${eventType} AND timestamp >= ${startDate} AND timestamp < ${endDate}
                GROUP BY month
                ORDER BY month;
            `;
			data = result.map((item) => ({
				label: `${item.month}-01`,
				value: Number(item.count)
			}));
      console.log('data', data)
		} else {
			const groupByField = {
				page_view: 'source',
				cta_click: 'name',
				contact_click: 'name',
				calculator_usage: 'source'
			}[eventType];

			if (!groupByField) {
				return exception(`Invalid event_type: ${eventType}`);
			}

			const result = await prisma.analyticsEvent.groupBy({
				by: [groupByField as 'name' | 'source'],
				where: {
					type: eventType,
					timestamp: {
						gte: startDate,
						lt: endDate
					}
				},
				// Count by a guaranteed non-null field like `id`.
				_count: {
					id: true
				},
				// Order by the count of that field.
				orderBy: {
					_count: {
						id: 'desc'
					}
				}
			});

			data = result.map((item) => {
				const rawLabel = item[groupByField as 'name' | 'source'] || 'Unknown';
				let finalLabel = rawLabel;

				// If grouping by source, extract the slug from the URL path.
				if (groupByField === 'source' && rawLabel !== 'Unknown') {
					const slug = rawLabel.split('/').pop();
					// Use the slug as the label. If the slug is empty (for root path), use '/'.
					finalLabel = slug || '/';
				}

				return {
					label: finalLabel,
					value: item._count?.id ?? 0
				};
			});

      console.log('result', eventType, result,)
		}

		return success({data});
	} catch (error) {
		console.error('Failed to fetch dashboard data:', error);
		return exception('An internal server error occurred.');
	}
};
