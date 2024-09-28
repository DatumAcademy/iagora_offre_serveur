const studentService = require('../services/StudentRepository');

exports.authenticateV1 = async (req, res) => {
    const { numETU, email } = req.body;
    try {
      const result = await studentService.verifyStudentInfos(numETU, email);
      if (result.success) {
        const insertResult = await studentService.insertStudentAfterLogin(result.studentData);
        if (insertResult.success) {
          res.status(200).json({
            status: true,
            message: 'Connexion réussie et étudiant inséré dans la base!',
            data: insertResult.data
          });
        } else {
          res.status(200).json({
            status: true,
            message: 'Connexion réussie, mais ' + insertResult.message
          });
        }
      } else {
        res.status(404).json({
          status: false,
          message: result.message || 'Échec de la connexion. Étudiant non trouvé.'
        });
      }
    } catch (error) {
      res.status(500).json({
        status: false,
        message: 'Erreur lors de la connexion de l\'étudiant'
      });
    }
};

exports.completeRegistration = async (req, res) => {
  const { numETU,email } = req.params;
  const updateData = req.body;

  try {
    const result = await studentService.completeRegistration(numETU,email, updateData);

    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(404).json(result);
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Erreur lors de la complétion de l\'inscription.'
    });
  }
};

exports.loginStudent = async (req, res) => {
  const { numETU, email, password } = req.body;
  try {
    const result = await studentService.loginStudent(numETU, email, password);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Erreur lors de la connexion de l\'étudiant'
    });
  }
};

exports.getStudent = async (req, res) => {
  const { numETU, email} = req.params;
  try {
    const result = await studentService.getStudent(numETU, email);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Erreur lors de la connexion de l\'étudiant'
    });
  }
};

exports.getStudents = async (req, res) => {
  try {
      const { page, pageSize } = req.query;
      const result = await studentService.getStudents(page, pageSize);
      res.status(200).json(result);
  } catch (error) {
      res.status(400).json({ message: error.message });
  }
};


exports.recommandation = async (req, res) => {
  const {id} = req.params;
  try {
    const result = await studentService.recommandation(id);
    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.generateAndDownloadCV = async (req, res) => {
  try {
    const result = await studentService.generateAndDownloadCV(req, res);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
  }
};

exports.telechargerCV = async (req, res) => {
  try {
    const result = await studentService.downloadCV(req, res);
    if (result.success) {
      res.status(200).json(result);
    } else {
      res.status(400).json(result);
    }
  } catch (error) {
  }
};

exports.applyToOfferController = async (req, res) => {
  try {
    const { studentId, offerId } = req.params;
    const result = await studentService.applyToOffer(studentId, offerId);
    
    if (result.success) {
      return res.status(200).json(result);
    } else {
      return res.status(400).json(result);
    }
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la candidature',
      error: error.message
    });
  }
};