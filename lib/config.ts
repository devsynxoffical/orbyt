export function isMockMode(): boolean {
  // Production always uses the database — never fall back to in-memory mock data.
  if (process.env.NODE_ENV === "production") {
    return false;
  }

  return (
    process.env.USE_MOCK_DATA === "true" ||
    process.env.USE_MOCK_DATA === "1" ||
    !process.env.DATABASE_URL?.startsWith("postgresql://")
  );
}
