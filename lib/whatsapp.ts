export function normalizeWhatsAppNumber(number: string): string {
  return number.replace(/\D/g, "");
}

export function buildWhatsAppUrl(number: string, message: string): string {
  const digits = normalizeWhatsAppNumber(number);
  if (!digits) return "";
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

export function buildPaymentWhatsAppMessage(params: {
  userName: string;
  toolName: string;
  amountPkr: number;
  bankName: string;
  orderId: string;
}): string {
  return [
    "Hi, I have submitted a payment for tool access.",
    "",
    `Name: ${params.userName}`,
    `Tool: ${params.toolName}`,
    `Amount: PKR ${params.amountPkr.toLocaleString()}`,
    `Bank: ${params.bankName}`,
    `Order ID: ${params.orderId}`,
    "",
    "I have attached the payment screenshot in the order. Please confirm.",
  ].join("\n");
}
