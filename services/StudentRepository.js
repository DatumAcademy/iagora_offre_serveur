const axios = require('axios');
var { Student } = require("../models/Student");

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
