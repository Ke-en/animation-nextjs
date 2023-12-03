import Link from 'next/link';

type NavProps = {
    menuList: {
        link: string
        title: string
    }[]
}

const Navigation = ({ menuList }:NavProps) => {
  return <nav className='container flex justify-center text-center bg-yellow-300 p-3'>
    {menuList.map((item) => (
        <Link href={item.link} key={item.title}>
           <span className='px-4 py-2 text-primary'>{item.title}</span> 
        </Link>
    ))}
  </nav>;
};

export default Navigation;