import React from 'react';
import Chart from './Chart';
import taipeilogo from './image/taipeilogo.png';
import './Main.css';

const Main = () => {
    return ( 
        <>
            <div className='title'>
                <img src={taipeilogo} alt="Logo" />
                <span>109年人口戶數及性別</span>
            </div>
            <Chart />
        </>
     );
}

export default Main;