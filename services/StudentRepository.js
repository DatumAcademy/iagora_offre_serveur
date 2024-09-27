const axios = require('axios');
var { Student } = require("../models/Student");
const jwt = require('jsonwebtoken');
const configuration = require('../configuration/SECRET');
const bcrypt = require('bcrypt');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

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

const generateCVHTML = (student) => {
  return `
  <!DOCTYPE html>
  <html lang="fr">
  <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>CV - ${student.first_name} ${student.last_name}</title>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css">
      <style>
          @import url('https://fonts.googleapis.com/css2?family=Roboto:wght@400;700&display=swap');
          
          body {
              font-family: 'Roboto', sans-serif;
              margin: 0;
              padding: 0;
              background-color: #f4f4f4;
              color: #333;
          }
          .container {
              max-width: 900px;
              height : 1080px;
              background-color: white;
              display: flex;
              box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
              padding: 20px;
          }
          .sidebar {
              background-color: #2a3e50;
              color: white;
              padding: 30px;
              width: 30%;
          }
          .sidebar h1 {
              font-size: 32px;
              margin: 0;
          }
          .sidebar p {
              margin: 10px 0;
          }
          .sidebar a {
              color: white;
              text-decoration: none;
          }
          .sidebar .icon-text {
              display: flex;
              align-items: center;
              margin: 10px 0;
          }
          .sidebar .icon-text i {
              margin-right: 10px;
          }
          .main-content {
              padding: 30px;
              width: 70%;
          }
          .main-content h2 {
              color: #2a3e50;
              font-size: 24px;
              border-bottom: 2px solid #2a3e50;
              padding-bottom: 5px;
              margin-bottom: 20px;
          }
          .main-content h3 {
              font-size: 18px;
              margin: 10px 0 5px 0;
              font-weight: normal;
          }
          .main-content p {
              margin: 5px 0;
          }
          .skills ul {
              list-style: none;
              padding: 0;
          }
          .skills ul li {
              display: inline-block;
              margin-right: 20px;
          }
          .poste {
              font-weight: bold;
          }
      </style>
  </head>
  <body>
  <div class="container">
      <div class="sidebar">
          <h1>${student.first_name} ${student.last_name}</h1>
          <p class="icon-text"><i class="fas fa-envelope"></i> ${student.email}</p>
          <p class="icon-text"><i class="fas fa-user"></i> ${student.gender}</p>
          <p class="icon-text"><i class="fas fa-birthday-cake"></i> ${student.age} ans</p>
      </div>

      <div class="main-content">
          <h2>EXPÉRIENCE</h2>
          ${student.experience.map(exp => `
              <h3 class="poste">${exp.label}, ${exp.company} (${exp.years})</h3>
              <p>${exp.description}</p>
              <ul>${exp.skills.map(skill => `<li>${skill}</li>`).join('')}</ul>
          `).join('')}

          <h2>DIPLOME</h2>
          ${student.diploma.map(dip => `<p>${dip.label}</p>`).join('')}

          <h2>COMPÉTENCES</h2>
          <div class="skills">
              <ul>${student.skills.map(skill => `<li>${skill}</li>`).join('')}</ul>
          </div>

          <h2>LANGUES</h2>
          <div>
              <p>${student.language.map(lang => `${lang.label} (${lang.level})`).join(', ')}</p>
          </div>
      </div>
  </div>
  </body>
  </html>
  `;
};

exports.generateAndDownloadCV = async (req, res) => {
  try {
      const { numETU, email } = req.params;
      const student = await Student.findOne({ numETU: numETU, email: email });

      if (!student) {
          return res.status(404).json({
              success: false,
              message: "Étudiant non trouvé avec le numéro et l'email fournis."
          });
      }

      const html = generateCVHTML(student);

      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();

      await page.setContent(html, { waitUntil: 'networkidle0' });

      const pdfPath = path.join(__dirname, `../generated/${student.first_name}_${student.last_name}_CV.pdf`);
      if (!fs.existsSync(path.dirname(pdfPath))) {
          fs.mkdirSync(path.dirname(pdfPath), { recursive: true });
      }

      await page.pdf({
          path: pdfPath,
          format: 'A4',
          printBackground: true
      });

      await browser.close();

      res.status(200).json({
          success: true,
          message: 'CV généré avec succès',
          downloadLink: `${req.protocol}://${req.get('host')}/OffreServeur/dw/download/CV/${student.first_name}_${student.last_name}_CV.pdf`
      });
  } catch (error) {
      res.status(500).json({
          success: false,
          message: 'Erreur lors de la génération du CV',
          error: error.message
      });
  }
};

exports.downloadCV = async (req, res) => {
  const { filename } = req.params;
  const filePath = path.join(__dirname, `../generated/${filename}`);
  
  if (fs.existsSync(filePath)) {
      res.download(filePath);
  } else {
      res.status(404).json({
          success: false,
          message: 'Fichier non trouvé'
      });
  }
};