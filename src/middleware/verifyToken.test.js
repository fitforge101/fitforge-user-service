const jwt = require('jsonwebtoken');
const verifyToken = require('./verifyToken');

describe('verifyToken middleware', () => {
  const JWT_SECRET = process.env.JWT_SECRET || 'fitforge_dev_secret';
  let mockReq;
  let mockRes;
  let nextFunction;

  beforeEach(() => {
    mockReq = {
      headers: {},
    };
    mockRes = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn().mockReturnThis(),
    };
    nextFunction = jest.fn();
  });

  it('should pass if token is valid', () => {
    const payload = { userId: '12345' };
    const token = jwt.sign(payload, JWT_SECRET);
    mockReq.headers.authorization = `Bearer ${token}`;

    verifyToken(mockReq, mockRes, nextFunction);

    expect(nextFunction).toHaveBeenCalled();
    expect(mockReq.user).toMatchObject(payload);
  });

  it('should return 401 if no authorization header is present', () => {
    verifyToken(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
    expect(nextFunction).not.toHaveBeenCalled();
  });

  it('should return 401 if header does not start with Bearer', () => {
    mockReq.headers.authorization = 'Basic token123';
    verifyToken(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'No token provided' });
  });

  it('should return 401 if token is invalid or expired', () => {
    mockReq.headers.authorization = 'Bearer invalid-token';
    verifyToken(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
  });

  it('should return 401 if token is signed with wrong secret', () => {
    const token = jwt.sign({ userId: '12345' }, 'wrong_secret');
    mockReq.headers.authorization = `Bearer ${token}`;

    verifyToken(mockReq, mockRes, nextFunction);

    expect(mockRes.status).toHaveBeenCalledWith(401);
    expect(mockRes.json).toHaveBeenCalledWith({ message: 'Invalid or expired token' });
  });
});
