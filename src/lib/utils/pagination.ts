
interface PaginationParams {
  limit?: number;
  page?: number;
}

interface PaginatedResponse<T> {
  data: T[];
  meta: {
    totalRecords: number;
    totalPages: number;
    currentPage: number;
    limit: number;
  };
}

export async function withPagination<T>(
  fetchData: (skip: number, take: number) => Promise<{ data: T[], total: number }>,
  params: Record<string, unknown>
): Promise<PaginatedResponse<T>> {
  const limit = parseInt(params.limit as string) || 10;
  const page = parseInt(params.page as string) || 1;
  const skip = (page - 1) * limit;

  const { data, total } = await fetchData(skip, limit);
  const totalPages = Math.ceil(total / limit);

  return {
    data,
    meta: {
      totalRecords: total,
      totalPages,
      currentPage: page,
      limit
    }
  };
}