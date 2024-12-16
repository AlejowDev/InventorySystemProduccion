const db = require("../config/db");

const Loan = {
  create: (loanData, callback) => {
    const sqlLoan = `
      INSERT INTO loans (receivingUser, loanDate, deliveryDate, approval, state, dateRegister) 
      VALUES (?, ?, ?, ?, ?, NOW())
    `;

    db.query(
      sqlLoan,
      [
        loanData.receivingUser,
        loanData.loanDate,
        loanData.deliveryDate,
        loanData.approval,
        loanData.state,
      ],
      (err, result) => {
        if (err) {
          console.error("Error inserting into loans:", err);
          return callback(err);
        }

        const loanId = result.insertId; // ID del préstamo recién creado
        const devices = loanData.devices || [];

        if (devices.length > 0) {
          const sqlGetDeviceNames = `
            SELECT serial, nombre FROM tools WHERE serial IN (?)
          `;

          db.query(sqlGetDeviceNames, [devices], (err, deviceResults) => {
            if (err) {
              console.error("Error fetching device names:", err);
              return callback(err);
            }

            const deviceMap = {};
            deviceResults.forEach((device) => {
              deviceMap[device.serial] = device.nombre;
            });

            const sqlDevices =
              "INSERT INTO loan_devices (loan_id, device_serial, device_name) VALUES ?";
            const values = devices.map((deviceSerial) => [
              loanId,
              deviceSerial,
              deviceMap[deviceSerial] || null,
            ]);

            db.query(sqlDevices, [values], (err) => {
              if (err) {
                console.error("Error inserting into loan_devices:", err);
                return callback(err);
              }
              callback(null, result);
            });
          });
        } else {
          callback(null, result);
        }
      }
    );
  },

  findAll: (callback) => {
    const query = `
      SELECT 
        loans.id, 
        loans.loanDate, 
        loans.deliveryDate, 
        loans.approval, 
        loans.state,
        loans.dateRegister, -- Agregamos la columna dateRegister
        GROUP_CONCAT(loan_devices.device_serial) AS devices,
        GROUP_CONCAT(loan_devices.device_name) AS deviceNames, 
        receivingUser.document AS receivingUser, 
        receivingUser.name AS receivingUserName,
        receivingUser.phone AS receivingUserPhone,
        receivingUser.studentNumber AS receivingUserStudentNumber
      FROM loans
      LEFT JOIN loan_devices ON loans.id = loan_devices.loan_id
      JOIN users AS receivingUser ON loans.receivingUser = receivingUser.document
      GROUP BY loans.id;
    `;

    db.query(query, (err, results) => {
      if (err) {
        console.error("Error fetching loans:", err);
        return callback(err);
      }
      callback(null, results);
    });
  },

  delete: (id, callback) => {
    db.beginTransaction((err) => {
      if (err) return callback(err);

      const deleteDevicesSql = "DELETE FROM loan_devices WHERE loan_id = ?";
      db.query(deleteDevicesSql, [id], (err, result) => {
        if (err) {
          return db.rollback(() => callback(err));
        }

        const deleteLoanSql = "DELETE FROM loans WHERE id = ?";
        db.query(deleteLoanSql, [id], (err, result) => {
          if (err) {
            return db.rollback(() => callback(err));
          }

          db.commit((err) => {
            if (err) {
              return db.rollback(() => callback(err));
            }
            callback(null, result);
          });
        });
      });
    });
  },

  update: (id, loanData, callback) => {
    const sql = "UPDATE loans SET approval = ?, state = ? WHERE id = ?";

    db.query(
      sql,
      [
        loanData.approval,
        loanData.state,
        id,
      ],
      (err, result) => {
        if (err) return callback(err);

        let sqlUpdateDeviceState = "";
        if (loanData.state === "Ocupado") {
          sqlUpdateDeviceState = `
            UPDATE tools 
            SET estado = 'Ocupado' 
            WHERE serial IN (
              SELECT device_serial FROM loan_devices WHERE loan_id = ?
            )
          `;
        } else if (loanData.state === "Disponible") {
          sqlUpdateDeviceState = `
            UPDATE tools 
            SET estado = 'Disponible' 
            WHERE serial IN (
              SELECT device_serial FROM loan_devices WHERE loan_id = ?
            )
          `;
        }

        if (sqlUpdateDeviceState) {
          db.query(sqlUpdateDeviceState, [id], (err) => {
            if (err) {
              return callback(err);
            }
            callback(null, result);
          });
        } else {
          callback(null, result);
        }
      }
    );
  },

  findNextAvailableDateForDevice: (serial, callback) => {
    const query = `
      SELECT loans.deliveryDate FROM loans
      JOIN loan_devices ON loan_devices.loan_id = loans.id
      WHERE loan_devices.device_serial = ? AND loans.state = 'Ocupado'
      ORDER BY loans.deliveryDate DESC
      LIMIT 1
    `;

    db.query(query, [serial], (err, results) => {
      if (err) {
        console.error("Error fetching nextAvailableDate:", err);
        return callback(err);
      }

      if (results.length === 0) {
        // No hay préstamos ocupados
        return callback(null, null);
      }

      const { deliveryDate } = results[0];
      callback(null, deliveryDate);
    });
  }
};

module.exports = Loan;