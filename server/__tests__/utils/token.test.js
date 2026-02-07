const jwt = require('jsonwebtoken');

process.env.JWT_SECRET = 'test-secret-key';
process.env.JWT_EXPIRES_IN = '7d';

const { generateToken, verifyToken } = require('../../utils/token');

describe('Token Utility', () => {
  const user = { _id: 'abc123', email: 'test@example.com' };

  test('generateToken returns a valid JWT string', () => {
    const token = generateToken(user);
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  test('token contains userId and email in payload', () => {
    const token = generateToken(user);
    const decoded = jwt.decode(token);
    expect(decoded.userId).toBe('abc123');
    expect(decoded.email).toBe('test@example.com');
  });

  test('token expires in configured time', () => {
    const token = generateToken(user);
    const decoded = jwt.decode(token);
    expect(decoded.exp).toBeDefined();
    expect(decoded.exp - decoded.iat).toBe(7 * 24 * 60 * 60); // 7 days
  });

  test('verifyToken returns decoded payload', () => {
    const token = generateToken(user);
    const decoded = verifyToken(token);
    expect(decoded.userId).toBe('abc123');
    expect(decoded.email).toBe('test@example.com');
  });

  test('verifyToken throws on invalid token', () => {
    expect(() => verifyToken('invalid.token.here')).toThrow();
  });
});
