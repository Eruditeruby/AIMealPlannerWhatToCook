process.env.JWT_SECRET = 'test-secret-key';

const { generateToken } = require('../../utils/token');
const authMiddleware = require('../../middleware/auth');

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe('Auth Middleware', () => {
  test('returns 401 if no token cookie present', () => {
    const req = { cookies: {} };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({ error: 'Not authenticated' });
    expect(next).not.toHaveBeenCalled();
  });

  test('returns 401 if token is invalid', () => {
    const req = { cookies: { token: 'bad.token.value' } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  test('sets req.user with decoded payload on valid token', () => {
    const token = generateToken({ _id: 'user123', email: 'a@b.com' });
    const req = { cookies: { token } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(req.user).toBeDefined();
    expect(req.user.userId).toBe('user123');
    expect(req.user.email).toBe('a@b.com');
  });

  test('calls next() on valid token', () => {
    const token = generateToken({ _id: 'user123', email: 'a@b.com' });
    const req = { cookies: { token } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(next).toHaveBeenCalled();
  });

  test('handles malformed JWT gracefully', () => {
    const req = { cookies: { token: 'not-even-a-jwt' } };
    const res = mockRes();
    const next = jest.fn();

    authMiddleware(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });
});
