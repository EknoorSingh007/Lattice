import React from 'react';
import './Skeleton.css';

const Skeleton = ({ className, width, height, circle }) => {
    const style = {
        width: width || '100%',
        height: height || '20px',
        borderRadius: circle ? '50%' : '8px'
    };
    return <div className={`skeleton ${className || ''}`} style={style}></div>;
};

export default Skeleton;
