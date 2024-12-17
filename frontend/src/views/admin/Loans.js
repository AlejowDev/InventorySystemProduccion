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
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CFormSelect,
} from '@coreui/react'
import Swal from 'sweetalert2'
import CIcon from '@coreui/icons-react'
import { cilPencil, cilTrash, cilSpreadsheet } from '@coreui/icons'
import { saveAs } from 'file-saver'
import * as XLSX from 'xlsx'

const AdminLoans = () => {
  const [loans, setLoans] = useState([])
  const [modalVisible, setModalVisible] = useState(false)
  const [selectedLoan, setSelectedLoan] = useState(null)
  const [approval, setApproval] = useState('')
  const [state, setState] = useState('')

  // Nuevos estados para los filtros
  const [approvalFilter, setApprovalFilter] = useState('')
  const [stateFilter, setStateFilter] = useState('')

  useEffect(() => {
    refreshLoans()
  }, [])

  const refreshLoans = () => {
    axios
      .get('http://localhost:8081/api/loans')
      .then((response) => {
        const sortedLoans = response.data.sort((a, b) => {
          const aIsFinalizado = a.approval === 'Finalizado' ? 1 : 0
          const bIsFinalizado = b.approval === 'Finalizado' ? 1 : 0
        
          // Primero separar finalizados de no finalizados
          if (aIsFinalizado !== bIsFinalizado) {
            return aIsFinalizado - bIsFinalizado
          }
        
          // Si ambos son igual respecto a finalizado, ordena por fecha
          return new Date(b.dateRegister) - new Date(a.dateRegister)
        })
        setLoans(sortedLoans)
      })
      .catch((error) => {
        console.error('Error fetching loans:', error)
      })
  }

  const handleUpdateClick = (loan) => {
    setSelectedLoan(loan)
    setApproval(loan.approval)
    setState(loan.state)
    setModalVisible(true)
  }

  const handleUpdateSubmit = () => {
    if (!selectedLoan) return

    const updatedLoanData = {
      approval,
      state,
    }

    Swal.fire({
      title: '¿Estás seguro de que deseas actualizar este préstamo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, actualizar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .put(`http://localhost:8081/api/loans/${selectedLoan.id}`, updatedLoanData)
          .then((response) => {
            refreshLoans()
            setModalVisible(false)
            Swal.fire('Actualizado!', 'El préstamo ha sido actualizado.', 'success')
          })
          .catch((error) => {
            console.error('Error updating loan:', error)
            Swal.fire('Error!', 'Ocurrió un error al actualizar el préstamo.', 'error')
          })
      }
    })
  }

  const handleDelete = (id) => {
    Swal.fire({
      title: '¿Estás seguro de que deseas eliminar este préstamo?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Sí, eliminar',
      cancelButtonText: 'Cancelar',
    }).then((result) => {
      if (result.isConfirmed) {
        axios
          .delete(`http://localhost:8081/api/loans/${id}`)
          .then((response) => {
            console.log('Préstamo eliminado:', response.data)
            refreshLoans()
            Swal.fire('Eliminado!', 'El préstamo ha sido eliminado.', 'success')
          })
          .catch((error) => {
            console.error('Error deleting loan:', error)
            Swal.fire('Error!', 'Ocurrió un error al eliminar el préstamo.', 'error')
          })
      }
    })
  }

  const handleExport = () => {
    const exportData = loans.map((loan) => {
      return {
        'Serial Dispositivos': Array.isArray(loan.devices) ? loan.devices.join(', ') : 'N/A',
        'Nombres Dispositivos': loan.deviceNames ? loan.deviceNames : 'N/A',
        'Número Documento': loan.receivingUser,
        'Nombre Estudiante': loan.receivingUserName,
        'Número Celular': loan.receivingUserPhone,
        'Código Estudiantil': loan.receivingUserStudentNumber,
        'Fecha Registro': new Date(loan.dateRegister).toLocaleString('es-CO', {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        'Fecha de Préstamo': new Date(loan.loanDate).toLocaleString('es-CO', {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        'Fecha de Entrega': new Date(loan.deliveryDate).toLocaleString('es-CO', {
          hour: 'numeric',
          minute: 'numeric',
          second: 'numeric',
          hour12: true,
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
        }),
        Observaciones: loan.equipmentObservations || '',
        Aprobación: loan.approval,
        Estado: loan.state,
      }
    })

    const worksheet = XLSX.utils.json_to_sheet(exportData)
    const workbook = XLSX.utils.book_new()
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Préstamos')

    const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' })

    const data = new Blob([excelBuffer], { type: 'application/octet-stream' })
    saveAs(data, 'prestamos.xlsx')
  }

  // Filtrar los préstamos basados en los filtros seleccionados
  const filteredLoans = loans.filter((loan) => {
    const matchApproval = approvalFilter === '' || loan.approval === approvalFilter
    const matchState = stateFilter === '' || loan.state === stateFilter
    return matchApproval && matchState
  })

  return (
    <CRow>
      <CCol xs>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between align-items-center">
              <span>Agenda de préstamos</span>
              <div>
                <CButton color="success" onClick={handleExport} className="text-white me-2">
                  <CIcon icon={cilSpreadsheet} className="me-2" />
                  Exportar
                </CButton>
              </div>
            </div>
          </CCardHeader>
          <CCardBody>
            {/* Filtros */}
            <CRow className="mb-3">
              <CCol xs={12} md={6}>
                <CFormSelect
                  value={approvalFilter}
                  onChange={(e) => setApprovalFilter(e.target.value)}
                  aria-label="Filtrar por aprobación"
                  className="mb-2"
                >
                  <option value="">Filtrar por Aprobación (Todos)</option>
                  <option value="Pendiente">Pendiente</option>
                  <option value="Aprobado">Aprobado</option>
                  <option value="Rechazado">Rechazado</option>
                  <option value="En uso">En uso</option>
                  <option value="Finalizado">Finalizado</option>
                </CFormSelect>
              </CCol>
              <CCol xs={12} md={6}>
                <CFormSelect
                  value={stateFilter}
                  onChange={(e) => setStateFilter(e.target.value)}
                  aria-label="Filtrar por Estado"
                  className="mb-2"
                >
                  <option value="">Filtrar por Estado (Todos)</option>
                  <option value="Disponible">Disponible</option>
                  <option value="Entregado en buen estado">Entregado en buen estado</option>
                  <option value="Entregado en mal estado">Entregado en mal estado</option>
                  <option value="Ocupado">Ocupado</option>
                  <option value="Por Agendar">Por Agendar</option>
                </CFormSelect>
              </CCol>
            </CRow>

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
                  <CTableHeaderCell className="bg-body-tertiary">Numero documento</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary">
                    Nombre estudiante
                  </CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary">Numero celular</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary">
                    Codigo estudiantil
                  </CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary">Fecha Registro</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary">
                    Fecha de Préstamo
                  </CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary">Fecha de Entrega</CTableHeaderCell>
                  {/* Nueva columna de Observaciones */}
                  <CTableHeaderCell className="bg-body-tertiary">Observaciones</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary">Aprobación</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary">Estado</CTableHeaderCell>
                  <CTableHeaderCell className="bg-body-tertiary">Acciones</CTableHeaderCell>
                </CTableRow>
              </CTableHead>
              <CTableBody className="text-nowrap text-center">
                {filteredLoans.map((loan) => (
                  <CTableRow key={loan.id}>
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
                      {loan.receivingUser}
                    </CTableDataCell>
                    <CTableDataCell style={{ borderColor: 'white' }}>
                      {loan.receivingUserName}
                    </CTableDataCell>
                    <CTableDataCell style={{ borderColor: 'white' }}>
                      {loan.receivingUserPhone}
                    </CTableDataCell>
                    <CTableDataCell style={{ borderColor: 'white' }}>
                      {loan.receivingUserStudentNumber}
                    </CTableDataCell>
                    <CTableDataCell style={{ borderColor: 'white' }}>
                      {loan.dateRegister
                        ? new Date(loan.dateRegister).toLocaleString('es-CO', {
                            hour: 'numeric',
                            minute: 'numeric',
                            second: 'numeric',
                            hour12: true,
                            day: '2-digit',
                            month: '2-digit',
                            year: 'numeric',
                          })
                        : 'N/A'}
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
                    {/* Mostrar observaciones */}
                    <CTableDataCell
                      style={{
                        borderColor: 'white',
                        whiteSpace: 'normal',
                        wordBreak: 'break-word',
                      }}
                    >
                      {loan.equipmentObservations || 'N/A'}
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
                      <CButton
                        className="custom-btn-edit me-2"
                        size="sm"
                        onClick={() => handleUpdateClick(loan)}
                      >
                        <CIcon icon={cilPencil} />
                      </CButton>
                      <CButton
                        className="custom-btn-delete me-2"
                        size="sm"
                        onClick={() => handleDelete(loan.id)}
                      >
                        <CIcon icon={cilTrash} />
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>

      {/* Modal para actualizar préstamo */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Actualizar Préstamo</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {selectedLoan && (
            <div>
              <CFormSelect
                label="Aprobación"
                value={approval}
                onChange={(e) => setApproval(e.target.value)}
              >
                <option disabled>Seleccione aprobación</option>
                <option value="Pendiente">Pendiente</option>
                <option value="Aprobado">Aprobado</option>
                <option value="Rechazado">Rechazado</option>
                <option value="En uso">En uso</option>
                <option value="Finalizado">Finalizado</option>
              </CFormSelect>

              <CFormSelect label="Estado" value={state} onChange={(e) => setState(e.target.value)}>
                <option disabled>Seleccione estado</option>
                <option value="Disponible">Disponible</option>
                <option value="Entregado en buen estado">Entregado en buen estado</option>
                <option value="Entregado en mal estado">Entregado en mal estado</option>
                <option value="Ocupado">Ocupado</option>
                <option value="Por Agendar">Por Agendar</option>
              </CFormSelect>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Cancelar
          </CButton>
          <CButton color="primary" onClick={handleUpdateSubmit}>
            Guardar cambios
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default AdminLoans
