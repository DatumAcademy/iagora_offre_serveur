const axios = require('axios');
var { Student } = require("../models/Student");
const jwt = require('jsonwebtoken');
const configuration = require('../configuration/SECRET');
const bcrypt = require('bcrypt');

exports.insertStudentAfterLogin = async (studentData) => {
    try {
       const existingStudent = await Student.findOne({ numETU: studentData.numETU, email: studentData.email });
  
        if (existingStudent) {
            return {
            success: false,
            message: 'Étudiant déjà inscris!'
            };
        }

        const newStudent = new Student({
            numETU: studentData.numETU,
            first_name: studentData.first_name || '',
            last_name: studentData.last_name || '',
            password: '',
            age: 0,
            email: studentData.email || '',
            gender: studentData.gender || '',
            skills: [],
            language: [],
            experience: [],
            diploma : studentData.diploma || []
        });
  
        await newStudent.save();
    
        return {
            success: true,
            message: 'Étudiant inséré avec succès!',
            data: newStudent
        };
    } catch (error) {
        return {
            success: false,
            message: error.message
        };
    }
};

exports.verifyStudentInfos = async (numETU, email) => {
  try {
    const url = `https://estia-statique-serveur.onrender.com/students/${numETU}/${email}`;
    
    const response = await axios.get(url);

    if (response.data.status) {
      return {
        success: true,
        studentData: response.data.data
      };
    } else {
      return {
        success: false,
        message: response.data.data
      };
    }
  } catch (error) {
    return {
      success: false,
      message: 'Erreur lors de la vérification de l\'étudiant'
    };
  }
};

exports.completeRegistration = async (numETU, email, updateData) => {
  try {
    const student = await Student.findOne({ numETU: numETU,email:email });

    if (!student) {
      return {
        success: false,
        message: 'Étudiant non trouvé!'
      };
    }

    const hashedPassword = await bcrypt.hash(updateData.password, 10);

    student.password = hashedPassword || student.password || "";
    student.age = updateData.age || student.age || 0;
    student.skills = student.skills.concat(updateData.skills || []);
    student.language = student.language.concat(updateData.language || []);
    student.experience = student.experience.concat(updateData.experience || []);

    await student.save();

    return {
      success: true,
      message: 'Inscription complétée avec succès.',
      data: student
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erreur lors de la mise à jour de l\'étudiant : ' + error.message
    };
  }
};

exports.loginStudent = async (numETU, email, password) => {
  try {
    const student = await Student.findOne({ numETU: numETU, email: email });

    if (!student) {
      return {
        success: false,
        message: 'Étudiant non trouvé!'
      };
    }

    const isPasswordValid = await bcrypt.compare(password, student.password);
    if (!isPasswordValid) {
      return {
        success: false,
        message: 'Mot de passe incorrect!'
      };
    }

    const token = jwt.sign(
      { id: student._id, numETU: student.numETU, email: student.email },
      configuration.secret,
      { expiresIn: configuration.time }
    );

    return {
      success: true,
      message: 'Authentification réussie',
      token: token,
      student: {
        id: student._id,
        numETU: student.numETU,
        first_name: student.first_name,
        last_name: student.last_name,
        email: student.email
      }
    };
  } catch (error) {
    return {
      success: false,
      message: 'Erreur lors de la connexion de l\'étudiant : ' + error.message
    };
  }
};

exports.getStudent = async (numETU, email) => {
  try {
    const student = await Student.findOne({ numETU: numETU, email: email });

    if (!student) {
      return {
        success: false,
        message: 'Étudiant non trouvé!'
      };
    }

    return {
      success: true,
      student: student
    };

  } catch (error) {
    return {
      success: false,
      message: 'Erreur lors de la récupération de l\'étudiant : ' + error.message
    };
  }
};

exports.getStudents = async (page = 0, pageSize = 10) => {
  const pageNum = Number(page) || 0;
  const pageSizeNum = Number(pageSize) || 10;
  const totalResults = await Student.countDocuments();

  let totalPages = Math.floor(totalResults / pageSizeNum);
  if (totalResults % pageSizeNum !== 0) {
      totalPages += 1;
  }

  const students = await Student.find()
      .skip(pageNum * pageSizeNum)
      .limit(pageSizeNum);

  return {
      totalPages,
      currentPage: pageNum,
      pageSize: pageSizeNum,
      totalResults,
      students,
  };
};


exports.recommandation = async (idStudent) => {
  try {
    const response = await axios.get(`https://iagora-offre-model-recommandation.onrender.com/recommander`, {
      params: {
        student_id: idStudent,
      },
    });

    if (response.status === 200) {
      return {
        success: true,
        studentData: response.data
      };
    } else {
      return {
        success: false,
        message: response.data.message || "Une erreur s'est produite"
      };
    }
  } catch (error) {
    return {
      success: false,
      message: error.response ? error.response.data : 'Erreur lors de la récuperation des offres!'
    };
  }
};
