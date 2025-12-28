// Convert Date to HH:mm time format
export function dateToTimeFormat(date: Date): string {
  const hours = String(date.getHours()).padStart(2, '0');
  const minutes = String(date.getMinutes()).padStart(2, '0');
  return `${hours}:${minutes}`;
}

// JSON replacer for handling BigInt, Decimal, and Date serialization
export function jsonReplacer(_key: string, value: unknown): unknown {
  if (typeof value === 'bigint') {
    return value.toString();
  }
  if (value instanceof Date) {
    return value.toISOString();
  }
  if (value && typeof value === 'object') {
    // Handle Prisma Decimal type
    const constructor = (value as Record<string, unknown>).constructor;
    if (constructor && constructor.name === 'Decimal') {
      return (value as { toString(): string }).toString();
    }
  }
  return value;
}

// Helper to convert BigInt and Decimal to string for JSON serialization
// This function deeply converts all non-JSON-serializable types to JSON-compatible types
export function convertBigInt(obj: unknown): unknown {
  if (typeof obj === 'bigint') {
    return obj.toString();
  }
  if (obj === null || obj === undefined) {
    return obj;
  }
  if (Array.isArray(obj)) {
    return obj.map(convertBigInt);
  }
  if (obj && typeof obj === 'object') {
    // Handle Date objects
    if (obj instanceof Date) {
      return obj.toISOString();
    }

    const objAsRecord = obj as Record<string, unknown>;
    const constructor = objAsRecord.constructor as { name?: string };

    // Handle Prisma Decimal type - has specific structure with s, e, d properties
    // Check by structure as well as by constructor name since both methods should work
    if (
      (constructor && constructor.name === 'Decimal') ||
      (objAsRecord.s !== undefined && objAsRecord.e !== undefined && objAsRecord.d !== undefined)
    ) {
      // Try to call toString on it
      if (typeof objAsRecord.toString === 'function') {
        try {
          const result = (obj as { toString(): string }).toString();
          if (typeof result === 'string') {
            return result;
          }
        } catch {
          // If toString fails, continue to recursive conversion
        }
      }
    }

    // For any other object, recurse into properties
    // This handles plain objects and objects with custom prototypes
    const converted: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(obj)) {
      // Special handling for openTime and closeTime fields - convert to HH:mm format
      if ((key === 'openTime' || key === 'closeTime') && value instanceof Date) {
        converted[key] = dateToTimeFormat(value);
      } else {
        converted[key] = convertBigInt(value);
      }
    }
    return converted;
  }
  return obj;
}
