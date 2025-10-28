export function getDigitsOnly(value){
  if (value == null) return "";
  return String(value).replace(/\D/g, "");
}

export function formatPhoneNumber(value){
  const digits = getDigitsOnly(value);
  if (!digits) return "";

  if (digits.length <= 2) return `+${digits}`;

  const countryCode = digits.slice(0, 2);
  let rest = digits.slice(2);

  if (rest.length <= 2) {
    return `+${countryCode} ${rest}`.trim();
  }

  const areaCode = rest.slice(0, 2);
  const subscriber = rest.slice(2);

  if (!subscriber) {
    return `+${countryCode} (${areaCode})`;
  }

  const main = subscriber.slice(0, Math.max(subscriber.length - 4, 0));
  const suffix = subscriber.slice(-4);

  if (!main) {
    return `+${countryCode} (${areaCode}) ${suffix}`.trim();
  }

  return `+${countryCode} (${areaCode}) ${main}-${suffix}`;
}