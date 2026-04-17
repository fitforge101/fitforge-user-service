// MockSchema defined at outer scope (SonarQube maintainability requirement)
function MockSchema(definition, options) {
  this.definition = definition;
  this.options = options;
}

// Mock mongoose before importing the model to avoid real DB connections
jest.mock('mongoose', () => ({
  Schema: MockSchema,
  model: jest.fn().mockReturnValue({ mockModel: true }),
}));

const mongoose = require('mongoose');

describe('Profile Model', () => {
  it('should define the Profile schema and export a Mongoose model', () => {
    const Profile = require('./Profile');
    // mongoose.model should have been called with the correct name
    expect(mongoose.model).toHaveBeenCalledWith('Profile', expect.any(Object));
    // module should export the mock model
    expect(Profile).toEqual({ mockModel: true });
  });

  it('should create a schema with the correct fields', () => {
    require('./Profile');
    const schemaDefinition = mongoose.model.mock.calls[0][1].definition;
    expect(schemaDefinition).toHaveProperty('userId');
    expect(schemaDefinition).toHaveProperty('name');
    expect(schemaDefinition).toHaveProperty('age');
    expect(schemaDefinition).toHaveProperty('weightKg');
    expect(schemaDefinition).toHaveProperty('heightCm');
    expect(schemaDefinition).toHaveProperty('fitnessGoal');
    expect(schemaDefinition).toHaveProperty('bio');
  });
});
