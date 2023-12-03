import * as React from 'react';

interface ICandidateProps {
    name: string,
    percent: string
}

const Candidate: React.FunctionComponent<ICandidateProps> = ({name, percent}) => {
  return (
    <div className='container w-1/4 px-24 bg-gray-500'>
        {name}
        {percent}
    </div>
  );
};

export default Candidate;
