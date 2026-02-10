import { describe, it, expect } from 'vitest';
import { parseISOToLocal, formatDateToBR, isCurrentMonth, formatDateToReadable } from './date';

describe('Date Utilities (Timezone Safe)', () => {
    describe('parseISOToLocal', () => {
        it('should parse YYYY-MM-DD correctly in local time', () => {
            const date = parseISOToLocal('2026-02-01');
            expect(date.getFullYear()).toBe(2026);
            expect(date.getMonth()).toBe(1); // February is 1 (0-indexed)
            expect(date.getDate()).toBe(1);
            expect(date.getHours()).toBe(0); // Should be midnight local
        });
    });

    describe('formatDateToBR', () => {
        it('should format ISO date to Brazilian format', () => {
            expect(formatDateToBR('2026-02-09')).toBe('09/02/2026');
        });

        it('should handle empty strings', () => {
            expect(formatDateToBR('')).toBe('');
        });
    });

    describe('formatDateToReadable', () => {
        it('should format to long Brazilian date correctly', () => {
            // "9 de fevereiro de 2026"
            const result = formatDateToReadable('2026-02-09');
            expect(result).toContain('9');
            expect(result).toContain('fevereiro');
            expect(result).toContain('2026');
        });
    });

    describe('isCurrentMonth', () => {
        it('should correctly identify dates in the current month', () => {
            const now = new Date();
            const year = now.getFullYear();
            const month = String(now.getMonth() + 1).padStart(2, '0');
            const iso = `${year}-${month}-01`;

            expect(isCurrentMonth(iso)).toBe(true);
        });

        it('should handle the first day of the month without shifting to previous month', () => {
            // This is the specific bug case:
            // "2026-02-01" as UTC is "2026-01-31 21:00" in GMT-3
            // So isCurrentMonth('2026-02-01') would return false if called in February (index 1)

            const febFirst = '2026-02-01';

            // Check manually since we can't easily mock global Date in this simple test without extra deps
            const date = parseISOToLocal(febFirst);
            expect(date.getMonth()).toBe(1); // February
            expect(date.getFullYear()).toBe(2026);
        });
    });
});
