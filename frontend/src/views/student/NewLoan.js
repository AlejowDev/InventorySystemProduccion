import React, { useEffect, useState } from 'react'
import axios from 'axios'
import Swal from 'sweetalert2'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton } from '@coreui/react'

const NewLoan = () => {
  const [devices, setDevices] = useState([])
  const [cart, setCart] = useState([])
  const [error, setError] = useState(null)
  const [loanDate, setLoanDate] = useState('') // Fecha de préstamo seleccionada
  const [deliveryDate, setDeliveryDate] = useState('') // Fecha de entrega seleccionada

  useEffect(() => {
    fetchDevices()
  }, [])

  const fetchDevices = () => {
    axios
      .get('http://localhost:8081/api/tools')
      .then((response) => {
        setDevices(response.data)
      })
      .catch((error) => {
        console.error('Error fetching devices:', error)
        setError('Error al cargar los dispositivos.')
      })
  }

  const handleAddToCart = (device) => {
    const hasScheduled = cart.some((item) => item.requestedState === 'Por Agendar')
    if (hasScheduled) {
      Swal.fire(
        'Advertencia',
        'Ya tienes un dispositivo "Por Agendar" en el carrito. Debes vaciarlo antes de añadir otro.',
        'warning',
      )
      return
    }
    const deviceWithState = { ...device, requestedState: 'Disponible' }
    setCart((prevCart) => [...prevCart, deviceWithState])
    Swal.fire('Éxito', `${device.nombre} ha sido añadido al carrito.`, 'success')
  }

  const handleScheduleDevice = (device) => {
    if (cart.length > 0) {
      Swal.fire(
        'Advertencia',
        'Solo puedes agendar un dispositivo a la vez. Vacía el carrito primero.',
        'warning',
      )
      return
    }

    // Consultar la fecha de disponibilidad del dispositivo desde la tabla loans
    axios
      .get(`http://localhost:8081/api/loans/nextAvailableDate/${device.serial}`)
      .then((response) => {
        const { nextAvailableDate } = response.data
        // Si nextAvailableDate es null, significa que no se encontró préstamo ocupado, debería estar disponible ahora
        const deviceWithState = {
          ...device,
          requestedState: 'Por Agendar',
          nextAvailableDate: nextAvailableDate || '',
        }
        setCart([deviceWithState])
        Swal.fire('Éxito', `${device.nombre} ha sido agendado.`, 'success')
      })
      .catch((error) => {
        console.error('Error fetching next available date:', error)
        Swal.fire(
          'Error',
          'No se pudo obtener la fecha de disponibilidad del dispositivo.',
          'error',
        )
      })
  }

  const handleRemoveFromCart = (index) => {
    setCart((prevCart) => {
      const newCart = [...prevCart]
      newCart.splice(index, 1)
      return newCart
    })
  }

  const handleRequestLoan = () => {
    if (!loanDate || !deliveryDate) {
      Swal.fire(
        'Advertencia',
        'Por favor, completa tanto la fecha de préstamo como la fecha de entrega antes de solicitar el préstamo.',
        'warning',
      )
      return
    }

    const formatDateToDatabase = (date) => {
      const options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }
      return new Date(date).toLocaleString('sv-SE', options).replace(' ', 'T')
    }

    const receivingUser = localStorage.getItem('document')

    const hasScheduling = cart.some((device) => device.requestedState === 'Por Agendar')
    const finalState = hasScheduling ? 'Por Agendar' : 'Disponible'

    const loanData = {
      receivingUser: receivingUser,
      loanDate: formatDateToDatabase(loanDate),
      deliveryDate: formatDateToDatabase(deliveryDate),
      approval: 'Pendiente',
      state: finalState,
      devices: cart.map((device) => device.serial),
    }

    axios
      .post('http://localhost:8081/api/loans', loanData)
      .then((response) => {
        Swal.fire('Éxito', 'Préstamo solicitado con éxito.', 'success')
        setCart([])
        setLoanDate('')
        setDeliveryDate('')
      })
      .catch((error) => {
        console.error('Error requesting loan:', error)
        Swal.fire('Error', 'Hubo un problema al solicitar el préstamo.', 'error')
      })
  }

  const scheduledDevice = cart.find((device) => device.requestedState === 'Por Agendar')
  const minLoanDate =
    scheduledDevice && scheduledDevice.nextAvailableDate ? scheduledDevice.nextAvailableDate : ''

  return (
    <>
      <CCol xs>
        <CCard className="mb-4">
          <CCardHeader>
            <div className="d-flex justify-content-between">
              <span>Nuevo préstamo</span>
            </div>
          </CCardHeader>
          <CCardBody>
            <CRow className="mt-4 mb-4">
              <CCol xs>
                <CCard>
                  <CCardHeader className="text-center">
                    <h5>Mi Carrito</h5>
                  </CCardHeader>
                  <CCardBody>
                    {cart.length === 0 ? (
                      <div className="text-center">
                        <p>No hay productos en el carrito.</p>
                      </div>
                    ) : (
                      <div>
                        <table className="table table-striped text-center">
                          <thead>
                            <tr>
                              <th>Dispositivo</th>
                              <th>Descripción</th>
                              <th>Estado Solicitado</th>
                              <th>Acción</th> {/* Nueva columna */}
                            </tr>
                          </thead>
                          <tbody>
                            {cart.map((item, index) => (
                              <tr key={index}>
                                <td>{item.nombre}</td>
                                <td>{item.descripcion || 'Descripción no disponible'}</td>
                                <td>{item.requestedState}</td>
                                <td>
                                  <CButton
                                    color="danger"
                                    size="sm"
                                    onClick={() => handleRemoveFromCart(index)}
                                  >
                                    X
                                  </CButton>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>

                        <CRow className="mb-4">
                          <CCol xs>
                            <label htmlFor="loanDate">Fecha de Préstamo:</label>
                            <input
                              required
                              type="datetime-local"
                              id="loanDate"
                              className="form-control"
                              value={loanDate}
                              onChange={(e) => setLoanDate(e.target.value)}
                              min={minLoanDate}
                            />
                          </CCol>
                        </CRow>
                        <CRow className="mb-4">
                          <CCol xs>
                            <label htmlFor="deliveryDate">Fecha de Entrega:</label>
                            <input
                              required
                              type="datetime-local"
                              id="deliveryDate"
                              className="form-control"
                              value={deliveryDate}
                              onChange={(e) => setDeliveryDate(e.target.value)}
                            />
                          </CCol>
                        </CRow>
                        <CRow className="mt-4">
                          <CCol xs="auto">
                            <CButton
                              color="primary"
                              onClick={() => {
                                if (!loanDate || !deliveryDate) {
                                  Swal.fire(
                                    'Advertencia',
                                    'Por favor, completa tanto la fecha de préstamo como la fecha de entrega antes de solicitar el préstamo.',
                                    'warning',
                                  )
                                  return
                                }

                                Swal.fire({
                                  title: '¿Estás seguro de pedir este préstamo?',
                                  text: 'No podrás eliminar la solicitud una vez enviada.',
                                  icon: 'warning',
                                  showCancelButton: true,
                                  confirmButtonColor: '#3085d6',
                                  cancelButtonColor: '#d33',
                                  confirmButtonText: 'Sí, solicitar',
                                  cancelButtonText: 'Cancelar',
                                }).then((result) => {
                                  if (result.isConfirmed) {
                                    handleRequestLoan()
                                  }
                                })
                              }}
                              disabled={cart.length === 0}
                            >
                              Pedir Préstamo
                            </CButton>
                          </CCol>
                        </CRow>
                      </div>
                    )}
                  </CCardBody>
                </CCard>
              </CCol>
            </CRow>
            {error && (
              <CRow className="mb-4">
                <CCol xs>
                  <div className="alert alert-danger">{error}</div>
                </CCol>
              </CRow>
            )}
            <CRow>
              {devices.map((device) => (
                <CCol xs={12} sm={6} md={4} lg={3} key={device.serial} className="mb-4">
                  <CCard>
                    <CCardHeader className="text-center">{device.nombre}</CCardHeader>
                    <CCardBody className="text-center">
                      {device.imagen ? (
                        <img
                          src={`http://localhost:8081/${device.imagen}`}
                          alt={device.nombre}
                          style={{ width: '140px', height: '130px' }}
                        />
                      ) : (
                        <div>No hay imagen disponible</div>
                      )}
                      <p className="mt-2">{device.descripcion || 'Descripción no disponible'}</p>
                      {device.estado === 'Ocupado' ? (
                        <>
                          <CButton color="secondary" disabled className="me-2">
                            Ocupado
                          </CButton>
                          <CButton color="primary" onClick={() => handleScheduleDevice(device)}>
                            Agendar
                          </CButton>
                        </>
                      ) : (
                        <CButton color="primary" onClick={() => handleAddToCart(device)}>
                          Añadir al Carrito
                        </CButton>
                      )}
                    </CCardBody>
                  </CCard>
                </CCol>
              ))}
            </CRow>
          </CCardBody>
        </CCard>
      </CCol>
    </>
  )
}

export default NewLoan
