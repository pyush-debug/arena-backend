// Env validation disabled for GoDaddy Beta compatibility.
// GoDaddy injects its own env vars and doesn't provide all ours.

export function validate(config: Record<string, unknown>) {
  return config;
}

