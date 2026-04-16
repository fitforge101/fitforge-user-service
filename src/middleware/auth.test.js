const jwt = require('jsonwebtoken');
const auth = require('./auth');
const { JWT_SECRET } = require('../config/constants');

describe('Auth Middleware', () => {
  let req, res, next;

  beforeEach(() => {
    req = {
      header: jest.fn(),
    };
    res = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    next = jest.fn();
  });

  test('should return 401 if no token provided', () => {
    req.header.mockReturnValue(null);

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No token, authorization denied',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if token does not start with Bearer', () => {
    req.header.mockReturnValue('InvalidToken');

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'No token, authorization denied',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should call next() if valid token is provided', () => {
    const token = jwt.sign({ userId: '123' }, JWT_SECRET);
    req.header.mockReturnValue(`Bearer ${token}`);

    auth(req, res, next);

    expect(next).toHaveBeenCalled();
    expect(req.user).toEqual(expect.objectContaining({ userId: '123' }));
    expect(res.status).not.toHaveBeenCalled();
  });

  test('should return 401 if token is invalid', () => {
    req.header.mockReturnValue('Bearer invalid_token');

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token is not valid',
    });
    expect(next).not.toHaveBeenCalled();
  });

  test('should return 401 if token is expired', () => {
    const expiredToken = jwt.sign(
      { userId: '123' },
      JWT_SECRET,
      { expiresIn: '-1h' }
    );
    req.header.mockReturnValue(`Bearer ${expiredToken}`);

    auth(req, res, next);

    expect(res.status).toHaveBeenCalledWith(401);
    expect(res.json).toHaveBeenCalledWith({
      message: 'Token is not valid',
    });
    expect(next).not.toHaveBeenCalled();
  });
});
