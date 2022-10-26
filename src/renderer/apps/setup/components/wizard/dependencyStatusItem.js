import React, { useState } from 'react'
import { Link } from "react-router-dom";
import GreenIcon from "../../../../../../assets/images/green.svg"
import RedIcon from "../../../../../../assets/images/red.svg"


const DependencyStatusItem = (props) => {
    const { title, active } = props;
    return (
        <div className='flex p-1'>
            {title}:
            <div className='ml-2'>

            {active &&
                <img height={20} width={24} src={GreenIcon} />
            }
            {!active &&
                <img height={20} width={24} src={RedIcon} />
            }
            </div>
        </div>
    )
}

export default DependencyStatusItem;