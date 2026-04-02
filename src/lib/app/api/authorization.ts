import prisma from '$lib/utils/prisma';
import { exception } from '$lib/utils/response';
import { requireAuthenticatedUser, requirePermission } from '$lib/utils/routing';
import type { RequestEvent } from '@sveltejs/kit';

export type CrudOperation = 'list' | 'detail' | 'create' | 'update' | 'delete' | 'reorder' | 'verify';

type AuthorizableOperationConfig<T> = Pick<BaseOperationConfig<T>, 'permission' | 'authorize'>;

export function getDefaultPermissionCode(model: string, operation: CrudOperation) {
  const operationPrefixMap = {
    list: 'view',
    detail: 'detail',
    create: 'create',
    update: 'update',
    delete: 'delete',
    reorder: 'update',
    verify: 'verify',
  } as const;

  return `${operationPrefixMap[operation]}-${model}`;
}

export function resolvePermissionCode(
  model: string,
  operation: CrudOperation,
  explicitPermission?: string,
): string | undefined {
  return explicitPermission ?? getDefaultPermissionCode(model, operation);
}

export async function authorizeOperation<T>(
  event: RequestEvent,
  model: string,
  operation: CrudOperation,
  config?: AuthorizableOperationConfig<T>,
  input: Record<string, any> = {},
) {
  requirePermission(event.locals, resolvePermissionCode(model, operation, config?.permission));

  if (config?.authorize) {
    await config.authorize(event, input);
  }
}

export function requireRoleScopedAccess(
  locals: App.Locals,
  allowedRoleIds: number[],
  notFoundMessage = 'Record not found',
) {
  const user = requireAuthenticatedUser(locals);
  if (locals.isPrivilegedRole) return;

  // No explicit role bindings means the resource is unrestricted.
  if (!allowedRoleIds.length) {
    return;
  }

  if (!allowedRoleIds.includes(user.role_id)) {
    throw exception(notFoundMessage, 404);
  }
}

export async function requireMenuItemAccess(event: RequestEvent, input: Record<string, any>) {
  const id = input.id ?? input.menu_item_id;
  if (!id) return;

  const record = await prisma.menuItem.findUnique({
    where: { id: String(id) },
    select: {
      allowedRoles: {
        select: { id: true },
      },
    },
  });

  if (!record) throw exception('Record not found', 404);
  requireRoleScopedAccess(event.locals, record.allowedRoles.map((role) => role.id));
}

export async function requireFormTypeAccess(event: RequestEvent, input: Record<string, any>) {
  const id = input.id ?? input.form_type_id;
  if (!id) return;

  const record = await prisma.formType.findUnique({
    where: { id: String(id) },
    select: {
      allowedRoles: {
        select: { id: true },
      },
    },
  });

  if (!record) throw exception('Record not found', 404);
  requireRoleScopedAccess(event.locals, record.allowedRoles.map((role) => role.id));
}

export async function requireArticleCategoryAccess(event: RequestEvent, input: Record<string, any>) {
  const id = input.id ?? input.article_category_id;
  if (!id) return;

  const record = await prisma.articleCategory.findUnique({
    where: { id: String(id) },
    select: {
      allowedRoles: {
        select: { id: true },
      },
    },
  });

  if (!record) throw exception('Record not found', 404);
  requireRoleScopedAccess(event.locals, record.allowedRoles.map((role) => role.id));
}

export async function requireArticleAccess(event: RequestEvent, input: Record<string, any>) {
  const id = input.id ?? input.article_id;
  if (!id) return;

  const record = await prisma.article.findUnique({
    where: { id: String(id) },
    select: {
      categories: {
        select: {
          allowedRoles: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!record) throw exception('Record not found', 404);

  const allowedRoleIds = record.categories.flatMap((category) =>
    category.allowedRoles.map((role) => role.id),
  );

  requireRoleScopedAccess(event.locals, allowedRoleIds);
}

export async function requireArticleTranslationAccess(event: RequestEvent, input: Record<string, any>) {
  const id = input.id;
  if (id) {
    const record = await prisma.articleTranslation.findUnique({
      where: { id: String(id) },
      select: {
        article: {
          select: {
            id: true,
          },
        },
      },
    });

    if (!record) throw exception('Record not found', 404);
    await requireArticleAccess(event, { id: record.article.id });
    return;
  }

  if (input.article_id) {
    await requireArticleAccess(event, { id: input.article_id });
  }
}

export async function requirePageTranslationAccess(event: RequestEvent, input: Record<string, any>) {
  const id = input.id ?? input.page_translation_id;
  if (!id) return;

  const record = await prisma.pageTranslation.findUnique({
    where: { id: String(id) },
    select: {
      page: {
        select: {
          menuItem: {
            select: {
              allowedRoles: {
                select: { id: true },
              },
            },
          },
        },
      },
    },
  });

  if (!record?.page?.menuItem) throw exception('Record not found', 404);
  requireRoleScopedAccess(
    event.locals,
    record.page.menuItem.allowedRoles.map((role) => role.id),
  );
}

export async function requireFormSubmissionAccess(event: RequestEvent, input: Record<string, any>) {
  const id = input.id;
  if (!id) return;

  const record = await prisma.formSubmission.findUnique({
    where: { id: String(id) },
    select: {
      formType: {
        select: {
          allowedRoles: {
            select: { id: true },
          },
        },
      },
    },
  });

  if (!record) throw exception('Record not found', 404);
  requireRoleScopedAccess(
    event.locals,
    record.formType.allowedRoles.map((role) => role.id),
  );
}
