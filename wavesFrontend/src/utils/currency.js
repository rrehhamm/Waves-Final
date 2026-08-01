const CURRENCY_LABEL = 'JD';

export function formatCurrency(amount) {
    const value = Number(amount);
    const safeValue = Number.isFinite(value) ? value : 0;
    return `${safeValue.toFixed(2)} ${CURRENCY_LABEL}`;
}

export default formatCurrency;
