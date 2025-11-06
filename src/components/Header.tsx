type HeaderProps = {
    title: string
}

const Header: React.FC<HeaderProps> = ({ title }: HeaderProps): React.ReactNode => {
  return <div className='flex-col bg-white align-items justify-content center'>
    <h1 className='text-4xl text-dark text-center p-6 font-weight'>{title}</h1>
    </div>;
};

export default Header;