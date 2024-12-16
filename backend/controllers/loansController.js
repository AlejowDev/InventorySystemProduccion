const Loan = require('../models/loanModel');

// Obtener todos los préstamos
const getAllLoans = (req, res) => {
    Loan.findAll((err, loans) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        // Opcionalmente, puedes formatear los dispositivos como array si lo prefieres
        const formattedLoans = loans.map(loan => ({
            ...loan,
            devices: loan.devices ? loan.devices.split(',') : [] // Convertir la lista de dispositivos en array
        }));
        res.json(formattedLoans);
    });
};

// Crear un nuevo préstamo
const createLoan = (req, res) => {
    const loanData = {
        devices: req.body.devices,
        receivingUser: req.body.receivingUser,
        loanDate: req.body.loanDate,
        deliveryDate: req.body.deliveryDate,
        approval: req.body.approval,
        state: req.body.state,
    };

    Loan.create(loanData, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        res.status(201).json({ message: 'Loan created successfully', loan: result });
    });
};

// Eliminar un préstamo
const deleteLoan = (req, res) => {
    const loanId = req.params.id; // Obtener el ID del préstamo de los parámetros

    Loan.delete(loanId, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Loan not found' });
        }
        res.status(200).json({ message: 'Loan deleted successfully' });
    });
};

// Actualizar un préstamo
const updateLoan = (req, res) => {
    const loanId = req.params.id; // Obtener el ID del préstamo de los parámetros
    const loanData = {
        approval: req.body.approval,
        state: req.body.state,
    };

    Loan.update(loanId, loanData, (err, result) => {
        if (err) {
            return res.status(500).json({ error: err.message });
        }
        if (result.affectedRows === 0) {
            return res.status(404).json({ message: 'Loan not found' });
        }
        res.status(200).json({ message: 'Loan updated successfully' });
    });
};

// Obtener la próxima fecha de disponibilidad para un dispositivo
const getNextAvailableDateForDevice = (req, res) => {
    const { serial } = req.params;

    Loan.findNextAvailableDateForDevice(serial, (err, nextAvailableDate) => {
        if (err) {
            console.error('Error fetching nextAvailableDate:', err);
            return res.status(500).json({ error: 'Internal Server Error' });
        }

        if (!nextAvailableDate) {
            // No hay préstamos ocupados, el dispositivo está disponible ya mismo
            return res.json({ nextAvailableDate: null });
        }

        // nextAvailableDate viene de la BD (ejemplo: "2024-12-20 10:00:00")
        // Convertir a formato "YYYY-MM-DDTHH:MM"
        const dateObj = new Date(nextAvailableDate);

        // Asegúrate de que dateObj sea válida
        if (isNaN(dateObj)) {
          // Si por alguna razón no es una fecha válida
          return res.json({ nextAvailableDate: null });
        }

        // Formatear: año-mes-diaThora:minutos
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        const hours = String(dateObj.getHours()).padStart(2, '0');
        const minutes = String(dateObj.getMinutes()).padStart(2, '0');

        const formattedDate = `${year}-${month}-${day}T${hours}:${minutes}`;

        res.json({ nextAvailableDate: formattedDate });
    });
};


module.exports = {
    getAllLoans,
    createLoan,
    deleteLoan,
    updateLoan,
    getNextAvailableDateForDevice // Exportar la nueva función
};
