import React, { useState } from 'react'
import { Link } from "react-router-dom";
import DependencyStatusItem from './dependencyStatusItem';

const Register = () => {
  const [isDependencyCheck, setDependencyCheck] = useState(false);
  const [connectivity, setConnectivity] = useState(null);
  const authorizeRequest = async () => {
    const res = await window.api.send('auth', { action: 'authorize' });
  }

  const check = async () => {
    const res = await window.api.send('connectivity', { action: 'getConnectivity' });
    setConnectivity({ ...res });
    setDependencyCheck(true);
  }

  return (
    <div className='flex justify-center items-center pt-16' >
      <div className='justify-center text-center'>
        {/* Dependency Check */}
        <div className='flex justify-center'>
          <div className='w-1/2'>
            <h1 className='mt-28 text-2xl text-gray-900'>Dependency Check</h1>
            <button onClick={check} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Check</button>
            {isDependencyCheck &&
              <div className='bg-white h-96 overflow-auto p-2 rounded-2xl mt-2' >
                {
                  connectivity && Object.keys(connectivity).map((key) => (
                    <DependencyStatusItem key={key} title={key.toLocaleUpperCase()} active={connectivity[key]} />
                  ))
                }
              </div>
            }
          </div>
        </div>
        <h1 className='text-5xl text-gray-900 mt-2 pt-16'>DCH is now ready to be registered</h1>
        <div className='mb-2 mt-2 text-gray-700'>Press the button below to continue</div>
        {/* <button onClick={authorizeRequest} className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">
        Register
      </button> */}
        <Link to="/authorize" className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded">Regiser</Link>
      </div>
    </div>
  )
}

export default Register
