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