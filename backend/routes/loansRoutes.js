const express = require('express');
const router = express.Router();
const {
    getAllLoans,
    createLoan,
    deleteLoan,
    updateLoan,
    getNextAvailableDateForDevice // Importar la nueva función de controlador
} = require('../controllers/loansController');

// Obtener todos los préstamos
router.get('/loans', getAllLoans);

// Crear nuevo préstamo
router.post('/loans', createLoan);

// Eliminar un préstamo por ID
router.delete('/loans/:id', deleteLoan);

// Actualizar un préstamo por ID
router.put('/loans/:id', updateLoan);

// Nueva ruta para obtener la próxima fecha disponible de un dispositivo
router.get('/loans/nextAvailableDate/:serial', getNextAvailableDateForDevice);

// Exportar el router
module.exports = router;
