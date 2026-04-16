const mongoose = require('mongoose');
const Profile = require('./Profile');

describe('Profile Model', () => {
  it('should create a profile object with valid fields', () => {
    const profileData = {
      userId: 'user123',
      name: 'John Doe',
      age: 30,
      weightKg: 75,
      heightCm: 180,
      fitnessGoal: 'build_muscle',
      bio: 'Loves fitness'
    };
    const profile = new Profile(profileData);
    
    expect(profile.userId).toBe(profileData.userId);
    expect(profile.name).toBe(profileData.name);
    expect(profile.age).toBe(profileData.age);
    expect(profile.fitnessGoal).toBe(profileData.fitnessGoal);
  });

  it('should have default fitnessGoal as maintain', () => {
    const profile = new Profile({ userId: 'user123' });
    expect(profile.fitnessGoal).toBe('maintain');
  });

  it('should fail validation if userId is missing', async () => {
    const profile = new Profile({ name: 'No User ID' });
    let err;
    try {
      await profile.validate();
    } catch (error) {
      err = error;
    }
    expect(err.errors.userId).toBeDefined();
  });

  it('should fail validation if fitnessGoal is invalid', async () => {
    const profile = new Profile({ userId: 'user123', fitnessGoal: 'invalid_goal' });
    let err;
    try {
      await profile.validate();
    } catch (error) {
      err = error;
    }
    expect(err.errors.fitnessGoal).toBeDefined();
  });
});
