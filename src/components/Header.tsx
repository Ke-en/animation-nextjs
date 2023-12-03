import { useState } from 'react';
import Navigation from './Navigation';
import {menu} from '@/config/navigation.js';

type HeaderProps = {
    title: string
}

const Header: React.FC<HeaderProps> = ({ title }: HeaderProps): React.ReactNode => {
  return <div className='container flex-col bg-white align-itmes justify-content center'>
    <h1 className='text-4xl text-dark text-center p-6 font-weight'>{title}</h1>
    <Navigation menuList={menu} />
    </div>;
};

export default Header;