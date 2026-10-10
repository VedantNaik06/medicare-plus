// Fake environment so the app can be imported without a real database.
process.env.NODE_ENV = 'test';
process.env.MONGODB_URI = 'mongodb://127.0.0.1:27017/medicare-test-unused';
process.env.JWT_SECRET = 'test-secret-test-secret-test-secret';
process.env.DOSE_GRACE_MINUTES = '60';
