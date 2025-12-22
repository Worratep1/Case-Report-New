import React from 'react';
import Logoplaypark1 from '../assets/Logoplaypark1.png';
//  รับ props { username } เข้ามาตรงนี้
export default function HeaderTitle({ username }) {
  return (
    <div className="text-center mb-8">
        <img 
          src={Logoplaypark1} 
          alt="System Logo" 
          className="h-24 md:h-32 lg:h-40 mx-auto mb-1 object-contain "/>
          

      
      <h1 className="text-xl md:text-2xl font-bold text-slate-800 dark:text-white mb-1">
        NOC Report System
      </h1>
      
      
      <p className="text-slate-500 dark:text-slate-400 font-medium">
        ยินดีต้อนรับ คุณ <span className="text-blue-600/100 dark:text-sky-400/100 ">{username} </span>
      </p>
    </div>
  );
}