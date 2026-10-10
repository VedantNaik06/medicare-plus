// Every successful response has the same shape: { success: true, data: ... }
export const ok = (res, data, status = 200) => res.status(status).json({ success: true, data });

export function pageInfo(page, limit, total) {
  return { page, limit, total, totalPages: Math.max(1, Math.ceil(total / limit)) };
}

export const skipFor = (page, limit) => (page - 1) * limit;
