import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Flecha from '../../assets/images/flecha.png'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
  CFormInput,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
} from '@coreui/react'

const StudentLoans = () => {
  const [loans, setLoans] = useState([])
  const userDocument = localStorage.getItem('document')
  const [editingObservations, setEditingObservations] = useState({})
  const [showModal, setShowModal] = useState(false)
  const [currentLoan, setCurrentLoan] = useState(null)

  useEffect(() => {
    refreshLoans()
  }, [])

  const refreshLoans = () => {
    axios
      .get('http://localhost:8081/api/loans')
      .then((response) => {
        const filteredLoans = response.data
          .filter((loan) => loan.receivingUser === userDocument)
          .sort((a, b) => {
            const aIsFinalizado = a.approval === 'Finalizado' ? 1 : 0
            const bIsFinalizado = b.approval === 'Finalizado' ? 1 : 0

            if (aIsFinalizado !== bIsFinalizado) {
              return aIsFinalizado - bIsFinalizado
            }

            return new Date(b.dateRegister) - new Date(a.dateRegister)
          })
        setLoans(filteredLoans)
      })
      .catch((error) => {
        console.error('Error fetching loans:', error)
      })
  }

  const handleObservationChange = (loanId, value) => {
    setEditingObservations((prev) => ({
      ...prev,
      [loanId]: value,
    }))
  }

  const handleSaveObservations = () => {
    if (!currentLoan) return
    const observations = editingObservations[currentLoan.id] || ''
    // Llamar al endpoint para actualizar las observaciones
    axios
      .put(`http://localhost:8081/api/loans/${currentLoan.id}/observations`, {
        equipmentObservations: observations,
      })
      .then((response) => {
        // Actualizar la lista de préstamos
        refreshLoans()
        setShowModal(false)
        setCurrentLoan(null)
      })
      .catch((error) => {
        console.error('Error saving observations:', error)
      })
  }

  const handleOpenModal = (loan) => {
    setCurrentLoan(loan)
    setShowModal(true)
  }

  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>
              <div className="d-flex justify-content-between">
                <span>Mis préstamos</span>
              </div>
            </CCardHeader>
            <CCardBody>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap text-center">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary"></CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">
                      Serial Dispositivos
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">
                      Nombres Dispositivos
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">
                      Fecha de Préstamo
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">
                      Fecha de Entrega
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Aprobación</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">
                      Estado dispositivo
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">
                      ¿Como recibio el equipo?
                    </CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody className="text-nowrap text-center">
                  {loans.map((loan) => {
                    const canEdit =
                      loan.approval === 'Aprobado' &&
                      (!loan.equipmentObservations || loan.equipmentObservations.trim() === '')

                    // Si el estado es "Finalizado", aplicamos un fondo gris
                    const isFinalizado = loan.approval === 'Finalizado'

                    return (
                      <CTableRow
                        key={loan.id}
                        style={{
                          backgroundColor: isFinalizado ? '#d3d3d3' : 'transparent', // Fondo gris si finalizado
                        }}
                      >
                        <CTableDataCell style={{ borderColor: 'white' }}>
                          <img
                            src={Flecha}
                            alt="flecha"
                            style={{ width: '20px', height: '20px', filter: 'invert(100%)' }}
                          />
                        </CTableDataCell>

                        <CTableDataCell style={{ borderColor: 'white' }}>
                          {Array.isArray(loan.devices) ? (
                            <ol className="text-start m-0 p-0">
                              {loan.devices.map((serial, index) => (
                                <li key={index} style={{ listStylePosition: 'inside' }}>
                                  {serial}
                                </li>
                              ))}
                            </ol>
                          ) : (
                            'N/A'
                          )}
                        </CTableDataCell>
                        <CTableDataCell style={{ borderColor: 'white' }}>
                          {loan.deviceNames ? (
                            <ol className="text-start m-0 p-0">
                              {loan.deviceNames.split(',').map((nombre, index) => (
                                <li key={index} style={{ listStylePosition: 'inside' }}>
                                  {nombre.trim()}
                                </li>
                              ))}
                            </ol>
                          ) : (
                            'N/A'
                          )}
                        </CTableDataCell>
                        <CTableDataCell style={{ borderColor: 'white' }}>
                          {new Date(loan.loanDate).toLocaleString('es-CO', {
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric',
                            hour12: true,
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </CTableDataCell>
                        <CTableDataCell style={{ borderColor: 'white' }}>
                          {new Date(loan.deliveryDate).toLocaleString('es-CO', {
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric',
                            hour12: true,
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })}
                        </CTableDataCell>
                        <CTableDataCell
                          style={{
                            borderColor: 'white',
                            color:
                              loan.approval === 'Finalizado'
                                ? 'gray'
                                : loan.approval === 'Aprobado' || loan.approval === 'En uso'
                                  ? '#0cff00'
                                  : loan.approval === 'Pendiente'
                                    ? '#007cff'
                                    : '#ff0000',
                          }}
                        >
                          {loan.approval}
                        </CTableDataCell>

                        <CTableDataCell
                          style={{
                            borderColor: 'white',
                            color:
                              loan.state === 'Por Agendar'
                                ? '#ffb200'
                                : loan.state === 'Ocupado'
                                  ? 'gray'
                                  : loan.state === 'Entregado en buen estado'
                                    ? 'gray'
                                    : loan.state === 'Entregado en mal estado'
                                      ? 'red'
                                      : loan.state === 'Disponible'
                                        ? '#0cff00'
                                        : '#0cff00', // Color por defecto si el estado no coincide con ninguno
                          }}
                        >
                          {loan.state}
                        </CTableDataCell>
                        <CTableDataCell style={{ borderColor: 'white' }}>
                          {canEdit ? (
                            <div>
                              <p
                                style={{
                                  color: '#0cff00',
                                  fontWeight: 'bold',
                                  margin: '5px 0',
                                  textAlign: 'center',
                                }}
                              >
                                ¡Tu préstamo fue aprobado!
                              </p>
                              <CButton
                                color="primary"
                                onClick={() => {
                                  setEditingObservations((prev) => ({
                                    ...prev,
                                    [loan.id]: '',
                                  }))
                                  handleOpenModal(loan)
                                }}
                              >
                                Marcar estado del dispositivo
                              </CButton>
                            </div>
                          ) : (
                            <CFormInput
                              type="text"
                              value={loan.equipmentObservations || ''}
                              disabled
                              style={{
                                textAlign: 'center',
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                              }}
                            />
                          )}
                        </CTableDataCell>
                      </CTableRow>
                    )
                  })}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      {/* Modal para agregar observaciones */}
      <CModal visible={showModal} onClose={() => setShowModal(false)}>
        <CModalHeader>
          <CModalTitle>¿Como recibiste el dispositivo?</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {currentLoan && (
            <CFormInput
              type="text"
              value={editingObservations[currentLoan.id] || ''}
              onChange={(e) => handleObservationChange(currentLoan.id, e.target.value)}
              placeholder="Ingresa las observaciones"
            />
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setShowModal(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleSaveObservations}>
            Guardar
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default StudentLoans
