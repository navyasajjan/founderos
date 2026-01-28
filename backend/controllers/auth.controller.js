
import { AuthService } from '../services/auth.service.js';
import { CompaniesService } from '../services/companies.service.js';



export const AuthController = {
  // ================= REGISTER =================
  register: async (req, res) => {
 
    try {
    const { email, password, fullName, companyData } = req.body.payload;

      // 1. Check existing user
      const existingUser = await AuthService.findUserByEmail(email);
      if (existingUser) {
        return res.status(400).json({
          error: 'Identity already registered in system.'
        });
      }

      // 2. Hash password
      const passwordHash = await AuthService.hashPassword(password);

      // 3. Create user (MongoDB)
      const newUser = await AuthService.createUser({
        email,
        passwordHash,
        fullName,
        role: 'FOUNDER'
      });
      const newCompanyData = {
  name: companyData.name || 'Default Company',
  entityType: companyData.entityType || 'Private Limited',
  founders: [{ name: fullName, share: 100 }],
  registeredAddress: companyData.registeredAddress || 'Primary Headquarters',
  complianceChecklist: [
    { id: '1', name: 'Initial Filing', status: 'PENDING', deadline: 'T+30 days' }
  ],
  userId: newUser._id
};


const newCompany = await CompaniesService.create(newCompanyData);
   console.log('REGISTER BODY:', newCompany);

      // 4. Generate JWT
      const token = AuthService.generateToken(newUser);

      // 5. Response
      res.status(201).json({
        token,
        user: {
          id: newUser._id,
          email: newUser.email,
          fullName: newUser.fullName,
          role: newUser.role
        }
      });

    } catch (error) {
      console.error('REGISTER ERROR:', error);
      res.status(500).json({
        error: 'Failed to initialize founder identity.'
      });
    }
  },

  // ================= LOGIN =================
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // 1. Find user
      const user = await AuthService.findUserByEmail(email);
      if (!user) {
        return res.status(401).json({
          error: 'Access denied. Invalid credentials.'
        });
      }

      // 2. Verify password
      const isMatch = await AuthService.comparePasswords(
        password,
        user.passwordHash
      );

      if (!isMatch) {
        return res.status(401).json({
          error: 'Access denied. Invalid credentials.'
        });
      }

      // 3. Generate token
      const token = AuthService.generateToken(user);

      res.json({
        token,
        user: {
          id: user._id,
          email: user.email,
          fullName: user.fullName,
          role: user.role
        }
      });

    } catch (error) {
      console.error('LOGIN ERROR:', error);
      res.status(500).json({
        error: 'Security node failure during login.'
      });
    }
  },

  // ================= ME =================
  getMe: (req, res) => {
    res.json(req.user);
  }
};
