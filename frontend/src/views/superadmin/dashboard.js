import React, { useEffect, useState } from 'react'
import axios from 'axios'

import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
} from '@coreui/react'
import backgroundImage from '../../assets/images/superadmin1.jpg'

const SuperAdminDashboard = () => {
  return (
    <>
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader className="text-center">¡Bienvenido Super Administrador!</CCardHeader>
            <CCardBody className="text-center">
              <img src={backgroundImage} alt="Imagen de bienvenida" className="img-fluid" />
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}

export default SuperAdminDashboard
