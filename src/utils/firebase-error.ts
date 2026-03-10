/**
 * Type guard and utilities for Firebase error handling.
 * Replaces unsafe `(error as any).code` pattern throughout the codebase.
 */

export interface FirebaseError extends Error {
    code: string;
    customData?: Record<string, unknown>;
}

/**
 * Type guard to check if an unknown error is a Firebase error with a `.code` property.
 * @example
 * try { ... } catch (error) {
 *   if (isFirebaseError(error)) {
 *     console.log(error.code); // type-safe
 *   }
 * }
 */
export function isFirebaseError(error: unknown): error is FirebaseError {
    return (
        error instanceof Error &&
        'code' in error &&
        typeof (error as FirebaseError).code === 'string'
    );
}

/**
 * Extracts the Firebase error code from an unknown error, or returns undefined.
 */
export function getFirebaseErrorCode(error: unknown): string | undefined {
    if (isFirebaseError(error)) {
        return error.code;
    }
    return undefined;
}

/**
 * Returns a user-friendly message for common Firebase Auth error codes.
 */
export function getAuthErrorMessage(error: unknown): string {
    const code = getFirebaseErrorCode(error);
    switch (code) {
        case 'auth/user-not-found':
            return 'Usuário não encontrado';
        case 'auth/wrong-password':
            return 'Senha incorreta';
        case 'auth/invalid-credential':
            return 'E-mail ou senha incorretos';
        case 'auth/network-request-failed':
            return 'Erro de conexão com o servidor';
        case 'auth/email-already-in-use':
            return 'Este e-mail já está cadastrado no sistema';
        case 'auth/weak-password':
            return 'Senha muito fraca. Use no mínimo 6 caracteres';
        case 'auth/too-many-requests':
            return 'Muitas tentativas. Tente novamente mais tarde';
        case 'permission-denied':
            return 'Permissão negada. Verifique as regras de segurança';
        default:
            return 'E-mail ou senha incorretos';
    }
}
