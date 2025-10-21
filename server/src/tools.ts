import jwt from 'jsonwebtoken';

export function generateJwtToken(team: number): string {
    const encryptionKey = process.env.JWT_ENCRYPTION_KEY;

    const payload = {
        iat: Math.floor(Date.now() / 1000),
        team: team,
        exp: Math.floor(Date.now() / 1000) + (60 * 60), // 1 hour expiration
        sub: Math.random().toString(36).substr(2, 9) // Random subject
    };

    if (!encryptionKey) {
        throw new Error("JWT_ENCRYPTION_KEY is not set in environment variables");
    }

    return jwt.sign(payload, encryptionKey);
}

export function validateJwtToken(token: string): { team: number} | null {
    const encryptionKey = process.env.JWT_ENCRYPTION_KEY;

    if (!encryptionKey) {
        throw new Error("JWT_ENCRYPTION_KEY is not set in environment variables");
    }

    try {
        const decoded = jwt.verify(token, encryptionKey) as { team: number, exp: number };

        if (decoded.exp < Math.floor(Date.now() / 1000)) {
            console.error("JWT token has expired");
            return null;
        }
        return decoded;
    } catch (error) {
        console.error("JWT validation error:", error);
        return null;
    }

}