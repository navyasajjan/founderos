import Person from '../models/people.modle.js';
import Role from '../models/roles.model.js';

export const PeopleService = {
  getPeople: async () => {
    return Person.find().populate('roleId');
  },

  getRoles: async () => {
    return Role.find();
  },

  createPerson: async (data) => {
    const person = new Person(data);
    return person.save();
  },

  updatePerson: async (id, data) => {
    return Person.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );
  },

  deletePerson: async (id) => {
    await Person.findByIdAndDelete(id);
    return true;
  },

  createRole: async (data) => {
    const role = new Role(data);
    return role.save();
  },

  updateRole: async (id, data) => {
    return Role.findByIdAndUpdate(
      id,
      { ...data },
      { new: true }
    );
  },

  deleteRole: async (id) => {
    await Role.findByIdAndDelete(id);
    return true;
  }
};
