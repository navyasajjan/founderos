
import { PeopleService } from '../services/people.service.js';

export const PeopleController = {
  listPeople: async (req, res) => res.json(await PeopleService.getPeople()),
  createPerson: async (req, res) => res.status(201).json(await PeopleService.createPerson(req.body)),
  updatePerson: async (req, res) => res.json(await PeopleService.updatePerson(req.params.id, req.body)),
  deletePerson: async (req, res) => {
    await PeopleService.deletePerson(req.params.id);
    res.status(204).send();
  },
  listRoles: async (req, res) => res.json(await PeopleService.getRoles()),
  createRole: async (req, res) => res.status(201).json(await PeopleService.createRole(req.body)),
  updateRole: async (req, res) => res.json(await PeopleService.updateRole(req.params.id, req.body)),
  deleteRole: async (req, res) => {
    await PeopleService.deleteRole(req.params.id);
    res.status(204).send();
  }
};
