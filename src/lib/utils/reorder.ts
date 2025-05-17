import { MESSAGE } from "$lib/app/api/constants";
import { configs } from "$lib/app/api/models/_index";
import prisma from "./prisma";

function mergeUpdateConfigs<T>(
  base: ModelConfig<T>,
  reorder?: ReorderConfig<T>
): ReorderConfig<T> {
  return {
    allow: reorder?.allow ?? false,
    axis: reorder?.axis!,
  };
}

export async function reorderEntries({oldOrder, newOrder, model, id}: {oldOrder: number, newOrder: number, model: string, id: string}) {
  if (!configs[`./${model}.ts`]) throw Error(MESSAGE.MODEL.CONFIG.NOT_FOUND);
  if (!prisma[model as keyof typeof prisma]) throw Error(MESSAGE.MODEL.NOT_FOUND);
  const config: ModelConfig<Record<string, any>> = ((await configs[`./${model}.ts`]()) as any).default;

  const mergedConfig = mergeUpdateConfigs(config, config.reorder);

  if (!mergedConfig?.allow) throw Error(MESSAGE.MODEL.OPERATION_FORBIDDEN);

  if (
    !id ||
    typeof oldOrder !== "number" ||
    typeof newOrder !== "number"
  ) {
    throw Error(
      "Invalid payload: id, old_order, and new_order are required"
    );
  }

  if (oldOrder === newOrder) {
    return { message: "No changes in order" };
  }

  // Build axis conditions based on the current item
  const currentItem = await (prisma as any)[model].findUnique({
    where: { id },
  });

  if (!currentItem) {
    throw Error(MESSAGE.MODEL.RECORD.NOT_FOUND);
  }

  // Build where clause for the axis
  const axisConditions = Object.fromEntries(
    mergedConfig.axis.map((field) => [field, currentItem[field]])
  );

  // Start a transaction to reorder entries
  await prisma.$transaction(async (tx) => {
    if (oldOrder < newOrder) {
      // Moving down in the order
      await (tx[model as any] as any).updateMany({
        where: {
          ...axisConditions,
          order: {
            gt: oldOrder,
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
      await (tx[model as any] as any).updateMany({
        where: {
          ...axisConditions,
          order: {
            gte: newOrder,
            lt: oldOrder,
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
    await (tx[model as any] as any).update({
      where: { id },
      data: { order: newOrder },
    });
  });

  return { message: "Order updated successfully" };
}