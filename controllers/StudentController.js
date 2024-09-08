const studentService = require('../services/StudentRepository');

exports.authenticateV1 = async (req, res) => {
  const { numETU, email } = req.body;
  try {
    const result = await studentService.verifyStudentInfos(numETU, email);
    if (result.success) {
      res.status(200).json({
        status: true,
        message: 'Connexion réussie!',
        data: result.studentData
      });
    } else {
      res.status(404).json({
        status: false,
        message: result.message || 'Échec de la connexion. Étudiant non trouvé!'
      });
    }
  } catch (error) {
    res.status(500).json({
      status: false,
      message: 'Vérifier votre identifiant!'
    });
  }
};
