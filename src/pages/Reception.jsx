import React from 'react'
import PatientQueue from '../components/PatientQueue'
import ReceptionDashboard from '../components/ReceptionDashBoard'

function Reception() {
  return (
    <div className='grid grid-cols-12 bg-[#f9fbf9] min-h-screen'>
      <div className='col-span-3'>
        <PatientQueue />
      </div>
      <div className='col-span-9'>
        <ReceptionDashboard/>
      </div>
    </div>
  )
}

export default Reception
